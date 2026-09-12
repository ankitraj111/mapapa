package com.airevenue.operator.service.ai;

import com.airevenue.operator.domain.enums.ActionStatus;
import com.airevenue.operator.domain.enums.LeadStatus;
import com.airevenue.operator.domain.enums.MessageType;
import com.airevenue.operator.domain.model.*;
import com.airevenue.operator.repository.*;
import com.airevenue.operator.service.followup.FollowUpService;
import com.airevenue.operator.service.knowledge.KnowledgeService;
import com.airevenue.operator.service.lead.LeadScoringService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIConversationService {
    private final AIProvider aiProvider;
    private final LeadRepository leadRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final TenantRepository tenantRepository;
    private final AgentActionRepository agentActionRepository;
    private final KnowledgeService knowledgeService;
    private final LeadScoringService leadScoringService;
    private final FollowUpService followUpService;
    private final NotificationRepository notificationRepository;

    private static final Pattern HUMAN_HANDOFF_PATTERN = Pattern.compile(
        "\\b(human|person|agent|representative|rep|specialist|manager|talk to someone|call me|support person|real person|speak with|operator)\\b",
        Pattern.CASE_INSENSITIVE
    );

    private static final Pattern BUDGET_PATTERN = Pattern.compile(
        "(?:budget|cost|price|around|upto|approx)?\\s*(?:₹|rs\\.?|inr|\\$)?\\s*(\\d+[kKmMbB]?|\\d{4,9})",
        Pattern.CASE_INSENSITIVE
    );

    @Transactional
    public String processNewLead(Lead lead, Conversation conversation) {
        long start = System.currentTimeMillis();
        log.info("Processing new lead {} with autonomous AI", lead.getId());

        try {
            Tenant tenant = tenantRepository.findById(lead.getTenantId())
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

            String businessContext = knowledgeService.buildBusinessContext(lead.getTenantId());
            String leadInfo = buildLeadInfo(lead);
            String aiTone = tenant.getAiTone() != null ? tenant.getAiTone() : "professional";

            String systemPrompt = buildSystemPrompt(tenant.getName(), businessContext, leadInfo, aiTone);

            String userPrompt = "New inbound lead: " + lead.getFirstName() +
                (lead.getCompany() != null ? " from " + lead.getCompany() : "") +
                " is interested in: " + Optional.ofNullable(lead.getRequirement()).orElse("your services") +
                ". Estimated Budget: " + (lead.getEstimatedBudget() != null ? "₹" + lead.getEstimatedBudget() : "Not specified") +
                ". Generate your first touch response.";

            String aiResponse = aiProvider.generateText(systemPrompt, userPrompt, "gpt-4o-mini");

            Message aiMsg = Message.builder()
                .tenantId(lead.getTenantId())
                .conversation(conversation)
                .type(MessageType.AI)
                .content(aiResponse)
                .senderName("AI Sales Employee")
                .isRead(true)
                .build();
            messageRepository.save(aiMsg);

            lead.setStatus(LeadStatus.CONTACTED);
            lead.setLastContactedAt(ZonedDateTime.now());
            lead.setAiSummary("Autonomous first touch dispatched. Lead expressed interest in: " +
                Optional.ofNullable(lead.getRequirement()).orElse("general inquiries"));
            
            // Recalculate lead score
            lead.setScore(leadScoringService.calculateScore(lead));
            leadRepository.save(lead);

            long latency = System.currentTimeMillis() - start;
            agentActionRepository.save(AgentAction.builder()
                .tenantId(lead.getTenantId())
                .leadId(lead.getId())
                .conversationId(conversation.getId())
                .actionType("AUTONOMOUS_FIRST_TOUCH")
                .status(ActionStatus.SUCCESS)
                .aiModel("gpt-4o-mini")
                .latencyMs(latency)
                .build());

            log.info("Autonomous AI processed lead {} in {}ms", lead.getId(), latency);
            return aiResponse;

        } catch (Exception e) {
            log.error("Autonomous AI processing failed for lead {}: {}", lead.getId(), e.getMessage(), e);

            agentActionRepository.save(AgentAction.builder()
                .tenantId(lead.getTenantId())
                .leadId(lead.getId())
                .conversationId(conversation.getId())
                .actionType("AUTONOMOUS_FIRST_TOUCH")
                .status(ActionStatus.FAILED)
                .errorMessage(e.getMessage())
                .build());

            return null;
        }
    }

    @Transactional
    public String processLeadMessage(Lead lead, Conversation conversation, String customerMessage) {
        long start = System.currentTimeMillis();
        log.info("Processing customer message for lead {}", lead.getId());

        try {
            Tenant tenant = tenantRepository.findById(lead.getTenantId()).orElseThrow();
            
            // ── CHECK 2: FOLLOW-UP SAFETY — CANCEL PENDING FOLLOW-UPS ON REPLY ──
            followUpService.cancelFollowUpsForLead(lead.getId(), "Lead actively replied in live conversation");

            // ── CHECK 3: HUMAN HANDOFF DETECTION ─────────────────────────────
            if (HUMAN_HANDOFF_PATTERN.matcher(customerMessage).find()) {
                log.info("Human handoff request detected for lead {}", lead.getId());
                lead.setStatus(LeadStatus.HUMAN_REVIEW);
                lead.setHumanNotes("Customer requested to connect with a human representative: \"" + customerMessage + "\"");
                leadRepository.save(lead);

                // Notify workspace team
                notificationRepository.save(Notification.builder()
                    .tenantId(lead.getTenantId())
                    .type("HUMAN_HANDOFF")
                    .title("Human Handoff Request: " + lead.getFirstName() + " " + Optional.ofNullable(lead.getLastName()).orElse(""))
                    .message("Customer requested a representative: \"" + customerMessage + "\"")
                    .isRead(false)
                    .build());

                String handoffMsg = "I understand you'd like to connect directly with a team member! " +
                    "I've flagged this conversation for our senior specialists. A representative from " +
                    tenant.getName() + " has been notified and will reach out to you shortly.";

                messageRepository.save(Message.builder()
                    .tenantId(lead.getTenantId())
                    .conversation(conversation)
                    .type(MessageType.AI)
                    .content(handoffMsg)
                    .senderName("AI Sales Employee")
                    .isRead(true)
                    .build());

                agentActionRepository.save(AgentAction.builder()
                    .tenantId(lead.getTenantId())
                    .leadId(lead.getId())
                    .conversationId(conversation.getId())
                    .actionType("HUMAN_HANDOFF_TRIGGERED")
                    .status(ActionStatus.SUCCESS)
                    .latencyMs(System.currentTimeMillis() - start)
                    .build());

                return handoffMsg;
            }

            // ── CHECK 1: AUTONOMOUS QUALIFICATION & ENTITY EXTRACTION ─────────
            extractAndQualify(lead, customerMessage);
            lead.setScore(leadScoringService.calculateScore(lead));

            String businessContext = knowledgeService.buildBusinessContext(lead.getTenantId());
            String leadInfo = buildLeadInfo(lead);
            String conversationHistory = buildConversationHistory(conversation.getId());

            String systemPrompt = buildSystemPromptWithHistory(
                tenant.getName(), businessContext, leadInfo,
                tenant.getAiTone() != null ? tenant.getAiTone() : "professional",
                conversationHistory, lead.getScore() != null ? lead.getScore() : 50
            );

            String aiResponse = aiProvider.generateText(systemPrompt, customerMessage, "gpt-4o-mini");

            messageRepository.save(Message.builder()
                .tenantId(lead.getTenantId())
                .conversation(conversation)
                .type(MessageType.AI)
                .content(aiResponse)
                .senderName("AI Sales Employee")
                .isRead(true)
                .build());

            lead.setLastContactedAt(ZonedDateTime.now());
            if (lead.getStatus() == LeadStatus.CONTACTED || lead.getStatus() == LeadStatus.NEW ||
                lead.getStatus() == LeadStatus.NURTURE || lead.getStatus() == LeadStatus.NO_RESPONSE ||
                lead.getStatus() == LeadStatus.COLD) {
                lead.setStatus(LeadStatus.QUALIFYING);
            }
            leadRepository.save(lead);

            long latency = System.currentTimeMillis() - start;
            agentActionRepository.save(AgentAction.builder()
                .tenantId(lead.getTenantId())
                .leadId(lead.getId())
                .conversationId(conversation.getId())
                .actionType("QUALIFICATION_TURN")
                .status(ActionStatus.SUCCESS)
                .aiModel("gpt-4o-mini")
                .latencyMs(latency)
                .build());

            return aiResponse;

        } catch (Exception e) {
            log.error("Failed to process customer message for lead {}: {}", lead.getId(), e.getMessage());
            return null;
        }
    }

    private void extractAndQualify(Lead lead, String text) {
        String lower = text.toLowerCase();
        
        // Timeline hints
        if (lower.contains("urgent") || lower.contains("asap") || lower.contains("immediately") || lower.contains("this week")) {
            lead.setTimeline("Immediate (< 1 week)");
        } else if (lower.contains("month") || lower.contains("30 days") || lower.contains("4 weeks")) {
            lead.setTimeline("1 Month");
        } else if (lower.contains("quarter") || lower.contains("3 months") || lower.contains("q1") || lower.contains("q2")) {
            lead.setTimeline("3 Months");
        }

        // Budget hints
        Matcher m = BUDGET_PATTERN.matcher(text);
        if (m.find()) {
            try {
                String raw = m.group(1).toLowerCase().replace(",", "");
                double val;
                if (raw.endsWith("k")) {
                    val = Double.parseDouble(raw.replace("k", "")) * 1000;
                } else if (raw.endsWith("m")) {
                    val = Double.parseDouble(raw.replace("m", "")) * 1000000;
                } else if (raw.endsWith("l") || raw.endsWith("lac") || raw.endsWith("lakh")) {
                    val = Double.parseDouble(raw.replaceAll("[^0-9.]", "")) * 100000;
                } else {
                    val = Double.parseDouble(raw);
                }
                if (val >= 5000) {
                    BigDecimal bdVal = BigDecimal.valueOf(val);
                    if (lead.getEstimatedBudget() == null || bdVal.compareTo(lead.getEstimatedBudget()) > 0) {
                        lead.setEstimatedBudget(bdVal);
                    }
                }
            } catch (Exception ignored) {}
        }
    }

    private String buildSystemPrompt(String companyName, String businessContext, String leadInfo, String tone) {
        return String.format("""
            You are an autonomous AI Sales Employee for %s.
            
            APPROVED BUSINESS CONTEXT (STRICT SOURCE OF TRUTH):
            %s
            
            LEAD INFORMATION:
            %s
            
            OPERATIONAL RULES & GROUNDING:
            1. Respond in a %s tone.
            2. Be concise (2-4 sentences for initial outreach).
            3. Warmly acknowledge their inquiry and ask ONE relevant qualifying question about their requirement, timeline, or scope.
            4. STRICT KNOWLEDGE GROUNDING: Only provide facts, pricing, or scope details from the APPROVED BUSINESS CONTEXT. If asked about something not in the context, state: 'I don't have that specific information in my approved records, but our team can clarify that for you.'
            5. Sign off as 'AI Sales Assistant at %s'.
            """, companyName, businessContext, leadInfo, tone, companyName);
    }

    private String buildSystemPromptWithHistory(String companyName, String businessContext, String leadInfo, String tone, String history, int score) {
        return String.format("""
            You are an autonomous AI Sales Employee for %s.
            
            APPROVED BUSINESS CONTEXT (STRICT SOURCE OF TRUTH):
            %s
            
            CURRENT LEAD DOSSIER (Current Score: %d/100):
            %s
            
            CONVERSATION HISTORY:
            %s
            
            DECISION ENGINE & RULES:
            1. Maintain a %s tone.
            2. STRICT KNOWLEDGE GROUNDING: Never hallucinate pricing, guarantees, or capabilities. Rely solely on the approved business context.
            3. DECISION CRITERIA:
               - If the lead is qualified (budget & timeline confirmed) or has a score >= 70, proactively offer to schedule a strategy/discovery call.
               - If the lead asks about pricing, state the approved ranges or tiers from the business context.
               - If the user asks for a human, they will be handled by the handoff engine.
            4. Keep responses crisp, persuasive, and under 4 sentences.
            """, companyName, businessContext, score, leadInfo, history, tone);
    }

    private String buildLeadInfo(Lead lead) {
        StringBuilder sb = new StringBuilder();
        sb.append("Name: ").append(lead.getFirstName()).append(" ").append(Optional.ofNullable(lead.getLastName()).orElse("")).append("\n");
        Optional.ofNullable(lead.getCompany()).ifPresent(v -> sb.append("Company: ").append(v).append("\n"));
        Optional.ofNullable(lead.getEmail()).ifPresent(v -> sb.append("Email: ").append(v).append("\n"));
        Optional.ofNullable(lead.getRequirement()).ifPresent(v -> sb.append("Requirement: ").append(v).append("\n"));
        Optional.ofNullable(lead.getEstimatedBudget()).ifPresent(v -> sb.append("Budget: ₹").append(v).append("\n"));
        Optional.ofNullable(lead.getTimeline()).ifPresent(v -> sb.append("Timeline: ").append(v).append("\n"));
        Optional.ofNullable(lead.getLocation()).ifPresent(v -> sb.append("Location: ").append(v).append("\n"));
        return sb.toString();
    }

    private String buildConversationHistory(UUID conversationId) {
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
            .stream()
            .map(m -> m.getType().name() + ": " + m.getContent())
            .collect(Collectors.joining("\n"));
    }
}
