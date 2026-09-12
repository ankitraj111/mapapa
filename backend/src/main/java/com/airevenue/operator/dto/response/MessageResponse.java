package com.airevenue.operator.dto.response;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MessageResponse {
    private UUID id;
    private UUID conversationId;
    private String type;
    private String content;
    private String senderName;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
