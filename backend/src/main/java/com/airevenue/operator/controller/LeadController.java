package com.airevenue.operator.controller;

import com.airevenue.operator.config.JwtPrincipal;
import com.airevenue.operator.dto.request.*;
import com.airevenue.operator.dto.response.*;
import com.airevenue.operator.service.lead.LeadService;
import com.airevenue.operator.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/v1/leads")
@RequiredArgsConstructor
public class LeadController {
    private final LeadService leadService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<LeadSummaryResponse>>> getLeads(
            @AuthenticationPrincipal JwtPrincipal p,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(leadService.getLeads(p.getTenantId(), status, search, pageable)));
    }

    @GetMapping("/hot")
    public ResponseEntity<ApiResponse<List<LeadSummaryResponse>>> getHotLeads(
            @AuthenticationPrincipal JwtPrincipal p,
            @RequestParam(defaultValue = "70") int minScore) {
        return ResponseEntity.ok(ApiResponse.success(leadService.getHotLeads(p.getTenantId(), minScore)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LeadResponse>> createLead(
            @AuthenticationPrincipal JwtPrincipal p, @Valid @RequestBody CreateLeadRequest request) {
        return ResponseEntity.ok(ApiResponse.success(leadService.createLead(p.getTenantId(), request), "Lead created"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LeadResponse>> getLead(@AuthenticationPrincipal JwtPrincipal p, @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(leadService.getLead(id, p.getTenantId())));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LeadResponse>> updateLead(
            @AuthenticationPrincipal JwtPrincipal p, @PathVariable UUID id, @RequestBody UpdateLeadRequest request) {
        return ResponseEntity.ok(ApiResponse.success(leadService.updateLead(id, p.getTenantId(), request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<LeadResponse>> updateStatus(
            @AuthenticationPrincipal JwtPrincipal p, @PathVariable UUID id, @RequestBody UpdateLeadStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(leadService.updateStatus(id, p.getTenantId(), request.getStatus().name())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteLead(@AuthenticationPrincipal JwtPrincipal p, @PathVariable UUID id) {
        leadService.deleteLead(id, p.getTenantId());
        return ResponseEntity.ok(ApiResponse.success("Deleted", "OK"));
    }

    @GetMapping("/pipeline")
    public ResponseEntity<ApiResponse<PipelineResponse>> getPipeline(@AuthenticationPrincipal JwtPrincipal p) {
        return ResponseEntity.ok(ApiResponse.success(leadService.getPipeline(p.getTenantId())));
    }

    @PostMapping("/{id}/process-with-ai")
    public ResponseEntity<ApiResponse<String>> processWithAI(@AuthenticationPrincipal JwtPrincipal p, @PathVariable UUID id) {
        leadService.processWithAI(id, p.getTenantId());
        return ResponseEntity.ok(ApiResponse.success("AI processing started", "OK"));
    }

    @PostMapping("/{id}/score")
    public ResponseEntity<ApiResponse<LeadResponse>> recalculateScore(@AuthenticationPrincipal JwtPrincipal p, @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(leadService.recalculateScore(id, p.getTenantId())));
    }

    @GetMapping("/{id}/activities")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getActivities(@AuthenticationPrincipal JwtPrincipal p, @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(leadService.getLeadActivities(id, p.getTenantId())));
    }
}