package com.airevenue.operator.dto.request;
import lombok.Data;
import java.util.UUID;

@Data
public class CreateConversationRequest {
    private UUID leadId;
    private String channel;
}
