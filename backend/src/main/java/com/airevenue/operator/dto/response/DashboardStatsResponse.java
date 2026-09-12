package com.airevenue.operator.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsResponse {
    private long leadsToday;
    private long qualifiedToday;
    private long hotLeads;
    private long meetingsBooked;
    private long followUpsPending;
    private long aiActionsToday;
    private long humanReviewCount;
    private Double estimatedPipeline;
}
