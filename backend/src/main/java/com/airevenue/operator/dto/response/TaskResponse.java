package com.airevenue.operator.dto.response;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TaskResponse {
    private UUID id;
    private UUID tenantId;
    private UUID leadId;
    private String title;
    private String description;
    private String type;
    private String priority;
    private String status;
    private UUID assignedToId;
    private LocalDateTime dueAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
}
