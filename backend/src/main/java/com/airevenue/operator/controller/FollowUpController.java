package com.airevenue.operator.controller;

import com.airevenue.operator.config.JwtPrincipal;
import com.airevenue.operator.domain.model.ScheduledFollowUp;
import com.airevenue.operator.dto.request.CreateFollowUpSequenceRequest;
import com.airevenue.operator.dto.response.FollowUpSequenceResponse;
import com.airevenue.operator.service.followup.FollowUpService;
import com.airevenue.operator.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequiredArgsConstructor
public class FollowUpController {
    private final FollowUpService followUpService;

    @GetMapping("/api/v1/follow-ups/sequences")
    public ResponseEntity<ApiResponse<List<FollowUpSequenceResponse>>> getSequences(@AuthenticationPrincipal JwtPrincipal p) {
        return ResponseEntity.ok(ApiResponse.success(followUpService.getSequences(p.getTenantId())));
    }

    @PostMapping("/api/v1/follow-ups/sequences")
    public ResponseEntity<ApiResponse<FollowUpSequenceResponse>> createSequence(
            @AuthenticationPrincipal JwtPrincipal p, @RequestBody CreateFollowUpSequenceRequest req) {
        return ResponseEntity.ok(ApiResponse.success(followUpService.createSequence(p.getTenantId(), req), "Created"));
    }

    @GetMapping("/api/v1/leads/{leadId}/follow-ups")
    public ResponseEntity<ApiResponse<List<ScheduledFollowUp>>> getLeadFollowUps(
            @AuthenticationPrincipal JwtPrincipal p, @PathVariable UUID leadId) {
        return ResponseEntity.ok(ApiResponse.success(followUpService.getLeadFollowUps(leadId, p.getTenantId())));
    }

    @PostMapping("/api/v1/leads/{leadId}/follow-ups/enroll")
    public ResponseEntity<ApiResponse<String>> enroll(
            @AuthenticationPrincipal JwtPrincipal p, @PathVariable UUID leadId, @RequestBody Map<String, String> body) {
        followUpService.enrollLeadInSequence(leadId, UUID.fromString(body.get("sequenceId")), p.getTenantId());
        return ResponseEntity.ok(ApiResponse.success("Enrolled", "OK"));
    }
}
