package com.airevenue.operator.dto.response;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ConversationResponse {
    private UUID id;
    private UUID tenantId;
    private UUID leadId;
    private String channel;
    private String status;
    private String summary;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long messageCount;
}
