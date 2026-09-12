package com.airevenue.operator.controller;

import com.airevenue.operator.config.JwtPrincipal;
import com.airevenue.operator.dto.request.CreateKnowledgeDocumentRequest;
import com.airevenue.operator.dto.response.KnowledgeDocumentResponse;
import com.airevenue.operator.service.knowledge.KnowledgeService;
import com.airevenue.operator.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/knowledge")
@RequiredArgsConstructor
public class KnowledgeController {

    private final KnowledgeService knowledgeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<KnowledgeDocumentResponse>>> getAll(
            @AuthenticationPrincipal JwtPrincipal p,
            @RequestParam(value = "category", required = false) String category) {
        if (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category)) {
            return ResponseEntity.ok(ApiResponse.success(knowledgeService.getDocumentsByCategory(p.getTenantId(), category)));
        }
        return ResponseEntity.ok(ApiResponse.success(knowledgeService.getDocuments(p.getTenantId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<KnowledgeDocumentResponse>> create(
            @AuthenticationPrincipal JwtPrincipal p,
            @Valid @RequestBody CreateKnowledgeDocumentRequest req) {
        return ResponseEntity.ok(ApiResponse.success(knowledgeService.createDocument(p.getTenantId(), req), "Created successfully"));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<KnowledgeDocumentResponse>> upload(
            @AuthenticationPrincipal JwtPrincipal p,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "category", defaultValue = "DOCUMENTS") String category) {
        KnowledgeDocumentResponse res = knowledgeService.uploadDocument(p.getTenantId(), title, category, file);
        return ResponseEntity.ok(ApiResponse.success(res, "Document uploaded and ingested successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<KnowledgeDocumentResponse>> update(
            @AuthenticationPrincipal JwtPrincipal p,
            @PathVariable UUID id,
            @RequestBody CreateKnowledgeDocumentRequest req) {
        return ResponseEntity.ok(ApiResponse.success(knowledgeService.updateDocument(id, p.getTenantId(), req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(
            @AuthenticationPrincipal JwtPrincipal p,
            @PathVariable UUID id) {
        knowledgeService.deleteDocument(id, p.getTenantId());
        return ResponseEntity.ok(ApiResponse.success("Document deleted", "OK"));
    }
}
