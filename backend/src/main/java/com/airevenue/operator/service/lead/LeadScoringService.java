package com.airevenue.operator.service.lead;

import com.airevenue.operator.domain.enums.LeadStatus;
import com.airevenue.operator.domain.model.Lead;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class LeadScoringService {

    public int calculateScore(Lead lead) {
        int score = 0;

        if (lead.getEstimatedBudget() != null) {
            if (lead.getEstimatedBudget().doubleValue() >= 500000) score += 25;
            else if (lead.getEstimatedBudget().doubleValue() >= 200000) score += 20;
            else if (lead.getEstimatedBudget().doubleValue() >= 100000) score += 15;
            else if (lead.getEstimatedBudget().doubleValue() >= 50000) score += 10;
            else score += 5;
        }

        if (lead.getRequirement() != null && lead.getRequirement().length() > 20) score += 20;
        else if (lead.getRequirement() != null && !lead.getRequirement().isBlank()) score += 10;

        if (lead.getTimeline() != null) {
            String t = lead.getTimeline().toLowerCase();
            if (t.contains("asap") || t.contains("immediately") || t.contains("urgent")) score += 20;
            else if (t.contains("week") || t.contains("soon") || t.contains("month")) score += 15;
            else if (t.contains("quarter") || t.contains("3 month")) score += 10;
            else score += 5;
        }

        if (lead.getCompany() != null && !lead.getCompany().isBlank()) score += 15;

        if ("HIGH".equalsIgnoreCase(lead.getIntent())) score += 10;
        else if ("MEDIUM".equalsIgnoreCase(lead.getIntent())) score += 5;

        if (lead.getPhone() != null && !lead.getPhone().isBlank()) score += 10;

        return Math.min(score, 100);
    }

    public LeadStatus determineStatus(int score) {
        if (score >= 80) return LeadStatus.HOT;
        if (score >= 60) return LeadStatus.WARM;
        return LeadStatus.COLD;
    }

    public void updateStatusFromScore(Lead lead) {
        LeadStatus current = lead.getStatus();
        if (current == LeadStatus.NEW || current == LeadStatus.COLD || 
            current == LeadStatus.WARM || current == LeadStatus.HOT) {
            lead.setStatus(determineStatus(lead.getScore()));
        }
    }
}
