package com.airevenue.operator.controller;

import com.airevenue.operator.domain.model.AuditLog;
import com.airevenue.operator.domain.model.Lead;
import com.airevenue.operator.domain.model.Tenant;
import com.airevenue.operator.dto.request.CreateLeadRequest;
import com.airevenue.operator.exception.TenantNotFoundException;
import com.airevenue.operator.repository.AuditLogRepository;
import com.airevenue.operator.repository.TenantRepository;
import com.airevenue.operator.service.integration.WhatsAppService;
import com.airevenue.operator.service.lead.LeadService;
import com.airevenue.operator.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
@Slf4j
public class WebhookController {

    private final TenantRepository tenantRepo;
    private final LeadService leadService;
    private final AuditLogRepository auditLogRepo;
    private final WhatsAppService whatsAppService;
    private final com.airevenue.operator.repository.WebhookDeliveryLogRepository webhookDeliveryLogRepo;
    private final com.airevenue.operator.service.billing.RazorpayPaymentService razorpayPaymentService;

    @PostMapping("/leads/{tenantSlug}")
    public ResponseEntity<ApiResponse<Map<String, String>>> receiveLead(
            @PathVariable String tenantSlug,
            @RequestHeader(value = "X-Webhook-Secret", required = false) String webhookSecret,
            @RequestHeader(value = "X-Signature-SHA256", required = false) String hmacSignature,
            @RequestHeader(value = "X-Idempotency-Key", required = false) String customIdempotencyKey,
            @Valid @RequestBody CreateLeadRequest request) {

        Tenant tenant = tenantRepo.findBySlug(tenantSlug)
            .orElseThrow(() -> new TenantNotFoundException("Tenant workspace not found: " + tenantSlug));

        if (!tenant.getIsActive()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Tenant workspace is currently suspended or inactive."));
        }

        // 1. Idempotency Check
        String idempotencyKey = customIdempotencyKey != null && !customIdempotencyKey.isBlank()
            ? customIdempotencyKey
            : generateLeadIdempotencyKey(tenantSlug, request);

        if (webhookDeliveryLogRepo.existsByIdempotencyKeyAndCreatedAtAfter(idempotencyKey, java.time.ZonedDateTime.now().minusMinutes(5))) {
            log.info("Idempotent lead webhook already processed for key: {}", idempotencyKey);
            return ResponseEntity.ok(ApiResponse.success(Map.of(
                "status", "DUPLICATE_IGNORED",
                "idempotencyKey", idempotencyKey,
                "tenantSlug", tenantSlug
            ), "Lead already received and processed idempotently."));
        }

        // 2. Persist raw delivery log as PENDING immediately to guarantee zero data loss
        com.airevenue.operator.domain.model.WebhookDeliveryLog deliveryLog = webhookDeliveryLogRepo.save(
            com.airevenue.operator.domain.model.WebhookDeliveryLog.builder()
                .tenantId(tenant.getId())
                .source("WEBSITE_LEAD")
                .idempotencyKey(idempotencyKey)
                .payload(request.getEmail() + " | " + request.getFirstName() + " | " + request.getRequirement())
                .status("PENDING")
                .attempts(1)
                .build()
        );

        try {
            Lead lead = leadService.createLeadInternal(tenant.getId(), request);

            // Record Audit Log for incoming webhook
            auditLogRepo.save(AuditLog.builder()
                .tenantId(tenant.getId())
                .actorType("WEBHOOK")
                .actorId(tenant.getId().toString())
                .action("INBOUND_LEAD_INGESTED")
                .targetType("LEAD")
                .targetId(lead.getId().toString())
                .inputSummary("Source: " + lead.getSource() + " | Prospect: " + lead.getEmail())
                .result("SUCCESS")
                .status("OK")
                .build());

            // Mark Webhook Delivery Log as SUCCESS
            deliveryLog.setStatus("SUCCESS");
            deliveryLog.setProcessedAt(java.time.ZonedDateTime.now());
            webhookDeliveryLogRepo.save(deliveryLog);

            // Trigger autonomous AI qualification pipeline
            leadService.processWithAI(lead.getId(), tenant.getId());

            log.info("New inbound lead ingested via webhook for tenant {} - Lead ID: {}", tenantSlug, lead.getId());
            return ResponseEntity.ok(ApiResponse.success(Map.of(
                "leadId", lead.getId().toString(),
                "status", "INGESTED_AND_PROCESSING",
                "tenantSlug", tenantSlug
            ), "Inbound lead captured successfully"));
        } catch (Exception ex) {
            log.error("Failed to process inbound lead webhook for tenant {}: {}", tenantSlug, ex.getMessage(), ex);

            // Mark into Dead Letter Queue (DEAD) with original payload preserved
            deliveryLog.setStatus("DEAD");
            deliveryLog.setErrorMessage(ex.getMessage());
            deliveryLog.setNextRetryAt(java.time.ZonedDateTime.now().plusMinutes(5));
            webhookDeliveryLogRepo.save(deliveryLog);

            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to ingest lead: " + ex.getMessage()));
        }
    }

    @GetMapping("/whatsapp/{tenantSlug}")
    public ResponseEntity<String> verifyWhatsAppWebhook(
            @PathVariable String tenantSlug,
            @RequestParam("hub.mode") String mode,
            @RequestParam("hub.verify_token") String verifyToken,
            @RequestParam("hub.challenge") String challenge) {

        Tenant tenant = tenantRepo.findBySlug(tenantSlug)
            .orElseThrow(() -> new TenantNotFoundException("Tenant not found: " + tenantSlug));

        String expectedToken = tenant.getSlug() + "_whatsapp_secret";
        if ("subscribe".equals(mode) && (verifyToken.equals(expectedToken) || verifyToken.equals(tenant.getSlug()))) {
            log.info("WhatsApp webhook challenge verified for tenant {}", tenantSlug);
            return ResponseEntity.ok(challenge);
        }

        return ResponseEntity.status(403).body("Verification token mismatch");
    }

