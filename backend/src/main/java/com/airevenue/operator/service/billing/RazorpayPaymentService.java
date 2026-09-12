package com.airevenue.operator.service.billing;

import com.airevenue.operator.domain.model.AuditLog;
import com.airevenue.operator.domain.model.Tenant;
import com.airevenue.operator.domain.model.WebhookDeliveryLog;
import com.airevenue.operator.repository.AuditLogRepository;
import com.airevenue.operator.repository.TenantRepository;
import com.airevenue.operator.repository.WebhookDeliveryLogRepository;
import com.airevenue.operator.util.RetryUtils;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.ZonedDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class RazorpayPaymentService {

    private final BillingService billingService;
    private final TenantRepository tenantRepo;
    private final AuditLogRepository auditLogRepo;
    private final WebhookDeliveryLogRepository webhookDeliveryLogRepo;
    private final ObjectMapper objectMapper;
    private final RestClient restClient = RestClient.builder().build();

    @Value("${razorpay.key-id:rzp_test_TYP96qdegz7nIV}")
    private String keyId;

    @Value("${razorpay.key-secret:kZjnPVYSUgf5kT2Cz4QkpGuk}")
    private String keySecret;

    @Value("${razorpay.webhook-secret:kZjnPVYSUgf5kT2Cz4QkpGuk}")
    private String webhookSecret;

    private static final Map<String, Long> PLAN_PRICES_PAISE = Map.of(
        "STARTER", 799900L,      // ₹7,999.00
        "GROWTH", 1999900L,     // ₹19,999.00
        "PRO_AGENCY", 4999900L   // ₹49,999.00
    );

    public Map<String, Object> createOrder(UUID tenantId, String targetPlan) {
        String planKey = targetPlan.toUpperCase().trim();
        if (!PLAN_PRICES_PAISE.containsKey(planKey)) {
            throw new IllegalArgumentException("Unknown plan selected for checkout: " + targetPlan);
        }

        Tenant tenant = tenantRepo.findById(tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + tenantId));

        long amountPaise = PLAN_PRICES_PAISE.get(planKey);
        String receiptId = "rcpt_" + tenantId.toString().substring(0, 8) + "_" + (System.currentTimeMillis() % 1000000);

        Map<String, Object> payload = new HashMap<>();
        payload.put("amount", amountPaise);
        payload.put("currency", "INR");
        payload.put("receipt", receiptId);
        payload.put("notes", Map.of(
            "tenantId", tenantId.toString(),
            "tenantSlug", tenant.getSlug() != null ? tenant.getSlug() : "",
            "plan", planKey
        ));

        String authHeader = "Basic " + Base64.getEncoder().encodeToString((keyId + ":" + keySecret).getBytes(StandardCharsets.UTF_8));

        Map<String, Object> orderRes = RetryUtils.executeWithRetry("RazorpayCreateOrder", () ->
            restClient.post()
                .uri("https://api.razorpay.com/v1/orders")
                .header(HttpHeaders.AUTHORIZATION, authHeader)
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {})
        );

        if (orderRes == null || !orderRes.containsKey("id")) {
            throw new RuntimeException("Failed to create Razorpay checkout order.");
        }

        String orderId = (String) orderRes.get("id");
        log.info("Created Razorpay order {} for tenant {} and plan {}", orderId, tenantId, planKey);

        Map<String, Object> result = new HashMap<>();
        result.put("orderId", orderId);
        result.put("amount", amountPaise);
        result.put("currency", "INR");
        result.put("keyId", keyId);
        result.put("plan", planKey);
        result.put("companyName", tenant.getName() != null ? tenant.getName() : "AI Revenue Operator");
        return result;
    }

    public Map<String, Object> verifyAndCapturePayment(UUID tenantId, String planKey, String orderId, String paymentId, String signature) {
        boolean isValid = verifySignature(orderId + "|" + paymentId, keySecret, signature);
        if (!isValid) {
            log.error("Razorpay signature verification failed for tenant {} order {}", tenantId, orderId);
            throw new IllegalArgumentException("Invalid payment signature verification failed.");
        }

        // Apply plan upgrade & refresh quotas
        Map<String, Object> summary = billingService.changePlan(tenantId, planKey);

        // Record Audit Log for payment capture
        auditLogRepo.save(AuditLog.builder()
            .tenantId(tenantId)
            .actorType("PAYMENT_GATEWAY")
            .actorId(paymentId)
            .action("PAYMENT_CAPTURED_SUBSCRIPTION_UPGRADED")
            .targetType("SUBSCRIPTION")
            .targetId(planKey)
            .inputSummary("Razorpay Order: " + orderId + " | Payment: " + paymentId + " | Plan: " + planKey)
            .result("SUCCESS")
            .status("ACTIVE")
            .build());

        log.info("Razorpay payment verified successfully for tenant {} - Order: {}, Payment: {}, Plan: {}",
            tenantId, orderId, paymentId, planKey);

        return summary;
    }

    public boolean handleRazorpayWebhook(String rawPayload, String signature) {
        if (signature == null || signature.isBlank()) {
            log.warn("Missing X-Razorpay-Signature on webhook request");
            return false;
        }

        boolean isValid = verifySignature(rawPayload, webhookSecret, signature);
        if (!isValid) {
            log.warn("Invalid Razorpay webhook signature");
            return false;
        }

        try {
            Map<String, Object> event = objectMapper.readValue(rawPayload, new TypeReference<>() {});
            String eventType = (String) event.getOrDefault("event", "");
            String eventId = (String) event.getOrDefault("id", "evt_" + UUID.randomUUID());

            String idempotencyKey = "rzp_evt_" + eventId;
            if (webhookDeliveryLogRepo.existsByIdempotencyKeyAndCreatedAtAfter(idempotencyKey, ZonedDateTime.now().minusDays(7))) {
                log.info("Razorpay webhook event {} already processed idempotently.", eventId);
                return true;
            }

            // Save Webhook Delivery Log
            WebhookDeliveryLog deliveryLog = webhookDeliveryLogRepo.save(WebhookDeliveryLog.builder()
                .tenantId(UUID.fromString("00000000-0000-0000-0000-000000000000")) // system tenant placeholder
                .source("RAZORPAY_WEBHOOK")
                .idempotencyKey(idempotencyKey)
                .payload(rawPayload)
                .status("PENDING")
                .build());

            if ("order.paid".equalsIgnoreCase(eventType) || "payment.captured".equalsIgnoreCase(eventType)) {
                @SuppressWarnings("unchecked")
                Map<String, Object> payloadMap = (Map<String, Object>) event.get("payload");
                if (payloadMap != null) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> paymentObj = (Map<String, Object>) payloadMap.get("payment");
                    @SuppressWarnings("unchecked")
                    Map<String, Object> entity = paymentObj != null ? (Map<String, Object>) paymentObj.get("entity") : null;
                    if (entity != null && entity.containsKey("notes")) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> notes = (Map<String, Object>) entity.get("notes");
                        if (notes != null && notes.containsKey("tenantId") && notes.containsKey("plan")) {
                            UUID tenantId = UUID.fromString((String) notes.get("tenantId"));
                            String plan = (String) notes.get("plan");
                            billingService.changePlan(tenantId, plan);
                            deliveryLog.setTenantId(tenantId);
                            log.info("Auto-upgraded tenant {} to plan {} via Razorpay webhook {}", tenantId, plan, eventType);
                        }
                    }
                }
            }

            deliveryLog.setStatus("SUCCESS");
            deliveryLog.setProcessedAt(ZonedDateTime.now());
            webhookDeliveryLogRepo.save(deliveryLog);
            return true;
        } catch (Exception ex) {
            log.error("Failed to process Razorpay webhook payload: {}", ex.getMessage(), ex);
            return false;
        }
    }

    public static boolean verifySignature(String payload, String secret, String signature) {
        if (payload == null || secret == null || signature == null) return false;
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
