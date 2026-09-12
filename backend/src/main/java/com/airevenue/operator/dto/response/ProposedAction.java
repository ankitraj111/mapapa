package com.airevenue.operator.dto.response;
import lombok.*;
import java.util.List;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ProposedAction {
    private String actionType;
    private String description;
    private int estimatedCount;
    private List<UUID> leadIds;
}
