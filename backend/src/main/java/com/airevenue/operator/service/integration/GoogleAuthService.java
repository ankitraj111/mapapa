package com.airevenue.operator.service.integration;

import com.airevenue.operator.domain.enums.IntegrationType;
import com.airevenue.operator.domain.model.Integration;
import com.airevenue.operator.repository.IntegrationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class GoogleAuthService {

    private final IntegrationRepository integrationRepo;
    private final RestClient restClient = RestClient.builder().build();

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret:}")
    private String clientSecret;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public static final String GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly";
    public static final String CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events";

    public String generateAuthUrl(UUID tenantId, IntegrationType type) {
        String scope = type == IntegrationType.GMAIL ? GMAIL_SCOPE : CALENDAR_SCOPE;
        String redirectUri = frontendUrl + "/integrations/callback";
        String state = tenantId.toString() + ":" + type.name();

        return "https://accounts.google.com/o/oauth2/v2/auth?" +
            "client_id=" + URLEncoder.encode(clientId, StandardCharsets.UTF_8) +
            "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8) +
            "&response_type=code" +
            "&scope=" + URLEncoder.encode(scope, StandardCharsets.UTF_8) +
            "&access_type=offline" +
            "&prompt=consent" +
            "&state=" + URLEncoder.encode(state, StandardCharsets.UTF_8);
    }

    public Integration handleOAuthCallback(UUID tenantId, IntegrationType type, String code, String redirectUri) {
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("code", code);
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("redirect_uri", redirectUri != null ? redirectUri : frontendUrl + "/integrations/callback");
        body.add("grant_type", "authorization_code");

        Map<String, Object> tokenResponse = restClient.post()
            .uri("https://oauth2.googleapis.com/token")
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(body)
            .retrieve()
            .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (tokenResponse == null || !tokenResponse.containsKey("access_token")) {
            throw new RuntimeException("Failed to exchange Google authorization code for access token.");
        }

        String accessToken = (String) tokenResponse.get("access_token");
        String refreshToken = (String) tokenResponse.get("refresh_token");
        Number expiresIn = (Number) tokenResponse.getOrDefault("expires_in", 3600);
        ZonedDateTime expiry = ZonedDateTime.now().plusSeconds(expiresIn.longValue());

        Optional<Integration> existing = integrationRepo.findByTenantIdAndType(tenantId, type);
        Integration integration = existing.orElseGet(() -> Integration.builder()
            .tenantId(tenantId)
            .type(type)
            .build());

        integration.setAccessToken(accessToken);
        if (refreshToken != null && !refreshToken.isBlank()) {
            integration.setRefreshToken(refreshToken);
        }
        integration.setTokenExpiry(expiry);
        integration.setStatus("CONNECTED");
        integration.setLastErrorMessage(null);
        integration.setLastSyncedAt(ZonedDateTime.now());
        integration.setIsActive(true);

        log.info("Google OAuth token successfully saved for tenant {} and type {}", tenantId, type);
        return integrationRepo.save(integration);
    }

    public String getValidAccessToken(UUID tenantId, IntegrationType type) {
        Integration integration = integrationRepo.findByTenantIdAndType(tenantId, type)
            .filter(Integration::getIsActive)
            .orElseThrow(() -> new RuntimeException("Integration not connected or inactive: " + type));

        if ("RECONNECT_REQUIRED".equalsIgnoreCase(integration.getStatus())) {
            throw new IllegalStateException("Google authorization expired or revoked. Please reconnect " + type + " in settings.");
        }

        if (integration.getTokenExpiry() != null && integration.getTokenExpiry().isAfter(ZonedDateTime.now().plusMinutes(5))) {
            return integration.getAccessToken();
        }

        // Refresh token if expired or about to expire
        if (integration.getRefreshToken() != null && !integration.getRefreshToken().isBlank()) {
            return refreshAccessToken(integration);
        }

        return integration.getAccessToken();
    }

    private String refreshAccessToken(Integration integration) {
        try {
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("client_id", clientId);
            body.add("client_secret", clientSecret);
            body.add("refresh_token", integration.getRefreshToken());
            body.add("grant_type", "refresh_token");

            Map<String, Object> res = com.airevenue.operator.util.RetryUtils.executeWithRetry("GoogleTokenRefresh", () -> 
                restClient.post()
                    .uri("https://oauth2.googleapis.com/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(body)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {})
            );

            if (res != null && res.containsKey("access_token")) {
                String newAccess = (String) res.get("access_token");
                Number expiresIn = (Number) res.getOrDefault("expires_in", 3600);
                integration.setAccessToken(newAccess);
                integration.setTokenExpiry(ZonedDateTime.now().plusSeconds(expiresIn.longValue()));
                integration.setStatus("CONNECTED");
                integration.setLastErrorMessage(null);
                integration.setLastSyncedAt(ZonedDateTime.now());
                integrationRepo.save(integration);
                log.info("Refreshed Google access token for tenant {} and type {}", integration.getTenantId(), integration.getType());
                return newAccess;
            }
        } catch (Exception e) {
            String err = e.getMessage() != null ? e.getMessage() : "Unknown error";
            log.error("Failed to refresh Google token for tenant {}: {}", integration.getTenantId(), err);
            
            // Check if token was revoked or invalid_grant
            if (err.toLowerCase().contains("invalid_grant") || err.toLowerCase().contains("unauthorized") || err.contains("400")) {
                integration.setStatus("RECONNECT_REQUIRED");
                integration.setLastErrorMessage("Google authorization expired or revoked. Please reconnect.");
                integrationRepo.save(integration);
                throw new IllegalStateException("Google authorization expired or revoked. Please reconnect " + integration.getType() + ".");
            }
        }
        return integration.getAccessToken();
    }
}
