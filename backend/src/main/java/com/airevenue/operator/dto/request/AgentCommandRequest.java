package com.airevenue.operator.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AgentCommandRequest {
    @NotBlank private String command;
}
