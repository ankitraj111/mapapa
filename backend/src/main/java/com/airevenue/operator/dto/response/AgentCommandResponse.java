package com.airevenue.operator.dto.response;
import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AgentCommandResponse {
    private String interpretation;
    private List<ProposedAction> proposedActions;
    private boolean requiresApproval;
    private String actionPlanId;
}
