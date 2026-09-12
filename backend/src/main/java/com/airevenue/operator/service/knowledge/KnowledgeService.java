package com.airevenue.operator.service.knowledge;

import com.airevenue.operator.domain.model.KnowledgeDocument;
import com.airevenue.operator.dto.request.CreateKnowledgeDocumentRequest;
import com.airevenue.operator.dto.response.KnowledgeDocumentResponse;
import com.airevenue.operator.exception.ResourceNotFoundException;
import com.airevenue.operator.repository.KnowledgeDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class KnowledgeService {
    private final KnowledgeDocumentRepository repo;

    public List<KnowledgeDocumentResponse> getDocuments(UUID tenantId) {
        return repo.findByTenantIdAndIsActiveTrue(tenantId).stream().map(this::map).toList();
    }

    public KnowledgeDocumentResponse createDocument(UUID tenantId, CreateKnowledgeDocumentRequest req) {
        KnowledgeDocument doc = KnowledgeDocument.builder()
            .tenantId(tenantId)
            .title(req.getTitle())
            .content(req.getContent())
            .category(req.getCategory())
            .isActive(true)
            .build();
        return map(repo.save(doc));
    }

    public KnowledgeDocumentResponse updateDocument(UUID id, UUID tenantId, CreateKnowledgeDocumentRequest req) {
        KnowledgeDocument doc = repo.findById(id)
            .filter(d -> d.getTenantId().equals(tenantId))
            .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));
        doc.setTitle(req.getTitle());
        doc.setContent(req.getContent());
        doc.setCategory(req.getCategory());
        return map(repo.save(doc));
    }

    public void deleteDocument(UUID id, UUID tenantId) {
        KnowledgeDocument doc = repo.findById(id)
            .filter(d -> d.getTenantId().equals(tenantId))
            .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));
        doc.setActive(false);
        repo.save(doc);
    }

    public KnowledgeDocumentResponse uploadDocument(UUID tenantId, String title, String category, org.springframework.web.multipart.MultipartFile file) {
        try {
            String content = new String(file.getBytes(), java.nio.charset.StandardCharsets.UTF_8);
            if (content.isBlank()) {
                throw new IllegalArgumentException("Uploaded file is empty.");
            }
            String docTitle = (title != null && !title.isBlank()) ? title : file.getOriginalFilename();
            String docCategory = (category != null && !category.isBlank()) ? category.toUpperCase() : "DOCUMENTS";

            KnowledgeDocument doc = KnowledgeDocument.builder()
                .tenantId(tenantId)
                .title(docTitle != null ? docTitle : "Uploaded Document")
                .content(content)
                .category(docCategory)
                .isActive(true)
                .build();
            return map(repo.save(doc));
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse and store uploaded knowledge document: " + e.getMessage(), e);
        }
    }

    public List<KnowledgeDocumentResponse> getDocumentsByCategory(UUID tenantId, String category) {
        return repo.findByTenantIdAndIsActiveTrue(tenantId).stream()
            .filter(d -> category == null || category.equalsIgnoreCase("ALL") || category.equalsIgnoreCase(d.getCategory()))
            .map(this::map).toList();
    }

    public String buildBusinessContext(UUID tenantId) {
        List<KnowledgeDocument> docs = repo.findByTenantIdAndIsActiveTrue(tenantId);
        if (docs.isEmpty()) return "No additional business context provided. Answer strictly based on general inquiries.";
        StringBuilder sb = new StringBuilder("APPROVED BUSINESS KNOWLEDGE BASE (STRICT SOURCE OF TRUTH):\n\n");
        docs.forEach(d -> sb.append("### [").append(d.getCategory()).append("] ").append(d.getTitle()).append("\n")
            .append(d.getContent()).append("\n\n"));
        return sb.toString().trim();
    }

    private KnowledgeDocumentResponse map(KnowledgeDocument d) {
        return KnowledgeDocumentResponse.builder()
            .id(d.getId())
            .tenantId(d.getTenantId())
            .title(d.getTitle())
            .content(d.getContent())
            .category(d.getCategory())
            .isActive(d.isActive())
            .createdAt(d.getCreatedAt())
            .updatedAt(d.getUpdatedAt())
            .build();
    }
}