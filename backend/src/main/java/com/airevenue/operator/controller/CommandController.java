package com.airevenue.operator.controller;

import com.airevenue.operator.config.JwtPrincipal;
import com.airevenue.operator.dto.request.AgentCommandRequest;
import com.airevenue.operator.dto.response.AgentCommandResponse;
import com.airevenue.operator.service.ai.AICommandCenterService;
import com.airevenue.operator.service.analytics.RevenueIntelligenceService;
import com.airevenue.operator.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class CommandController {

    private final AICommandCenterService commandCenterService;
    private final RevenueIntelligenceService intelligenceService;

    @PostMapping({"/command/execute", "/agents/command", "/agents/command/execute"})
    public ResponseEntity<ApiResponse<AgentCommandResponse>> executeCommand(
            @AuthenticationPrincipal JwtPrincipal p,
            @Valid @RequestBody AgentCommandRequest req) {
        AgentCommandResponse res = commandCenterService.executeCommand(p.getTenantId(), req.getCommand());
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @GetMapping("/intelligence/next-actions")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getNextActions(@AuthenticationPrincipal JwtPrincipal p) {
        List<Map<String, Object>> actions = intelligenceService.getNextBestActions(p.getTenantId());
        return ResponseEntity.ok(ApiResponse.success(actions));
    }

    @GetMapping("/intelligence/attribution")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRevenueAttribution(@AuthenticationPrincipal JwtPrincipal p) {
        Map<String, Object> attribution = intelligenceService.getRevenueAttribution(p.getTenantId());
        return ResponseEntity.ok(ApiResponse.success(attribution));
    }

    @GetMapping("/intelligence/pipeline-insights")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPipelineInsights(@AuthenticationPrincipal JwtPrincipal p) {
        Map<String, Object> insights = intelligenceService.getPipelineIntelligence(p.getTenantId());
        return ResponseEntity.ok(ApiResponse.success(insights));
    }
}
