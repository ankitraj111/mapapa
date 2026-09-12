package com.airevenue.operator.dto.response;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class FollowUpSequenceResponse {
    private UUID id;
    private String name;
    private Boolean isActive;
    private Boolean stopOnReply;
    private Boolean stopOnBooking;
    private Integer maxFollowUps;
    private LocalDateTime createdAt;
}
