package com.airevenue.operator.controller;

import com.airevenue.operator.config.JwtPrincipal;
import com.airevenue.operator.domain.enums.IntegrationType;
import com.airevenue.operator.domain.model.Integration;
import com.airevenue.operator.domain.model.Tenant;
import com.airevenue.operator.dto.response.IntegrationResponse;
import com.airevenue.operator.repository.IntegrationRepository;
import com.airevenue.operator.repository.TenantRepository;
import com.airevenue.operator.service.integration.GmailService;
import com.airevenue.operator.service.integration.GoogleAuthService;
import com.airevenue.operator.service.integration.GoogleCalendarService;
import com.airevenue.operator.util.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/integrations")
@RequiredArgsConstructor
@Slf4j
public class IntegrationController {

    private final IntegrationRepository integrationRepo;
    private final TenantRepository tenantRepo;
    private final GoogleAuthService googleAuthService;
    private final GoogleCalendarService calendarService;
    private final GmailService gmailService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<IntegrationResponse>>> getAll(@AuthenticationPrincipal JwtPrincipal p) {
        List<IntegrationResponse> list = integrationRepo.findByTenantIdAndIsActiveTrue(p.getTenantId()).stream()
            .map(i -> IntegrationResponse.builder()
                .id(i.getId())
                .tenantId(i.getTenantId())
                .type(i.getType().name())
                .status(i.getStatus() != null ? i.getStatus() : "CONNECTED")
                .lastErrorMessage(i.getLastErrorMessage())
                .lastSyncedAt(i.getLastSyncedAt())
                .isActive(i.getIsActive())
                .createdAt(i.getCreatedAt())
                .build()).toList();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@AuthenticationPrincipal JwtPrincipal p, @PathVariable UUID id) {
        integrationRepo.findById(id).ifPresent(i -> {
            if (i.getTenantId().equals(p.getTenantId())) {
                i.setIsActive(false);
                integrationRepo.save(i);
            }
        });
        return ResponseEntity.ok(ApiResponse.success("Disconnected successfully", "OK"));
    }

    @GetMapping("/google/auth-url")
    public ResponseEntity<ApiResponse<Map<String, String>>> getGoogleAuthUrl(
            @AuthenticationPrincipal JwtPrincipal p,
            @RequestParam("type") String typeStr) {
        IntegrationType type = IntegrationType.valueOf(typeStr.toUpperCase());
        String url = googleAuthService.generateAuthUrl(p.getTenantId(), type);
        return ResponseEntity.ok(ApiResponse.success(Map.of("authUrl", url)));
    }

    @PostMapping("/google/callback")
    public ResponseEntity<ApiResponse<IntegrationResponse>> handleGoogleCallback(
            @AuthenticationPrincipal JwtPrincipal p,
            @RequestBody Map<String, String> payload) {
        String code = payload.get("code");
        String typeStr = payload.getOrDefault("type", "GMAIL");
        String redirectUri = payload.get("redirectUri");
        IntegrationType type = IntegrationType.valueOf(typeStr.toUpperCase());

        Integration integration = googleAuthService.handleOAuthCallback(p.getTenantId(), type, code, redirectUri);
        return ResponseEntity.ok(ApiResponse.success(IntegrationResponse.builder()
            .id(integration.getId())
            .tenantId(integration.getTenantId())
            .type(integration.getType().name())
            .status(integration.getStatus())
            .lastErrorMessage(integration.getLastErrorMessage())
            .lastSyncedAt(integration.getLastSyncedAt())
            .isActive(integration.getIsActive())
            .createdAt(integration.getCreatedAt())
            .build(), "Google integration connected successfully"));
    }

    @PostMapping("/whatsapp/config")
    public ResponseEntity<ApiResponse<String>> saveWhatsAppConfig(
            @AuthenticationPrincipal JwtPrincipal p,
            @RequestBody Map<String, String> body) {
        String phoneNumberId = body.get("phoneNumberId");
        String accessToken = body.get("accessToken");

        try {
            String configJson = objectMapper.writeValueAsString(Map.of("phoneNumberId", phoneNumberId != null ? phoneNumberId : ""));
            Optional<Integration> existing = integrationRepo.findByTenantIdAndType(p.getTenantId(), IntegrationType.WHATSAPP);
            Integration integration = existing.orElseGet(() -> Integration.builder()
                .tenantId(p.getTenantId())
                .type(IntegrationType.WHATSAPP)
                .build());

            integration.setConfig(configJson);
            integration.setAccessToken(accessToken);
            integration.setIsActive(true);
            integrationRepo.save(integration);

            return ResponseEntity.ok(ApiResponse.success("WhatsApp credentials saved successfully", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to save WhatsApp credentials: " + e.getMessage()));
        }
    }

    @GetMapping("/calendar/slots")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getCalendarSlots(
            @AuthenticationPrincipal JwtPrincipal p,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(value = "timezone", defaultValue = "Asia/Kolkata") String timezone) {
        List<Map<String, String>> slots = calendarService.getAvailableSlots(p.getTenantId(), date, timezone);
        return ResponseEntity.ok(ApiResponse.success(slots));
    }

    @PostMapping("/gmail/sync")
    public ResponseEntity<ApiResponse<Map<String, Object>>> syncGmail(@AuthenticationPrincipal JwtPrincipal p) {
        int processed = gmailService.syncInboundEmails(p.getTenantId());
        return ResponseEntity.ok(ApiResponse.success(Map.of("processedEmails", processed)));
    }

    @GetMapping("/webhook-url")
    public ResponseEntity<ApiResponse<Map<String, String>>> getWebhookUrl(@AuthenticationPrincipal JwtPrincipal p) {
        String slug = tenantRepo.findById(p.getTenantId()).map(Tenant::getSlug).orElse("your-company");
        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "webhookUrl", "http://localhost:8080/api/v1/webhooks/leads/" + slug,
            "whatsappWebhookUrl", "http://localhost:8080/api/v1/webhooks/whatsapp/" + slug,
            "widgetScriptUrl", "http://localhost:8080/api/v1/webhooks/widget.js",
            "tenantSlug", slug)));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getIntegrationHealth(@AuthenticationPrincipal JwtPrincipal p) {
        List<Integration> active = integrationRepo.findByTenantIdAndIsActiveTrue(p.getTenantId());
        Map<String, Object> health = new HashMap<>();
        health.put("totalConnected", active.size());
        health.put("gmailConnected", active.stream().anyMatch(i -> i.getType() == IntegrationType.GMAIL));
        health.put("calendarConnected", active.stream().anyMatch(i -> i.getType() == IntegrationType.GOOGLE_CALENDAR));
        health.put("whatsappConnected", active.stream().anyMatch(i -> i.getType() == IntegrationType.WHATSAPP));
        return ResponseEntity.ok(ApiResponse.success(health));
    }
}
