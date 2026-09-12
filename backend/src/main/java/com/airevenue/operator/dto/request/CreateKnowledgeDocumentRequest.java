package com.airevenue.operator.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateKnowledgeDocumentRequest {
    @NotBlank private String title;
    @NotBlank private String content;
    @NotBlank private String category;
}