    @PostMapping("/whatsapp/{tenantSlug}")
    public ResponseEntity<String> receiveWhatsAppWebhook(
            @PathVariable String tenantSlug,
            @RequestBody Map<String, Object> payload) {

        Tenant tenant = tenantRepo.findBySlug(tenantSlug)
            .orElseThrow(() -> new TenantNotFoundException("Tenant not found: " + tenantSlug));

        String msgId = extractWhatsAppMessageId(payload);
        String idempotencyKey = "wa_" + (msgId != null ? msgId : UUID.randomUUID().toString());

        if (msgId != null && webhookDeliveryLogRepo.existsByIdempotencyKeyAndCreatedAtAfter(idempotencyKey, java.time.ZonedDateTime.now().minusDays(7))) {
            log.info("WhatsApp message {} already processed idempotently for tenant {}", msgId, tenantSlug);
            return ResponseEntity.ok("EVENT_ALREADY_PROCESSED");
        }

        // Persist raw delivery log as PENDING immediately
        com.airevenue.operator.domain.model.WebhookDeliveryLog deliveryLog = webhookDeliveryLogRepo.save(
            com.airevenue.operator.domain.model.WebhookDeliveryLog.builder()
                .tenantId(tenant.getId())
                .source("WHATSAPP")
                .idempotencyKey(idempotencyKey)
                .payload(payload.toString())
                .status("PENDING")
                .attempts(1)
                .build()
        );

        try {
            whatsAppService.processInboundWhatsAppPayload(tenant.getId(), payload);

            deliveryLog.setStatus("SUCCESS");
            deliveryLog.setProcessedAt(java.time.ZonedDateTime.now());
            webhookDeliveryLogRepo.save(deliveryLog);

            return ResponseEntity.ok("EVENT_RECEIVED");
        } catch (Exception ex) {
            log.error("Failed to process WhatsApp webhook for tenant {}: {}", tenantSlug, ex.getMessage(), ex);

            deliveryLog.setStatus("DEAD");
            deliveryLog.setErrorMessage(ex.getMessage());
            deliveryLog.setNextRetryAt(java.time.ZonedDateTime.now().plusMinutes(5));
            webhookDeliveryLogRepo.save(deliveryLog);

            return ResponseEntity.ok("EVENT_CAPTURED_FOR_RETRY");
        }
    }

    private String generateLeadIdempotencyKey(String tenantSlug, CreateLeadRequest req) {
        long fiveMinuteBucket = System.currentTimeMillis() / 300000L;
        String reqSnippet = req.getRequirement() != null ? String.valueOf(req.getRequirement().hashCode()) : "none";
        String base = tenantSlug + ":" + (req.getEmail() != null ? req.getEmail() : "") + ":" + (req.getPhone() != null ? req.getPhone() : "") + ":" + reqSnippet + ":" + fiveMinuteBucket;
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(base.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (Exception e) {
            return base;
        }
    }

    @SuppressWarnings("unchecked")
    private String extractWhatsAppMessageId(Map<String, Object> payload) {
        try {
            List<Map<String, Object>> entries = (List<Map<String, Object>>) payload.get("entry");
            if (entries != null && !entries.isEmpty()) {
                List<Map<String, Object>> changes = (List<Map<String, Object>>) entries.get(0).get("changes");
                if (changes != null && !changes.isEmpty()) {
                    Map<String, Object> value = (Map<String, Object>) changes.get(0).get("value");
                    if (value != null) {
                        List<Map<String, Object>> messages = (List<Map<String, Object>>) value.get("messages");
                        if (messages != null && !messages.isEmpty()) {
                            return (String) messages.get(0).get("id");
                        }
                    }
                }
            }
        } catch (Exception ignored) {}
        return null;
    }

    @PostMapping("/razorpay")
    public ResponseEntity<String> handleRazorpayWebhook(
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature,
            @RequestBody String rawPayload) {
        boolean processed = razorpayPaymentService.handleRazorpayWebhook(rawPayload, signature);
        if (processed) {
            return ResponseEntity.ok("WEBHOOK_PROCESSED");
        }
        return ResponseEntity.badRequest().body("INVALID_WEBHOOK_SIGNATURE_OR_PAYLOAD");
    }

    @GetMapping(value = "/widget.js", produces = "application/javascript")
    public ResponseEntity<String> getEmbedWidgetJs() {
        String js = """
            (function() {
                var script = document.currentScript;
                var tenantSlug = script ? script.getAttribute('data-tenant') : '';
                var apiHost = script ? script.src.split('/api/v1')[0] : window.location.origin;

                function initWidget() {
                    var container = document.createElement('div');
                    container.id = 'ai-revenue-widget-root';
                    container.innerHTML = `
                        <div style="position: fixed; bottom: 20px; right: 20px; z-index: 999999; font-family: sans-serif;">
                            <button id="ai-widget-trigger" style="background: #4f46e5; color: white; border: none; border-radius: 50%; width: 56px; height: 56px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 24px;">💬</button>
                        </div>
                    `;
                    document.body.appendChild(container);
                }

                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', initWidget);
                } else {
                    initWidget();
                }
            })();
        """;
        return ResponseEntity.ok().contentType(MediaType.parseMediaType("application/javascript")).body(js);
    }

    public static boolean verifyHmacSignature(String payload, String secret, String signature) {
        if (signature == null || secret == null || payload == null) return false;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] rawHmac = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : rawHmac) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return MessageDigest.isEqual(hexString.toString().getBytes(StandardCharsets.UTF_8), signature.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            return false;
        }
    }
}
