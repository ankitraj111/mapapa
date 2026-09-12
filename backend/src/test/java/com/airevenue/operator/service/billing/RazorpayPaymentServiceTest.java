package com.airevenue.operator.service.billing;

import com.airevenue.operator.domain.model.AuditLog;
import com.airevenue.operator.repository.AuditLogRepository;
import com.airevenue.operator.repository.TenantRepository;
import com.airevenue.operator.repository.WebhookDeliveryLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RazorpayPaymentServiceTest {

    @Mock
    private BillingService billingService;

    @Mock
    private TenantRepository tenantRepo;

    @Mock
    private AuditLogRepository auditLogRepo;

    @Mock
    private WebhookDeliveryLogRepository webhookDeliveryLogRepo;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private RazorpayPaymentService razorpayPaymentService;

    private final String testSecret = "kZjnPVYSUgf5kT2Cz4QkpGuk";
    private UUID tenantId;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        ReflectionTestUtils.setField(razorpayPaymentService, "keyId", "rzp_test_TYP96qdegz7nIV");
        ReflectionTestUtils.setField(razorpayPaymentService, "keySecret", testSecret);
        ReflectionTestUtils.setField(razorpayPaymentService, "webhookSecret", testSecret);
    }

    private String generateHmac(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                String h = Integer.toHexString(0xff & b);
                if (h.length() == 1) hex.append('0');
                hex.append(h);
            }
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void testVerifySignatureValidAndInvalid() {
        String data = "order_12345|pay_67890";
        String validSig = generateHmac(data, testSecret);

        assertTrue(RazorpayPaymentService.verifySignature(data, testSecret, validSig));
        assertFalse(RazorpayPaymentService.verifySignature(data, testSecret, "invalid_sig_abc123"));
    }

    @Test
    void testVerifyAndCapturePaymentSuccess() {
        String orderId = "order_12345";
        String paymentId = "pay_67890";
        String validSig = generateHmac(orderId + "|" + paymentId, testSecret);

        when(billingService.changePlan(tenantId, "PRO_AGENCY")).thenReturn(Map.of("plan", "PRO_AGENCY", "status", "ACTIVE"));

        Map<String, Object> res = razorpayPaymentService.verifyAndCapturePayment(tenantId, "PRO_AGENCY", orderId, paymentId, validSig);

        assertNotNull(res);
        assertEquals("PRO_AGENCY", res.get("plan"));
        verify(billingService, times(1)).changePlan(tenantId, "PRO_AGENCY");
        verify(auditLogRepo, times(1)).save(any(AuditLog.class));
    }

    @Test
    void testVerifyAndCapturePaymentThrowsOnInvalidSignature() {
        assertThrows(IllegalArgumentException.class, () ->
            razorpayPaymentService.verifyAndCapturePayment(tenantId, "PRO_AGENCY", "order_123", "pay_456", "tampered_signature")
        );
        verify(billingService, never()).changePlan(any(), any());
    }
}
