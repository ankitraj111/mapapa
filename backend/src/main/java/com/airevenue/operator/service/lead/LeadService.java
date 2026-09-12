package com.airevenue.operator.service.lead;

import com.airevenue.operator.domain.enums.LeadStatus;
import com.airevenue.operator.domain.model.*;
import com.airevenue.operator.dto.request.*;
import com.airevenue.operator.dto.response.*;
import com.airevenue.operator.exception.*;
import com.airevenue.operator.repository.*;
import com.airevenue.operator.service.ai.AIConversationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class LeadService {
    private final LeadRepository leadRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final LeadScoringService leadScoringService;
    private final AgentActionRepository agentActionRepository;
    private final AuditLogRepository auditLogRepository;
    private final AIConversationService aiConversationService;

    public Page<LeadSummaryResponse> getLeads(UUID tenantId, String status, String search, Pageable pageable) {
        if (status != null && !status.isBlank()) {
            return leadRepository.findByTenantIdAndStatus(tenantId, LeadStatus.valueOf(status), pageable).map(this::mapToSummary);
        }
        if (search != null && !search.isBlank()) {
            return leadRepository.findByTenantIdAndSearch(tenantId, search.toLowerCase(), pageable).map(this::mapToSummary);
        }
        return leadRepository.findByTenantId(tenantId, pageable).map(this::mapToSummary);
    }

    public List<LeadSummaryResponse> getHotLeads(UUID tenantId, int minScore) {
        return leadRepository.findByTenantIdAndScoreGreaterThanEqualOrderByScoreDesc(tenantId, minScore)
            .stream().map(this::mapToSummary).toList();
    }

    public LeadResponse getLead(UUID id, UUID tenantId) {
        return mapToResponse(leadRepository.findById(id)
            .filter(l -> l.getTenantId().equals(tenantId))
            .orElseThrow(() -> new LeadNotFoundException("Lead not found: " + id)));
    }

    public LeadResponse createLead(UUID tenantId, CreateLeadRequest req) {
        Lead lead = buildLead(tenantId, req, "MANUAL");
        lead = leadRepository.save(lead);

        Conversation conv = conversationRepository.save(Conversation.builder()
            .tenantId(tenantId).lead(lead).channel("WEBSITE_FORM").status("OPEN").build());

        if (req.getRequirement() != null && !req.getRequirement().isBlank()) {
            messageRepository.save(Message.builder()
                .tenantId(tenantId).conversation(conv)
                .type(com.airevenue.operator.domain.enums.MessageType.CUSTOMER)
                .content(req.getRequirement())
                .senderName(req.getFirstName() + " " + Optional.ofNullable(req.getLastName()).orElse(""))
                .isRead(false).build());
        }

        int score = leadScoringService.calculateScore(lead);
        lead.setScore(score);
        lead.setStatus(leadScoringService.determineStatus(score));
        lead = leadRepository.save(lead);

        final Lead savedLead = lead;
        final Conversation savedConv = conv;
        // trigger async AI processing after transaction commits
        if (org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive()) {
            org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                new org.springframework.transaction.support.TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        processWithAI(savedLead.getId(), tenantId);
                    }
                }
            );
        } else {
            processWithAI(savedLead.getId(), tenantId);
        }

        return mapToResponse(lead);
    }

    public LeadResponse updateLead(UUID id, UUID tenantId, UpdateLeadRequest req) {
        Lead lead = leadRepository.findById(id)
            .filter(l -> l.getTenantId().equals(tenantId))
            .orElseThrow(() -> new LeadNotFoundException("Lead not found: " + id));

        if (req.getFirstName() != null) lead.setFirstName(com.airevenue.operator.util.SanitizationUtils.sanitize(req.getFirstName()));
        if (req.getLastName() != null) lead.setLastName(com.airevenue.operator.util.SanitizationUtils.sanitize(req.getLastName()));
        if (req.getPhone() != null) lead.setPhone(com.airevenue.operator.util.SanitizationUtils.sanitizePhone(req.getPhone()));
        if (req.getCompany() != null) lead.setCompany(com.airevenue.operator.util.SanitizationUtils.sanitize(req.getCompany()));
        if (req.getLocation() != null) lead.setLocation(com.airevenue.operator.util.SanitizationUtils.sanitize(req.getLocation()));
        if (req.getRequirement() != null) lead.setRequirement(com.airevenue.operator.util.SanitizationUtils.sanitize(req.getRequirement()));
        if (req.getEstimatedBudget() != null) lead.setEstimatedBudget(BigDecimal.valueOf(req.getEstimatedBudget()));
        if (req.getTimeline() != null) lead.setTimeline(com.airevenue.operator.util.SanitizationUtils.sanitize(req.getTimeline()));
        if (req.getIntent() != null) lead.setIntent(com.airevenue.operator.util.SanitizationUtils.sanitize(req.getIntent()));

        return mapToResponse(leadRepository.save(lead));
    }

    public LeadResponse updateStatus(UUID id, UUID tenantId, String newStatusStr) {
        Lead lead = leadRepository.findById(id)
            .filter(l -> l.getTenantId().equals(tenantId))
            .orElseThrow(() -> new LeadNotFoundException("Lead not found: " + id));
        lead.setStatus(LeadStatus.valueOf(newStatusStr));
        return mapToResponse(leadRepository.save(lead));
    }

    public void deleteLead(UUID id, UUID tenantId) {
        Lead lead = leadRepository.findById(id)
            .filter(l -> l.getTenantId().equals(tenantId))
            .orElseThrow(() -> new LeadNotFoundException("Lead not found: " + id));
        leadRepository.delete(lead);
    }

    public PipelineResponse getPipeline(UUID tenantId) {
        Map<String, List<LeadSummaryResponse>> columns = new LinkedHashMap<>();
        columns.put("NEW", leadRepository.findByTenantIdAndStatus(tenantId, LeadStatus.NEW, Pageable.ofSize(50)).map(this::mapToSummary).getContent());
        columns.put("QUALIFYING", leadRepository.findByTenantIdAndStatus(tenantId, LeadStatus.QUALIFYING, Pageable.ofSize(50)).map(this::mapToSummary).getContent());
        columns.put("QUALIFIED", leadRepository.findByTenantIdAndStatus(tenantId, LeadStatus.QUALIFIED, Pageable.ofSize(50)).map(this::mapToSummary).getContent());
        columns.put("HOT", leadRepository.findByTenantIdAndStatus(tenantId, LeadStatus.HOT, Pageable.ofSize(50)).map(this::mapToSummary).getContent());
        columns.put("MEETING_BOOKED", leadRepository.findByTenantIdAndStatus(tenantId, LeadStatus.MEETING_BOOKED, Pageable.ofSize(50)).map(this::mapToSummary).getContent());
        columns.put("NURTURE", leadRepository.findByTenantIdAndStatus(tenantId, LeadStatus.NURTURE, Pageable.ofSize(50)).map(this::mapToSummary).getContent());
        columns.put("WON", leadRepository.findByTenantIdAndStatus(tenantId, LeadStatus.WON, Pageable.ofSize(50)).map(this::mapToSummary).getContent());
        columns.put("LOST", leadRepository.findByTenantIdAndStatus(tenantId, LeadStatus.LOST, Pageable.ofSize(50)).map(this::mapToSummary).getContent());
        return PipelineResponse.builder().columns(columns).build();
    }

    @Async
    public void processWithAI(UUID leadId, UUID tenantId) {
        try {
            log.info("Starting async AI processing for lead {}", leadId);
            Lead lead = leadRepository.findById(leadId).orElse(null);
            if (lead == null) { log.warn("Lead {} not found for AI processing", leadId); return; }

            List<Conversation> convs = conversationRepository.findByLeadId(leadId);
            Conversation conv = convs.isEmpty()
                ? conversationRepository.save(Conversation.builder()
                    .tenantId(tenantId).lead(lead).channel("WEBSITE_FORM").status("OPEN").build())
                : convs.get(0);

            String aiReply = aiConversationService.processNewLead(lead, conv);
            if (aiReply != null) {
                log.info("AI processed lead {} successfully", leadId);
            }
        } catch (Exception e) {
            log.error("Async AI processing failed for lead {}: {}", leadId, e.getMessage(), e);
        }
    }

    public LeadResponse recalculateScore(UUID id, UUID tenantId) {
        Lead lead = leadRepository.findById(id)
            .filter(l -> l.getTenantId().equals(tenantId))
            .orElseThrow(() -> new LeadNotFoundException("Lead not found: " + id));
        lead.setScore(leadScoringService.calculateScore(lead));
        leadScoringService.updateStatusFromScore(lead);
        return mapToResponse(leadRepository.save(lead));
    }

    public List<Map<String, Object>> getLeadActivities(UUID leadId, UUID tenantId) {
        return agentActionRepository.findByLeadIdOrderByCreatedAtDesc(leadId).stream()
            .map(a -> Map.<String, Object>of(
                "id", a.getId().toString(),
                "type", a.getActionType(),
                "status", a.getStatus().name(),
                "createdAt", a.getCreatedAt() != null ? a.getCreatedAt().toString() : "",
                "latencyMs", a.getLatencyMs() != null ? a.getLatencyMs() : 0
            )).toList();
    }

    public Lead createLeadInternal(UUID tenantId, CreateLeadRequest req) {
        Lead lead = buildLead(tenantId, req, req.getSource() != null ? req.getSource() : "WEBHOOK");
        lead = leadRepository.save(lead);
        int score = leadScoringService.calculateScore(lead);
        lead.setScore(score);
        lead.setStatus(leadScoringService.determineStatus(score));
        return leadRepository.save(lead);
    }

    private Lead buildLead(UUID tenantId, CreateLeadRequest req, String defaultSource) {
        return Lead.builder()
            .tenantId(tenantId)
            .firstName(com.airevenue.operator.util.SanitizationUtils.sanitize(req.getFirstName()))
            .lastName(com.airevenue.operator.util.SanitizationUtils.sanitize(req.getLastName()))
            .email(com.airevenue.operator.util.SanitizationUtils.sanitizeEmail(req.getEmail()))
            .phone(com.airevenue.operator.util.SanitizationUtils.sanitizePhone(req.getPhone()))
            .company(com.airevenue.operator.util.SanitizationUtils.sanitize(req.getCompany()))
            .source(req.getSource() != null ? req.getSource() : defaultSource)
            .sourceCampaign(com.airevenue.operator.util.SanitizationUtils.sanitize(req.getSourceCampaign()))
            .location(com.airevenue.operator.util.SanitizationUtils.sanitize(req.getLocation()))
            .requirement(com.airevenue.operator.util.SanitizationUtils.sanitize(req.getRequirement()))
            .estimatedBudget(req.getEstimatedBudget() != null ? BigDecimal.valueOf(req.getEstimatedBudget()) : null)
            .timeline(com.airevenue.operator.util.SanitizationUtils.sanitize(req.getTimeline()))
            .intent(com.airevenue.operator.util.SanitizationUtils.sanitize(req.getIntent()))
            .score(0).status(LeadStatus.NEW).build();
    }

    private LeadResponse mapToResponse(Lead l) {
        return LeadResponse.builder()
            .id(l.getId()).tenantId(l.getTenantId())
            .firstName(l.getFirstName()).lastName(l.getLastName())
            .email(l.getEmail()).phone(l.getPhone()).company(l.getCompany())
            .source(l.getSource()).sourceCampaign(l.getSourceCampaign())
            .location(l.getLocation()).requirement(l.getRequirement())
            .score(l.getScore()).status(l.getStatus())
            .qualificationStatus(l.getQualificationStatus())
            .aiSummary(l.getAiSummary()).humanNotes(l.getHumanNotes())
            .lastContactedAt(l.getLastContactedAt()).nextFollowUpAt(l.getNextFollowUpAt())
            .createdAt(l.getCreatedAt()).updatedAt(l.getUpdatedAt())
            .build();
    }

    private LeadSummaryResponse mapToSummary(Lead l) {
        return LeadSummaryResponse.builder()
            .id(l.getId()).firstName(l.getFirstName()).lastName(l.getLastName())
            .email(l.getEmail()).company(l.getCompany()).source(l.getSource())
            .score(l.getScore()).status(l.getStatus())
            .createdAt(l.getCreatedAt()).lastContactedAt(l.getLastContactedAt())
            .nextFollowUpAt(l.getNextFollowUpAt()).build();
    }
}
