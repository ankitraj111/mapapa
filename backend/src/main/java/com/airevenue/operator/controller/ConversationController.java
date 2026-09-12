package com.airevenue.operator.controller;

import com.airevenue.operator.config.JwtPrincipal;
import com.airevenue.operator.domain.enums.MessageType;
import com.airevenue.operator.domain.model.*;
import com.airevenue.operator.dto.request.*;
import com.airevenue.operator.dto.response.*;
import com.airevenue.operator.repository.*;
import com.airevenue.operator.service.ai.AIConversationService;
import com.airevenue.operator.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional(readOnly = true)
public class ConversationController {
    private final ConversationRepository conversationRepo;
    private final MessageRepository messageRepo;
    private final LeadRepository leadRepository;
    private final AIConversationService aiConversationService;

    @GetMapping("/api/v1/conversations")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllConversations(
            @AuthenticationPrincipal JwtPrincipal p) {
        List<Conversation> convs = conversationRepo.findByTenantId(p.getTenantId());
        List<Map<String, Object>> result = new ArrayList<>();
        for (Conversation c : convs) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("tenantId", c.getTenantId());
            Lead lead = c.getLead();
            if (lead != null) {
                map.put("leadId", lead.getId());
                String fName = lead.getFirstName() != null ? lead.getFirstName() : "";
                String lName = lead.getLastName() != null ? lead.getLastName() : "";
                map.put("leadName", (fName + " " + lName).trim());
                map.put("company", lead.getCompany());
                map.put("summary", c.getSummary() != null ? c.getSummary() : lead.getAiSummary());
            } else {
                map.put("leadId", null);
                map.put("leadName", "Inbound Lead");
                map.put("company", null);
                map.put("summary", c.getSummary());
            }
            map.put("channel", c.getChannel());
            map.put("status", c.getStatus());
            map.put("createdAt", c.getCreatedAt() != null ? c.getCreatedAt().toString() : null);
            map.put("updatedAt", c.getUpdatedAt() != null ? c.getUpdatedAt().toString() : null);
            result.add(map);
        }
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/api/v1/conversations/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getConversation(
            @AuthenticationPrincipal JwtPrincipal p, @PathVariable UUID id) {
        Conversation c = conversationRepo.findById(id).orElseThrow();
        Map<String, Object> map = new HashMap<>();
        map.put("id", c.getId());
        map.put("tenantId", c.getTenantId());
        Lead lead = c.getLead();
        if (lead != null) {
            map.put("leadId", lead.getId());
            String fName = lead.getFirstName() != null ? lead.getFirstName() : "";
            String lName = lead.getLastName() != null ? lead.getLastName() : "";
            map.put("leadName", (fName + " " + lName).trim());
            map.put("company", lead.getCompany());
        }
        map.put("channel", c.getChannel());
        map.put("status", c.getStatus());
        map.put("summary", c.getSummary());
        map.put("createdAt", c.getCreatedAt() != null ? c.getCreatedAt().toString() : null);
        map.put("updatedAt", c.getUpdatedAt() != null ? c.getUpdatedAt().toString() : null);
        return ResponseEntity.ok(ApiResponse.success(map));
    }

    @GetMapping("/api/v1/leads/{leadId}/conversations")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getLeadConversations(
            @AuthenticationPrincipal JwtPrincipal p, @PathVariable UUID leadId) {
        List<Conversation> convs = conversationRepo.findByLeadId(leadId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Conversation c : convs) {
            if (c.getTenantId().equals(p.getTenantId())) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", c.getId());
                map.put("tenantId", c.getTenantId());
                map.put("leadId", c.getLead() != null ? c.getLead().getId() : null);
                map.put("channel", c.getChannel());
                map.put("status", c.getStatus());
                map.put("summary", c.getSummary());
                map.put("createdAt", c.getCreatedAt() != null ? c.getCreatedAt().toString() : null);
                map.put("updatedAt", c.getUpdatedAt() != null ? c.getUpdatedAt().toString() : null);
                result.add(map);
            }
        }
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/api/v1/conversations/{id}/messages")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMessages(
            @AuthenticationPrincipal JwtPrincipal p, @PathVariable UUID id) {
        List<Message> msgs = messageRepo.findByConversationIdOrderByCreatedAtAsc(id);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Message m : msgs) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", m.getId());
            map.put("conversationId", m.getConversation() != null ? m.getConversation().getId() : id);
            map.put("type", m.getType() != null ? m.getType().name() : "HUMAN");
            map.put("content", m.getContent());
            map.put("senderName", m.getSenderName());
            map.put("isRead", m.isRead());
            map.put("createdAt", m.getCreatedAt() != null ? m.getCreatedAt().toString() : null);
            result.add(map);
        }
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @org.springframework.transaction.annotation.Transactional
    @PostMapping("/api/v1/conversations/{id}/messages")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendMessage(
            @AuthenticationPrincipal JwtPrincipal p,
            @PathVariable UUID id,
            @RequestBody SendMessageRequest req) {

        Conversation conv = conversationRepo.findById(id).orElseThrow();
        String typeStr = req.getType() != null ? req.getType().toUpperCase() : "HUMAN";
        MessageType msgType = MessageType.valueOf(typeStr);
        
        Message msg = Message.builder()
            .tenantId(p.getTenantId()).conversation(conv)
            .type(msgType)
            .content(req.getContent())
            .senderName(msgType == MessageType.CUSTOMER ? "Customer" : "Human Representative")
            .isRead(true).build();
        msg = messageRepo.save(msg);

        // If message is from customer, let autonomous AI process the reply/qualification/handoff
        if (msgType == MessageType.CUSTOMER && conv.getLead() != null) {
            aiConversationService.processLeadMessage(conv.getLead(), conv, req.getContent());
        }

        Map<String, Object> map = new HashMap<>();
        map.put("id", msg.getId());
        map.put("conversationId", msg.getConversation() != null ? msg.getConversation().getId() : id);
        map.put("type", msg.getType().name());
        map.put("content", msg.getContent());
        map.put("senderName", msg.getSenderName());
        map.put("isRead", msg.isRead());
        map.put("createdAt", msg.getCreatedAt() != null ? msg.getCreatedAt().toString() : null);
        return ResponseEntity.ok(ApiResponse.success(map));
    }

    @PostMapping("/api/v1/leads/{leadId}/conversations")
    public ResponseEntity<ApiResponse<ConversationResponse>> createConversation(
            @AuthenticationPrincipal JwtPrincipal p,
            @PathVariable UUID leadId,
            @RequestBody(required = false) CreateConversationRequest req) {
        
        Lead lead = leadRepository.findById(leadId).orElseThrow();
        String channel = req != null && req.getChannel() != null ? req.getChannel() : "WEBHOOK";
        Conversation conv = Conversation.builder()
            .tenantId(p.getTenantId()).lead(lead)
            .channel(channel).status("OPEN").build();
        conv = conversationRepo.save(conv);
        
        ConversationResponse response = ConversationResponse.builder()
            .id(conv.getId()).tenantId(conv.getTenantId()).leadId(conv.getLead().getId())
            .channel(conv.getChannel()).status(conv.getStatus())
            .createdAt(conv.getCreatedAt().toLocalDateTime()).build();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
