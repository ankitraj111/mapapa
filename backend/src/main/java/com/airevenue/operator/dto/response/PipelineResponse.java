package com.airevenue.operator.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class PipelineResponse {
    private Map<String, List<LeadSummaryResponse>> columns;
}
