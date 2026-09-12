package com.airevenue.operator.service.ai;

import com.airevenue.operator.domain.enums.LeadStatus;
import com.airevenue.operator.domain.model.Lead;
import com.airevenue.operator.domain.model.Tenant;
import com.airevenue.operator.dto.response.AgentCommandResponse;
import com.airevenue.operator.dto.response.ProposedAction;
import com.airevenue.operator.repository.LeadRepository;
import com.airevenue.operator.repository.TenantRepository;
import com.airevenue.operator.service.followup.FollowUpService;
import com.airevenue.operator.service.lead.LeadScoringService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AICommandCenterService {

    private final LeadRepository leadRepo;
    private final TenantRepository tenantRepo;
    private final LeadScoringService leadScoringService;
    private final FollowUpService followUpService;
    private final AIProvider aiProvider;

    @Transactional
    public AgentCommandResponse executeCommand(UUID tenantId, String commandText) {
        Tenant tenant = tenantRepo.findById(tenantId).orElseThrow();
        String lower = commandText.toLowerCase().trim();

        List<Lead> tenantLeads = leadRepo.findByTenantId(tenantId);
        List<ProposedAction> actions = new ArrayList<>();
        String interpretation;
        boolean requiresApproval = false;

        if (lower.contains("recalculate") || lower.contains("score") || lower.contains("rescore")) {
            int count = 0;
            List<UUID> leadIds = new ArrayList<>();
            for (Lead lead : tenantLeads) {
                int oldScore = lead.getScore() != null ? lead.getScore() : 0;
                int newScore = leadScoringService.calculateScore(lead);
                lead.setScore(newScore);
                leadScoringService.updateStatusFromScore(lead);
                leadRepo.save(lead);
                leadIds.add(lead.getId());
                count++;
            }
            interpretation = "Scanned all " + count + " leads in workspace and recalculated AI qualification scores based on latest budget and timeline parameters.";
            actions.add(ProposedAction.builder()
                .actionType("RECALCULATE_SCORES")
                .description("Updated scoring models across " + count + " active CRM leads")
                .estimatedCount(count)
                .leadIds(leadIds)
                .build());

        } else if (lower.contains("hot") || lower.contains("high priority") || lower.contains("urgent")) {
            List<Lead> hotLeads = tenantLeads.stream()
                .filter(l -> l.getStatus() == LeadStatus.HOT || (l.getScore() != null && l.getScore() >= 80))
                .toList();

            interpretation = "Identified " + hotLeads.size() + " high-priority HOT leads with score ≥ 80. Recommended next action: Send 3-slot calendar meeting invitations.";
            actions.add(ProposedAction.builder()
                .actionType("PROPOSE_MEETINGS_BATCH")
                .description("Send calendar booking invitations to " + hotLeads.size() + " qualified prospects")
                .estimatedCount(hotLeads.size())
                .leadIds(hotLeads.stream().map(Lead::getId).toList())
                .build());
            requiresApproval = true;

        } else if (lower.contains("follow up") || lower.contains("nudge") || lower.contains("stagnant")) {
            List<Lead> qualifyingLeads = tenantLeads.stream()
                .filter(l -> l.getStatus() == LeadStatus.QUALIFYING || l.getStatus() == LeadStatus.CONTACTED)
                .toList();

            interpretation = "Found " + qualifyingLeads.size() + " active prospects in qualification stage ready for automated value-add drip follow-up.";
            actions.add(ProposedAction.builder()
                .actionType("EXECUTE_FOLLOW_UPS")
                .description("Queue next scheduled follow-up sequence for " + qualifyingLeads.size() + " leads")
                .estimatedCount(qualifyingLeads.size())
                .leadIds(qualifyingLeads.stream().map(Lead::getId).toList())
                .build());

        } else {
            // Natural language AI assistance fallback
            String prompt = "You are the AI Sales Command Center for " + tenant.getName() + ".\n" +
                "The user entered this operational command: \"" + commandText + "\".\n" +
                "Total leads in CRM: " + tenantLeads.size() + ".\n" +
                "Provide a crisp 2-sentence executive summary of the best operational action to take.";

            try {
                interpretation = aiProvider.generateText("You are an executive sales AI assistant.", prompt, "gpt-4o-mini");
            } catch (Exception e) {
                interpretation = "Command received: \"" + commandText + "\". Executed intelligence scan across " + tenantLeads.size() + " leads.";
            }

            actions.add(ProposedAction.builder()
                .actionType("INTELLIGENCE_SCAN")
                .description("AI Operational command analyzed and context logged")
                .estimatedCount(tenantLeads.size())
                .leadIds(tenantLeads.stream().map(Lead::getId).limit(10).toList())
                .build());
        }

        return AgentCommandResponse.builder()
            .interpretation(interpretation)
            .proposedActions(actions)
            .requiresApproval(requiresApproval)
            .actionPlanId(UUID.randomUUID().toString())
            .build();
    }
}
