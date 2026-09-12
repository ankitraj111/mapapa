package com.airevenue.operator.dto.request;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CreateTaskRequest {
    private String title;
    private String description;
    private String type;
    private String priority = "MEDIUM";
    private UUID leadId;
    private UUID assignedToId;
    private LocalDateTime dueAt;
}
