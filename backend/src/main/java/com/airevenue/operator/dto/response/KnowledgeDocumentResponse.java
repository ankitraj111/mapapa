package com.airevenue.operator.dto.response;

import lombok.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KnowledgeDocumentResponse {
    private UUID id;
    private UUID tenantId;
    private String title;
    private String content;
    private String category;
    private Boolean isActive;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}