package com.airevenue.operator.controller;
import com.airevenue.operator.config.JwtPrincipal;
import com.airevenue.operator.dto.response.AuditLogResponse;
import com.airevenue.operator.repository.AuditLogRepository;
import com.airevenue.operator.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
public class AuditController {
    private final AuditLogRepository auditRepo;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AuditLogResponse>>> getAudit(
            @AuthenticationPrincipal JwtPrincipal p,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
            auditRepo.findByTenantIdOrderByCreatedAtDesc(p.tenantId(), PageRequest.of(page, size))
                .map(a -> AuditLogResponse.builder().id(a.getId()).tenantId(a.getTenantId())
                    .actorType(a.getActorType()).actorId(a.getActorId()).action(a.getAction())
                    .targetType(a.getTargetType()).targetId(a.getTargetId())
                    .result(a.getResult()).status(a.getStatus()).createdAt(a.getCreatedAt()).build())));
    }

    @GetMapping("/leads/{leadId}")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getLeadAudit(
            @AuthenticationPrincipal JwtPrincipal p, @PathVariable String leadId) {
        return ResponseEntity.ok(ApiResponse.success(
            auditRepo.findByTargetIdOrderByCreatedAtDesc(leadId).stream()
                .map(a -> AuditLogResponse.builder().id(a.getId()).action(a.getAction())
                    .actorType(a.getActorType()).result(a.getResult())
                    .status(a.getStatus()).createdAt(a.getCreatedAt()).build()).toList()));
    }
}
