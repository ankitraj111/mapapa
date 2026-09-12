package com.airevenue.operator.service.followup;

import com.airevenue.operator.domain.enums.FollowUpStatus;
import com.airevenue.operator.domain.enums.LeadStatus;
import com.airevenue.operator.domain.model.*;
import com.airevenue.operator.dto.request.CreateFollowUpSequenceRequest;
import com.airevenue.operator.dto.response.FollowUpSequenceResponse;
import com.airevenue.operator.repository.*;
import com.airevenue.operator.service.email.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class FollowUpService {
    private final FollowUpSequenceRepository sequenceRepo;
    private final FollowUpStepRepository stepRepo;
    private final ScheduledFollowUpRepository scheduledRepo;
    private final LeadRepository leadRepo;
    private final EmailService emailService;

    public static final int MAX_FOLLOW_UP_STEPS = 4;
    public static final int[] DEFAULT_DELAYS_HOURS = {24, 72, 168, 336}; // Day 1 = 24h, Day 3 = 72h, Day 7 = 168h, Day 14 = 336h

    public List<FollowUpSequenceResponse> getSequences(UUID tenantId) {
        return sequenceRepo.findByTenantIdAndIsActiveTrue(tenantId).stream()
            .map(s -> FollowUpSequenceResponse.builder().id(s.getId()).name(s.getName())
                .isActive(s.getIsActive()).stopOnReply(s.getStopOnReply()).stopOnBooking(s.getStopOnBooking())
                .maxFollowUps(s.getMaxFollowUps())
                .createdAt(s.getCreatedAt() != null ? s.getCreatedAt().toLocalDateTime() : null).build()).toList();
    }

    public FollowUpSequenceResponse createSequence(UUID tenantId, CreateFollowUpSequenceRequest req) {
        FollowUpSequence seq = FollowUpSequence.builder()
            .tenantId(tenantId).name(req.getName()).isActive(true)
            .stopOnReply(req.isStopOnReply()).stopOnBooking(req.isStopOnBooking())
            .maxFollowUps(MAX_FOLLOW_UP_STEPS).build();
        seq = sequenceRepo.save(seq);

        String[] templates = {
            "Hi {{lead_first_name}}, just following up on your inquiry about {{requirement}}. Have you had a chance to review our services?",
            "Hi {{lead_first_name}}, I wanted to check in again. We've helped many businesses with {{requirement}}. Would you like to schedule a quick call?",
            "Hi {{lead_first_name}}, this is my third follow-up. I'd love to help you with {{requirement}}. What's the best time for a 15-minute call?",
            "Hi {{lead_first_name}}, I'll respect your time. If you're still looking for help with {{requirement}}, I'm here. Feel free to reach out anytime."
        };

        for (int i = 0; i < MAX_FOLLOW_UP_STEPS; i++) {
            FollowUpStep step = FollowUpStep.builder()
                .sequence(seq)
                .stepNumber(i + 1).delayHours(DEFAULT_DELAYS_HOURS[i])
                .messageTemplate(templates[i]).channel("EMAIL").build();
            stepRepo.save(step);
        }

        return FollowUpSequenceResponse.builder().id(seq.getId()).name(seq.getName())
            .isActive(seq.getIsActive()).stopOnReply(seq.getStopOnReply()).stopOnBooking(seq.getStopOnBooking())
            .maxFollowUps(seq.getMaxFollowUps())
            .createdAt(seq.getCreatedAt() != null ? seq.getCreatedAt().toLocalDateTime() : null).build();
    }

    public void enrollLeadInSequence(UUID leadId, UUID sequenceId, UUID tenantId) {
        Lead lead = leadRepo.findById(leadId).orElseThrow();

        // Safety Guard 1: Do not enroll leads that have reached terminal or review states
        LeadStatus status = lead.getStatus();
        if (status == LeadStatus.WON || status == LeadStatus.LOST ||
            status == LeadStatus.MEETING_BOOKED || status == LeadStatus.HUMAN_REVIEW ||
            status == LeadStatus.NURTURE) {
            log.warn("Lead {} is in status {} - skipping follow-up sequence enrollment", leadId, status);
            return;
        }
        
        // Safety Guard 2: Cancel existing pending followups to prevent duplicate sequence touches
        cancelFollowUpsForLead(leadId, "Re-enrolling in new sequence");

        List<FollowUpStep> steps = stepRepo.findBySequenceIdOrderByStepNumberAsc(sequenceId);
        if (steps.isEmpty()) {
            log.warn("No steps found for sequence {} - cannot enroll lead {}", sequenceId, leadId);
            return;
        }

        ZonedDateTime base = ZonedDateTime.now();
        int scheduledCount = 0;
        for (FollowUpStep step : steps) {
            // Hard safety guard: Never schedule beyond MAX_FOLLOW_UP_STEPS (4 steps)
            if (step.getStepNumber() > MAX_FOLLOW_UP_STEPS) {
                log.warn("Skipping step {} because it exceeds max step limit of {}", step.getStepNumber(), MAX_FOLLOW_UP_STEPS);
                continue;
            }
            ScheduledFollowUp scheduled = ScheduledFollowUp.builder()
                .tenantId(tenantId).lead(lead).sequenceId(sequenceId).step(step)
                .scheduledAt(base.plusHours(step.getDelayHours()))
                .status(FollowUpStatus.PENDING).build();
            scheduledRepo.save(scheduled);
            scheduledCount++;
        }

        if (scheduledCount > 0) {
            lead.setNextFollowUpAt(base.plusHours(steps.get(0).getDelayHours()));
            leadRepo.save(lead);
            log.info("Lead {} safely enrolled in sequence {} with {} steps (Max: {})", leadId, sequenceId, scheduledCount, MAX_FOLLOW_UP_STEPS);
        }
    }

    public void cancelFollowUpsForLead(UUID leadId, String reason) {
        List<ScheduledFollowUp> pending = scheduledRepo.findByLeadIdOrderByScheduledAtAsc(leadId);
        int count = 0;
        for (ScheduledFollowUp s : pending) {
            if (s.getStatus() == FollowUpStatus.PENDING) {
                s.setStatus(FollowUpStatus.CANCELLED);
                s.setErrorMessage("Auto-cancelled: " + reason);
                scheduledRepo.save(s);
                count++;
            }
        }
        leadRepo.findById(leadId).ifPresent(l -> {
            l.setNextFollowUpAt(null);
            leadRepo.save(l);
        });
        log.info("Cancelled {} pending follow-ups for lead {} - Reason: {}", count, leadId, reason);
    }

    public List<ScheduledFollowUp> getLeadFollowUps(UUID leadId, UUID tenantId) {
        return scheduledRepo.findByLeadIdOrderByScheduledAtAsc(leadId);
    }

    public void processScheduledFollowUp(ScheduledFollowUp followUp) {
        Lead lead = leadRepo.findById(followUp.getLeadId()).orElse(null);
        if (lead == null) {
            followUp.setStatus(FollowUpStatus.SKIPPED);
            followUp.setErrorMessage("Lead not found: " + followUp.getLeadId());
            scheduledRepo.save(followUp);
            return;
        }

        LeadStatus status = lead.getStatus();
        // Safety rules: Do not send follow-ups to converted, lost, meeting booked, human review, or nurtured leads
        if (status == LeadStatus.WON || status == LeadStatus.LOST ||
            status == LeadStatus.MEETING_BOOKED || status == LeadStatus.HUMAN_REVIEW ||
            status == LeadStatus.NURTURE) {
            followUp.setStatus(FollowUpStatus.SKIPPED);
            followUp.setErrorMessage("Skipped because lead reached terminal/inactive stage: " + status);
            scheduledRepo.save(followUp);
            return;
        }

        String template = followUp.getStep() != null
            ? followUp.getStep().getMessageTemplate()
            : "Hi {{lead_first_name}}, just following up on your inquiry about {{requirement}}.";

        int currentStepNumber = followUp.getStep() != null ? followUp.getStep().getStepNumber() : 1;

        try {
            emailService.sendFollowUp(lead, template);
            followUp.setStatus(FollowUpStatus.SENT);
            followUp.setSentAt(ZonedDateTime.now());
            lead.setLastContactedAt(ZonedDateTime.now());

            // Query remaining pending follow-up steps for this lead in the repository
            List<ScheduledFollowUp> allForLead = scheduledRepo.findByLeadIdOrderByScheduledAtAsc(lead.getId());
            List<ScheduledFollowUp> remainingPending = allForLead.stream()
                .filter(s -> s.getStatus() == FollowUpStatus.PENDING && (followUp.getId() == null || !Objects.equals(s.getId(), followUp.getId())))
                .toList();

            // Terminal condition check:
            // If this was Step 4 (or max steps) OR no more pending steps remain in this sequence without reply:
            if (currentStepNumber >= MAX_FOLLOW_UP_STEPS || remainingPending.isEmpty()) {
                lead.setStatus(LeadStatus.NURTURE);
                lead.setNextFollowUpAt(null);
                lead.setAiSummary("Follow-up sequence completed (all " + currentStepNumber + " steps exhausted with no reply). Lead transitioned to canonical NURTURE status.");
                log.info("Lead {} exhausted all follow-up steps (completed step {}). Transitioned status to canonical NURTURE.", lead.getId(), currentStepNumber);
            } else {
                lead.setNextFollowUpAt(remainingPending.get(0).getScheduledAt());
            }

            leadRepo.save(lead);
            log.info("Follow-up step {} successfully sent to lead {}", currentStepNumber, lead.getId());
        } catch (Exception e) {
            followUp.setStatus(FollowUpStatus.FAILED);
            followUp.setErrorMessage(e.getMessage());
            log.error("Failed to send follow-up to lead {}: {}", lead.getId(), e.getMessage());
        }
        scheduledRepo.save(followUp);
    }
}