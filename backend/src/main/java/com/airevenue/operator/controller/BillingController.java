package com.airevenue.operator.controller;

import com.airevenue.operator.config.JwtPrincipal;
import com.airevenue.operator.service.billing.BillingService;
import com.airevenue.operator.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;
    private final com.airevenue.operator.service.billing.RazorpayPaymentService razorpayPaymentService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBillingSummary(@AuthenticationPrincipal JwtPrincipal p) {
        return ResponseEntity.ok(ApiResponse.success(billingService.getBillingSummary(p.getTenantId())));
    }

    @PostMapping("/plan")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updatePlan(
            @AuthenticationPrincipal JwtPrincipal p,
            @RequestBody Map<String, String> body) {
        String plan = body.get("plan");
        return ResponseEntity.ok(ApiResponse.success(billingService.changePlan(p.getTenantId(), plan), "Subscription plan updated successfully"));
    }

    @PostMapping("/razorpay/order")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createRazorpayOrder(
            @AuthenticationPrincipal JwtPrincipal p,
            @RequestParam("plan") String plan) {
        Map<String, Object> order = razorpayPaymentService.createOrder(p.getTenantId(), plan);
        return ResponseEntity.ok(ApiResponse.success(order, "Razorpay checkout order created successfully"));
    }

    @PostMapping("/razorpay/verify")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyRazorpayPayment(
            @AuthenticationPrincipal JwtPrincipal p,
            @RequestBody Map<String, String> payload) {
        String planKey = payload.get("plan");
        String orderId = payload.get("razorpay_order_id");
        String paymentId = payload.get("razorpay_payment_id");
        String signature = payload.get("razorpay_signature");

        Map<String, Object> updated = razorpayPaymentService.verifyAndCapturePayment(
            p.getTenantId(), planKey, orderId, paymentId, signature
        );
        return ResponseEntity.ok(ApiResponse.success(updated, "Payment verified and subscription activated successfully!"));
    }

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAvailablePlans() {
        return ResponseEntity.ok(ApiResponse.success(billingService.getAvailablePlans()));
    }
}
