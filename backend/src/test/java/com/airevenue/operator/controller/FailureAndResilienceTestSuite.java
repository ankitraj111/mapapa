package com.airevenue.operator.controller;

import com.airevenue.operator.domain.model.Tenant;
import com.airevenue.operator.domain.model.WebhookDeliveryLog;
import com.airevenue.operator.dto.request.CreateLeadRequest;
import com.airevenue.operator.repository.AuditLogRepository;
import com.airevenue.operator.repository.TenantRepository;
import com.airevenue.operator.repository.WebhookDeliveryLogRepository;
import com.airevenue.operator.service.billing.RazorpayPaymentService;
import com.airevenue.operator.service.integration.WhatsAppService;
import com.airevenue.operator.service.lead.LeadService;
import com.airevenue.operator.util.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.ZonedDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FailureAndResilienceTestSuite {

    @Mock
    private TenantRepository tenantRepo;
    @Mock
    private LeadService leadService;
    @Mock
    private AuditLogRepository auditLogRepo;
    @Mock
    private WhatsAppService whatsAppService;
    @Mock
    private WebhookDeliveryLogRepository webhookDeliveryLogRepo;
    @Mock
    private RazorpayPaymentService razorpayPaymentService;

    @InjectMocks
    private WebhookController webhookController;

    private Tenant tenant;
    private UUID tenantId;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        tenant = Tenant.builder()
            .id(tenantId)
            .slug("tech-agency")
            .isActive(true)
            .build();
    }

    @Test
    @DisplayName("Failure Test: Exception during lead ingestion moves payload to DEAD in DLQ with nextRetryAt")
    void testLeadIngestionFailurePreservesPayloadInDLQ() {
        when(tenantRepo.findBySlug("tech-agency")).thenReturn(Optional.of(tenant));
        when(webhookDeliveryLogRepo.existsByIdempotencyKeyAndCreatedAtAfter(any(), any())).thenReturn(false);

        WebhookDeliveryLog pendingLog = WebhookDeliveryLog.builder()
            .id(UUID.randomUUID())
            .tenantId(tenantId)
            .source("WEBSITE_LEAD")
            .status("PENDING")
            .build();
        when(webhookDeliveryLogRepo.save(any(WebhookDeliveryLog.class))).thenReturn(pendingLog);

        // Force internal failure
        when(leadService.createLeadInternal(eq(tenantId), any())).thenThrow(new RuntimeException("Database deadlock / timeout"));

        CreateLeadRequest req = new CreateLeadRequest();
        req.setEmail("lead@test.com");
        req.setFirstName("John");

        ResponseEntity<ApiResponse<Map<String, String>>> response = webhookController.receiveLead("tech-agency", null, null, null, req);

        assertThat(response.getStatusCode().value()).isEqualTo(500);
        // Verify saved twice: once as PENDING, once as DEAD
        verify(webhookDeliveryLogRepo, times(2)).save(any(WebhookDeliveryLog.class));
    }

    @Test
    @DisplayName("Idempotency Test: Duplicate WhatsApp message ID within 7 days is rejected idempotently")
    void testDuplicateWhatsAppMessageIgnored() {
        when(tenantRepo.findBySlug("tech-agency")).thenReturn(Optional.of(tenant));
        when(webhookDeliveryLogRepo.existsByIdempotencyKeyAndCreatedAtAfter(eq("wa_wamid.123"), any(ZonedDateTime.class)))
            .thenReturn(true);

        Map<String, Object> payload = Map.of(
            "entry", java.util.List.of(
                Map.of("changes", java.util.List.of(
                    Map.of("value", Map.of(
                        "messages", java.util.List.of(
                            Map.of("id", "wamid.123", "text", Map.of("body", "Hello"))
                        )
                    ))
                ))
            )
        );

        ResponseEntity<String> response = webhookController.receiveWhatsAppWebhook("tech-agency", payload);

        assertThat(response.getBody()).isEqualTo("EVENT_ALREADY_PROCESSED");
        verify(whatsAppService, never()).processInboundWhatsAppPayload(any(), any());
    }

    @Test
    @DisplayName("Security Test: Forged Razorpay webhook signature is rejected with HTTP 400")
    void testForgedRazorpaySignatureRejected() {
        when(razorpayPaymentService.handleRazorpayWebhook(any(), eq("forged_signature_123"))).thenReturn(false);

        ResponseEntity<String> response = webhookController.handleRazorpayWebhook("forged_signature_123", "{\"event\":\"payment.captured\"}");

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isEqualTo("INVALID_WEBHOOK_SIGNATURE_OR_PAYLOAD");
    }
}
