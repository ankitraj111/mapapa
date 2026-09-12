package com.airevenue.operator.dto.response;

import com.airevenue.operator.domain.enums.LeadStatus;
import lombok.Builder;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;
import java.math.BigDecimal;

@Data 
@Builder 
public class LeadResponse {
    private UUID id;
    private UUID tenantId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String company;
    private String source;
    private String sourceCampaign;
    private String location;
    private String requirement;
    private BigDecimal estimatedBudget;
    private String timeline;
    private String intent;
    private Integer score;
    private LeadStatus status;
    private String ownerName;
    private String qualificationStatus;
    private String aiSummary;
    private String humanNotes;
    private ZonedDateTime lastContactedAt;
    private ZonedDateTime nextFollowUpAt;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}
