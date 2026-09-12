package com.airevenue.operator.controller;

import com.airevenue.operator.config.JwtPrincipal;
import com.airevenue.operator.dto.response.DashboardStatsResponse;
import com.airevenue.operator.exception.UnauthorizedException;
import com.airevenue.operator.service.analytics.AnalyticsService;
import com.airevenue.operator.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
    
    private final AnalyticsService analyticsService;
    private final com.airevenue.operator.service.ai.AISummaryService aiSummaryService;

    private UUID getTenantId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof JwtPrincipal principal) {
            return principal.getTenantId();
        }
        throw new UnauthorizedException("Not authenticated");
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getDashboardStats(getTenantId())));
    }

    @GetMapping("/daily-summary")
    public ResponseEntity<ApiResponse<Map<String, String>>> getDailySummary() {
        String summary = aiSummaryService.generateDailySummary(getTenantId());
        return ResponseEntity.ok(ApiResponse.success(Map.of("summary", summary)));
    }

    @GetMapping("/lead-trend")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getLeadTrend(@RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getLeadTrend(getTenantId(), days)));
    }

    @GetMapping("/status-distribution")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getStatusDistribution() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getStatusDistribution(getTenantId())));
    }

    @GetMapping("/ai-activity")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAiActivity() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getAiActivity(getTenantId())));
    }

    @PostMapping("/seed-demo")
    public ResponseEntity<ApiResponse<Map<String, Object>>> seedDemo() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.seedDemoData(getTenantId()), "Demo data initialized"));
    }
}
