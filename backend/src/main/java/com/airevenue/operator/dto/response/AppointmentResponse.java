package com.airevenue.operator.dto.response;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AppointmentResponse {
    private UUID id;
    private UUID tenantId;
    private UUID leadId;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String timezone;
    private String meetingLink;
    private String status;
    private UUID assignedToId;
    private LocalDateTime createdAt;
}
