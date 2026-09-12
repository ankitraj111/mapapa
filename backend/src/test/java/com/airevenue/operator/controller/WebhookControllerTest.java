package com.airevenue.operator.controller;

import com.airevenue.operator.domain.model.Tenant;
import com.airevenue.operator.repository.AuditLogRepository;
import com.airevenue.operator.repository.TenantRepository;
import com.airevenue.operator.service.integration.WhatsAppService;
import com.airevenue.operator.service.lead.LeadService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WebhookControllerTest {

    @Mock
    private TenantRepository tenantRepo;
    @Mock
    private LeadService leadService;
    @Mock
    private AuditLogRepository auditLogRepo;
    @Mock
    private WhatsAppService whatsAppService;
    @Mock
    private com.airevenue.operator.repository.WebhookDeliveryLogRepository webhookDeliveryLogRepo;

    @InjectMocks
    private WebhookController webhookController;

    @Test
    @DisplayName("HMAC signature verification helper validates matching hash")
    void testVerifyHmacSignature() {
        String payload = "{\"firstName\":\"Aarav\",\"email\":\"aarav@example.com\"}";
        String secret = "super_secret_webhook_key";

        // Generate expected SHA256 HMAC for test
        javax.crypto.Mac mac;
        try {
            mac = javax.crypto.Mac.getInstance("HmacSHA256");
            mac.init(new javax.crypto.spec.SecretKeySpec(secret.getBytes(), "HmacSHA256"));
            byte[] raw = mac.doFinal(payload.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : raw) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) sb.append('0');
                sb.append(hex);
            }
            String validSignature = sb.toString();

            assertThat(WebhookController.verifyHmacSignature(payload, secret, validSignature)).isTrue();
            assertThat(WebhookController.verifyHmacSignature(payload, secret, "tampered_signature")).isFalse();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    @DisplayName("WhatsApp webhook GET returns challenge when token matches")
    void testVerifyWhatsAppWebhook_ReturnsChallenge() {
        Tenant tenant = Tenant.builder().id(UUID.randomUUID()).slug("tech-agency").isActive(true).build();
        when(tenantRepo.findBySlug("tech-agency")).thenReturn(Optional.of(tenant));

        ResponseEntity<String> res = webhookController.verifyWhatsAppWebhook(
            "tech-agency", "subscribe", "tech-agency_whatsapp_secret", "challenge_12345"
        );

        assertThat(res.getStatusCode().value()).isEqualTo(200);
        assertThat(res.getBody()).isEqualTo("challenge_12345");
    }

    @Test
    @DisplayName("Duplicate lead webhook is ignored idempotently")
    void testDuplicateLeadWebhookIgnored() {
        Tenant tenant = Tenant.builder().id(UUID.randomUUID()).slug("tech-agency").isActive(true).build();
        when(tenantRepo.findBySlug("tech-agency")).thenReturn(Optional.of(tenant));
        when(webhookDeliveryLogRepo.existsByIdempotencyKeyAndCreatedAtAfter(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.any()))
            .thenReturn(true);

        com.airevenue.operator.dto.request.CreateLeadRequest req = new com.airevenue.operator.dto.request.CreateLeadRequest();
        req.setEmail("duplicate@example.com");
        req.setFirstName("Duplicate");

        var response = webhookController.receiveLead("tech-agency", null, null, "custom-idem-123", req);
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().getData().get("status")).isEqualTo("DUPLICATE_IGNORED");
    }
}
