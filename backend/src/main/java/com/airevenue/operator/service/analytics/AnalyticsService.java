package com.airevenue.operator.service.analytics;

import com.airevenue.operator.domain.enums.ActionStatus;
import com.airevenue.operator.domain.enums.FollowUpStatus;
import com.airevenue.operator.domain.enums.LeadStatus;
import com.airevenue.operator.domain.enums.MessageType;
import com.airevenue.operator.domain.model.*;
import com.airevenue.operator.dto.response.DashboardStatsResponse;
import com.airevenue.operator.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    private final LeadRepository leadRepository;
    private final ScheduledFollowUpRepository scheduledFollowUpRepository;
    private final AgentActionRepository agentActionRepository;
    private final AppointmentRepository appointmentRepository;
    private final KnowledgeDocumentRepository knowledgeDocumentRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

    public DashboardStatsResponse getDashboardStats(UUID tenantId) {
        ZonedDateTime startOfToday = LocalDate.now().atStartOfDay(ZoneOffset.UTC);

        long leadsToday = leadRepository.countByTenantIdAndCreatedAtAfter(tenantId, startOfToday);
        long qualifiedToday = leadRepository.countByTenantIdAndStatusInAndCreatedAtAfter(
            tenantId, List.of(LeadStatus.QUALIFIED, LeadStatus.HOT, LeadStatus.WARM), startOfToday);
        long hotLeads = leadRepository.countByTenantIdAndStatus(tenantId, LeadStatus.HOT);
        long meetingsBooked = appointmentRepository.countByTenantIdAndStatus(tenantId, com.airevenue.operator.domain.enums.AppointmentStatus.CONFIRMED)
            + appointmentRepository.countByTenantIdAndStatus(tenantId, com.airevenue.operator.domain.enums.AppointmentStatus.PENDING);
        long humanReviewCount = leadRepository.countByTenantIdAndStatus(tenantId, LeadStatus.HUMAN_REVIEW);
        long followUpsPending = scheduledFollowUpRepository.countByTenantIdAndStatus(tenantId, FollowUpStatus.PENDING);
        long aiActionsToday = agentActionRepository.countByTenantIdAndCreatedAtAfter(tenantId, startOfToday);
        Double pipeline = leadRepository.sumPipelineValue(tenantId);

        return DashboardStatsResponse.builder()
            .leadsToday(leadsToday)
            .qualifiedToday(qualifiedToday)
            .hotLeads(hotLeads)
            .meetingsBooked(meetingsBooked)
            .followUpsPending(followUpsPending)
            .aiActionsToday(aiActionsToday)
            .humanReviewCount(humanReviewCount)
            .estimatedPipeline(pipeline != null ? pipeline : 0.0)
            .build();
    }

    public List<Map<String, Object>> getAiActivity(UUID tenantId) {
        List<AgentAction> actions = agentActionRepository.findByTenantIdOrderByCreatedAtDesc(tenantId, PageRequest.of(0, 30));
        return actions.stream().map(a -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", a.getId().toString());
            m.put("type", a.getActionType());
            m.put("status", a.getStatus() != null ? a.getStatus().name() : "SUCCESS");
            m.put("latencyMs", a.getLatencyMs() != null ? a.getLatencyMs() : 350L);
            m.put("createdAt", a.getCreatedAt() != null ? a.getCreatedAt().toString() : ZonedDateTime.now().toString());
            m.put("leadId", a.getLeadId() != null ? a.getLeadId().toString() : null);
            return m;
        }).toList();
    }

    public List<Map<String, Object>> getLeadTrend(UUID tenantId, int days) {
        List<Map<String, Object>> trend = new ArrayList<>();
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            ZonedDateTime start = date.atStartOfDay(ZoneOffset.UTC);
            ZonedDateTime end = date.plusDays(1).atStartOfDay(ZoneOffset.UTC);

            long total = leadRepository.countByTenantIdAndCreatedAtBetween(tenantId, start, end);
            long qualified = leadRepository.countByTenantIdAndStatusInAndCreatedAtBetween(
                tenantId, List.of(LeadStatus.QUALIFIED, LeadStatus.HOT, LeadStatus.WARM), start, end);

            Map<String, Object> point = new HashMap<>();
            point.put("date", date.toString());
            point.put("day", date.getDayOfWeek().name().substring(0, 3));
            point.put("leads", total);
            point.put("qualified", qualified);
            trend.add(point);
        }
        return trend;
    }

    public List<Map<String, Object>> getStatusDistribution(UUID tenantId) {
        List<Object[]> rows = leadRepository.countGroupByStatus(tenantId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> item = new HashMap<>();
            item.put("status", r[0] != null ? r[0].toString() : "UNKNOWN");
            item.put("count", ((Number) r[1]).longValue());
            result.add(item);
        }
        return result;
    }

    @Transactional
    public Map<String, Object> seedDemoData(UUID tenantId) {
        // 1. Seed Knowledge Base if empty
        if (knowledgeDocumentRepository.findByTenantIdAndIsActiveTrue(tenantId).isEmpty()) {
            knowledgeDocumentRepository.save(KnowledgeDocument.builder()
                .tenantId(tenantId)
                .title("Custom Web & Mobile Development")
                .category("SERVICES")
                .content("We build modern web applications, e-commerce stores, and cross-platform mobile apps using Next.js, React, Node.js, and Cloud native tools.")
                .isActive(true)
                .build());

            knowledgeDocumentRepository.save(KnowledgeDocument.builder()
                .tenantId(tenantId)
                .title("Pricing & Engagement Models")
                .category("PRICING")
                .content("Standard websites start at ₹1,00,000. Custom Web Apps & E-commerce range between ₹2,50,000 and ₹7,50,000. Monthly growth retainers start at ₹50,000/month.")
                .isActive(true)
                .build());

            knowledgeDocumentRepository.save(KnowledgeDocument.builder()
                .tenantId(tenantId)
                .title("Frequently Asked Questions")
                .category("FAQ")
                .content("Q: How long does a project take? A: Typically 4-8 weeks depending on scope. Q: Do you provide post-launch support? A: Yes, 30 days of complimentary support is included.")
                .isActive(true)
                .build());
        }

        // 2. Seed Sample Leads if empty
        if (leadRepository.findByTenantId(tenantId).isEmpty()) {
            // Lead 1: Hot lead with booked meeting
            Lead hotLead = leadRepository.save(Lead.builder()
                .tenantId(tenantId)
                .firstName("John").lastName("Smith")
                .email("john.smith@acmecorp.com").phone("+91 98765 43210")
                .company("Acme Retail Corp")
                .source("WEBSITE_FORM")
                .requirement("Need custom multi-vendor e-commerce platform with ERP integration")
                .estimatedBudget(BigDecimal.valueOf(350000))
                .timeline("30 days")
                .intent("HIGH")
                .score(92)
                .status(LeadStatus.HOT)
                .aiSummary("High-budget e-commerce project. Immediate timeline. Ready for discovery call.")
                .lastContactedAt(ZonedDateTime.now().minusMinutes(25))
                .build());

            Conversation c1 = conversationRepository.save(Conversation.builder()
                .tenantId(tenantId).lead(hotLead).channel("WEBSITE_FORM").status("OPEN").build());

            messageRepository.save(Message.builder().tenantId(tenantId).conversation(c1).type(MessageType.CUSTOMER)
                .content("Hi, we are looking for a complete revamp of our store. Budget is ₹3.5 Lakhs. Can we launch in a month?")
                .senderName("John Smith").isRead(true).build());

            messageRepository.save(Message.builder().tenantId(tenantId).conversation(c1).type(MessageType.AI)
                .content("Hello John! Thanks for reaching out to us. We would love to build your e-commerce platform. Your budget and 30-day timeline fit well within our standard sprint model. Would you like to schedule a 30-minute technical consultation?")
                .senderName("Alex — AI Sales Employee").isRead(true).build());

            agentActionRepository.save(AgentAction.builder()
                .tenantId(tenantId).leadId(hotLead.getId()).conversationId(c1.getId())
                .actionType("INITIAL_RESPONSE").status(ActionStatus.SUCCESS).latencyMs(420L).build());

            // Lead 2: Qualifying lead
            Lead qualLead = leadRepository.save(Lead.builder()
                .tenantId(tenantId)
                .firstName("Sarah").lastName("Wilson")
                .email("sarah@growthlabs.io").phone("+91 91234 56789")
                .company("GrowthLabs Marketing")
                .source("WEBSITE_FORM")
                .requirement("SEO audit and landing page conversion optimization")
                .estimatedBudget(BigDecimal.valueOf(120000))
                .timeline("2-3 weeks")
                .intent("MEDIUM")
                .score(75)
                .status(LeadStatus.QUALIFYING)
                .aiSummary("Inquiring about monthly retainer and SEO optimization services.")
                .lastContactedAt(ZonedDateTime.now().minusHours(2))
                .build());

            Conversation c2 = conversationRepository.save(Conversation.builder()
                .tenantId(tenantId).lead(qualLead).channel("WEBSITE_FORM").status("OPEN").build());

            messageRepository.save(Message.builder().tenantId(tenantId).conversation(c2).type(MessageType.CUSTOMER)
                .content("We need help boosting our inbound conversion rates and an organic SEO audit.")
                .senderName("Sarah Wilson").isRead(true).build());

            messageRepository.save(Message.builder().tenantId(tenantId).conversation(c2).type(MessageType.AI)
                .content("Hi Sarah! Great to connect. We specialize in conversion-focused landing pages and technical SEO audits. What is the current monthly traffic on your website?")
                .senderName("Alex — AI Sales Employee").isRead(true).build());

            agentActionRepository.save(AgentAction.builder()
                .tenantId(tenantId).leadId(qualLead.getId()).conversationId(c2.getId())
                .actionType("QUALIFY_RESPONSE").status(ActionStatus.SUCCESS).latencyMs(380L).build());
        }

        return Map.of("success", true, "message", "Demo data generated successfully");
    }
}
