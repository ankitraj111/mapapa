package com.airevenue.operator.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendMessageRequest {
    @NotBlank private String content;
    private String type;
}
