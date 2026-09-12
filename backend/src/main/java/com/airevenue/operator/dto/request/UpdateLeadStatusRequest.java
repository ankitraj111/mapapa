package com.airevenue.operator.dto.request;

import com.airevenue.operator.domain.enums.LeadStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateLeadStatusRequest {
    @NotNull private LeadStatus status;
}
