package com.airevenue.operator.service.auth;

import com.airevenue.operator.domain.enums.UserRole;
import com.airevenue.operator.domain.model.Membership;
import com.airevenue.operator.domain.model.Tenant;
import com.airevenue.operator.domain.model.User;
import com.airevenue.operator.dto.request.LoginRequest;
import com.airevenue.operator.dto.request.RegisterRequest;
import com.airevenue.operator.dto.response.AuthResponse;
import com.airevenue.operator.dto.response.TenantResponse;
import com.airevenue.operator.dto.response.TokenRefreshResponse;
import com.airevenue.operator.dto.response.UserResponse;
import com.airevenue.operator.repository.MembershipRepository;
import com.airevenue.operator.repository.TenantRepository;
import com.airevenue.operator.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@Transactional
public class AuthService {
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final MembershipRepository membershipRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    public AuthService(UserRepository userRepository, TenantRepository tenantRepository,
                       MembershipRepository membershipRepository, JwtService jwtService,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.membershipRepository = membershipRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .isEmailVerified(false)
                .isActive(true)
                .build();
        user = userRepository.save(user);

        String slug = generateSlug(request.getCompanyName());
        String finalSlug = slug;
        int suffix = 1;
        while (tenantRepository.findBySlug(finalSlug).isPresent()) {
            finalSlug = slug + "-" + suffix++;
        }

        Tenant tenant = Tenant.builder()
                .name(request.getCompanyName())
                .slug(finalSlug)
                .timezone("Asia/Kolkata")
                .currency("INR")
                .aiTone("professional")
                .followUpEnabled(true)
                .isActive(true)
                .build();
        tenant = tenantRepository.save(tenant);

        Membership membership = Membership.builder()
                .tenant(tenant)
                .user(user)
                .role(UserRole.OWNER)
                .isActive(true)
                .build();
        membershipRepository.save(membership);

        String accessToken = jwtService.generateAccessToken(user.getId(), tenant.getId(), UserRole.OWNER.name());
        String refreshToken = jwtService.generateRefreshToken(user.getId());

        return buildAuthResponse(user, tenant, accessToken, refreshToken);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        if (!user.isActive()) {
            throw new IllegalArgumentException("Account is disabled");
        }

        Membership membership = membershipRepository.findByUserIdAndIsActiveTrue(user.getId())
                .stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("No tenant associated with this account"));

        Tenant tenant = tenantRepository.findById(membership.getTenant().getId())
                .orElseThrow(() -> new IllegalStateException("Tenant not found"));

        String accessToken = jwtService.generateAccessToken(user.getId(), tenant.getId(), membership.getRole().name());
        String refreshToken = jwtService.generateRefreshToken(user.getId());

        return buildAuthResponse(user, tenant, accessToken, refreshToken);
    }

    public TokenRefreshResponse refreshToken(String refreshToken) {
        if (redisTemplate != null && Boolean.TRUE.equals(redisTemplate.hasKey("blacklist:" + refreshToken))) {
            throw new IllegalArgumentException("Refresh token has been revoked");
        }

        if (!jwtService.validateToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }

        UUID userId = jwtService.extractUserId(refreshToken);
        User user = userRepository.findById(userId).orElseThrow();
        Membership membership = membershipRepository.findByUserIdAndIsActiveTrue(userId)
                .stream().findFirst().orElseThrow();
        Tenant tenant = tenantRepository.findById(membership.getTenant().getId()).orElseThrow();

        String newAccessToken = jwtService.generateAccessToken(userId, tenant.getId(), membership.getRole().name());
        return new TokenRefreshResponse(newAccessToken);
    }

    public void logout(String refreshToken) {
        if (redisTemplate != null) {
            redisTemplate.opsForValue().set("blacklist:" + refreshToken, "true", 7, TimeUnit.DAYS);
        }
    }

    private AuthResponse buildAuthResponse(User user, Tenant tenant, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(UserResponse.builder()
                        .id(user.getId()).email(user.getEmail())
                        .firstName(user.getFirstName()).lastName(user.getLastName())
                        .build())
                .tenant(TenantResponse.builder()
                        .id(tenant.getId()).name(tenant.getName()).slug(tenant.getSlug())
                        .timezone(tenant.getTimezone()).aiTone(tenant.getAiTone())
                        .isActive(tenant.isActive()).build())
                .build();
    }

    private String generateSlug(String name) {
        return name.toLowerCase().trim().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }
}
