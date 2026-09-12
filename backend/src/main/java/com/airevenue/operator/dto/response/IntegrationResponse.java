package com.airevenue.operator.dto.response;
import lombok.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class IntegrationResponse {
    private UUID id;
    private UUID tenantId;
    private String type;
    private String status;
    private String lastErrorMessage;
    private ZonedDateTime lastSyncedAt;
    private Boolean isActive;
    private ZonedDateTime createdAt;
}
