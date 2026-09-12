package com.airevenue.operator.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;
import java.time.ZonedDateTime;
import com.airevenue.operator.domain.enums.LeadStatus;

@Data
@Builder
public class LeadSummaryResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String company;
    private String source;
    private Integer score;
    private LeadStatus status;
    private ZonedDateTime createdAt;
    private ZonedDateTime lastContactedAt;
    private ZonedDateTime nextFollowUpAt;
}
