package com.airevenue.operator.service.ai;

import com.airevenue.operator.domain.model.Tenant;
import com.airevenue.operator.dto.response.DashboardStatsResponse;
import com.airevenue.operator.repository.TenantRepository;
import com.airevenue.operator.service.analytics.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AISummaryService {
    private final AnalyticsService analyticsService;
    private final TenantRepository tenantRepo;
    private final AIProvider aiProvider;

    public String generateDailySummary(UUID tenantId) {
        DashboardStatsResponse stats = analyticsService.getDashboardStats(tenantId);
        String tenantName = tenantRepo.findById(tenantId).map(Tenant::getName).orElse("Your Business");

        String statsData = String.format(
            "Leads today: %d, Qualified: %d, Hot leads: %d, Meetings booked: %d, " +
            "Follow-ups pending: %d, AI actions today: %d, Human review queue: %d",
            stats.getLeadsToday(), stats.getQualifiedToday(), stats.getHotLeads(),
            stats.getMeetingsBooked(), stats.getFollowUpsPending(),
            stats.getAiActionsToday(), stats.getHumanReviewCount());

        String systemPrompt = "You are an AI business analyst. Generate a concise, positive daily sales summary for " +
            tenantName + ". Be specific with numbers, highlight wins, and note items needing attention. 3-5 sentences max.";

        try {
            String generated = aiProvider.generateText(systemPrompt, "Today's data: " + statsData, "gpt-4o-mini");
            if (generated != null && !generated.isBlank() && !generated.contains("Thank you for reaching out")) {
                return generated;
            }
        } catch (Exception e) {
            log.error("Failed to generate daily summary: {}", e.getMessage());
        }

        return String.format(
            "Operations telemetry for %s: You have %d new leads recorded today. %d meetings are confirmed on your calendar with ₹%,.0f in estimated pipeline value. Your AI Sales Employee has executed %d autonomous actions.",
            tenantName, stats.getLeadsToday(), stats.getMeetingsBooked(),
            stats.getEstimatedPipeline(), stats.getAiActionsToday());
    }
}
