package com.airevenue.operator.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateFollowUpSequenceRequest {
    @NotBlank private String name;
    private boolean stopOnReply = true;
    private boolean stopOnBooking = true;
    private int maxFollowUps = 4;
}
