package com.airevenue.operator.controller;

import com.airevenue.operator.config.JwtPrincipal;
import com.airevenue.operator.domain.model.Membership;
import com.airevenue.operator.domain.model.Tenant;
import com.airevenue.operator.dto.request.UpdateTenantRequest;
import com.airevenue.operator.dto.response.TenantResponse;
import com.airevenue.operator.repository.MembershipRepository;
import com.airevenue.operator.repository.TenantRepository;
import com.airevenue.operator.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/tenants")
@RequiredArgsConstructor
public class TenantController {
    private final TenantRepository tenantRepo;
    private final MembershipRepository membershipRepo;

    @GetMapping({"/me", "/current"})
    public ResponseEntity<ApiResponse<TenantResponse>> getMe(@AuthenticationPrincipal JwtPrincipal p) {
        Tenant t = tenantRepo.findById(p.getTenantId()).orElseThrow();
        return ResponseEntity.ok(ApiResponse.success(map(t)));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<TenantResponse>> updateMe(
            @AuthenticationPrincipal JwtPrincipal p, @RequestBody UpdateTenantRequest req) {
        Tenant t = tenantRepo.findById(p.getTenantId()).orElseThrow();
        if (req.getName() != null) t.setName(req.getName());
        if (req.getDescription() != null) t.setDescription(req.getDescription());
        if (req.getIndustry() != null) t.setIndustry(req.getIndustry());
        if (req.getWebsite() != null) t.setWebsite(req.getWebsite());
        if (req.getPhone() != null) t.setPhone(req.getPhone());
        if (req.getTimezone() != null) t.setTimezone(req.getTimezone());
        if (req.getAiTone() != null) t.setAiTone(req.getAiTone());
        if (req.getWorkingHoursStart() != null && !req.getWorkingHoursStart().isBlank()) {
            t.setWorkingHoursStart(LocalTime.parse(req.getWorkingHoursStart()));
        }
        if (req.getWorkingHoursEnd() != null && !req.getWorkingHoursEnd().isBlank()) {
            t.setWorkingHoursEnd(LocalTime.parse(req.getWorkingHoursEnd()));
        }
        if (req.getFollowUpEnabled() != null) t.setFollowUpEnabled(req.getFollowUpEnabled());
        t = tenantRepo.save(t);
        return ResponseEntity.ok(ApiResponse.success(map(t), "Updated"));
    }

    @GetMapping("/team")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTeam(@AuthenticationPrincipal JwtPrincipal p) {
        List<Membership> memberships = membershipRepo.findByTenantIdAndIsActiveTrue(p.getTenantId());
        List<Map<String, Object>> members = memberships.stream().map(m -> {
            Map<String, Object> member = new LinkedHashMap<>();
            member.put("id", m.getId());
            member.put("userId", m.getUser().getId());
            member.put("email", m.getUser().getEmail());
            member.put("firstName", m.getUser().getFirstName());
            member.put("lastName", m.getUser().getLastName());
            member.put("role", m.getRole().name());
            member.put("isActive", m.isActive());
            member.put("joinedAt", m.getCreatedAt());
            return member;
        }).toList();
        return ResponseEntity.ok(ApiResponse.success(members));
    }

    private TenantResponse map(Tenant t) {
        return TenantResponse.builder()
            .id(t.getId())
            .name(t.getName())
            .slug(t.getSlug())
            .description(t.getDescription())
            .industry(t.getIndustry())
            .website(t.getWebsite())
            .timezone(t.getTimezone())
            .aiTone(t.getAiTone())
            .followUpEnabled(t.getFollowUpEnabled())
            .isActive(t.getIsActive())
            .createdAt(t.getCreatedAt())
            .build();
    }
}