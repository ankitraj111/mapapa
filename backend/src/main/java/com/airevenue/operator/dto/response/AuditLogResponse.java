package com.airevenue.operator.dto.response;
import lombok.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuditLogResponse {
    private UUID id;
    private UUID tenantId;
    private String actorType;
    private String actorId;
    private String action;
    private String targetType;
    private String targetId;
    private String result;
    private String status;
    private String errorMessage;
    private ZonedDateTime createdAt;
}
