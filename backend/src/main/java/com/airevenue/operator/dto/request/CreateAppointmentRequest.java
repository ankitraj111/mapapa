package com.airevenue.operator.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CreateAppointmentRequest {
    @NotNull private UUID leadId;
    @NotBlank private String title;
    private String description;
    @NotNull private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String timezone = "Asia/Kolkata";
    private String meetingLink;
    private UUID assignedToId;
    private UUID conversationId;
}
