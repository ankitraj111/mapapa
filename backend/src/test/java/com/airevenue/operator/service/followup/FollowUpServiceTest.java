package com.airevenue.operator.service.followup;

import com.airevenue.operator.domain.enums.FollowUpStatus;
import com.airevenue.operator.domain.enums.LeadStatus;
import com.airevenue.operator.domain.model.*;
import com.airevenue.operator.dto.request.CreateFollowUpSequenceRequest;
import com.airevenue.operator.dto.response.FollowUpSequenceResponse;
import com.airevenue.operator.repository.*;
import com.airevenue.operator.service.email.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.ZonedDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FollowUpServiceTest {

    @Mock
    private FollowUpSequenceRepository sequenceRepo;

    @Mock
    private FollowUpStepRepository stepRepo;

    @Mock
    private ScheduledFollowUpRepository scheduledRepo;

    @Mock
    private LeadRepository leadRepo;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private FollowUpService followUpService;

    private UUID tenantId;
    private UUID leadId;
    private UUID sequenceId;
    private Lead testLead;
    private FollowUpSequence testSequence;
    private List<FollowUpStep> testSteps;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        leadId = UUID.randomUUID();
        sequenceId = UUID.randomUUID();

        testLead = Lead.builder()
            .id(leadId)
            .tenantId(tenantId)
            .firstName("Alex")
            .lastName("Johnson")
            .email("alex@example.com")
            .requirement("Web Development")
            .status(LeadStatus.CONTACTED)
            .score(50)
            .build();

        testSequence = FollowUpSequence.builder()
            .id(sequenceId)
            .tenantId(tenantId)
            .name("Default 4-Step Sequence")
            .isActive(true)
            .maxFollowUps(4)
            .build();

        int[] delays = {24, 72, 168, 336};
        testSteps = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            testSteps.add(FollowUpStep.builder()
                .id(UUID.randomUUID())
                .sequence(testSequence)
                .stepNumber(i + 1)
                .delayHours(delays[i])
                .messageTemplate("Follow up template #" + (i + 1))
                .channel("EMAIL")
                .build());
        }
    }

    @Test
    @DisplayName("Create sequence creates exactly 4 steps with canonical delays: 24h, 72h, 168h, 336h")
    void testCreateSequence_CreatesExactly4Steps() {
        when(sequenceRepo.save(any(FollowUpSequence.class))).thenReturn(testSequence);

        CreateFollowUpSequenceRequest req = new CreateFollowUpSequenceRequest();
        req.setName("Standard Inbound Sequence");
        req.setStopOnReply(true);
        req.setStopOnBooking(true);
        req.setMaxFollowUps(10); // Requesting 10 should be capped to 4

        FollowUpSequenceResponse res = followUpService.createSequence(tenantId, req);

        assertThat(res).isNotNull();
        assertThat(res.getMaxFollowUps()).isEqualTo(4);

        ArgumentCaptor<FollowUpStep> stepCaptor = ArgumentCaptor.forClass(FollowUpStep.class);
        verify(stepRepo, times(4)).save(stepCaptor.capture());

        List<FollowUpStep> capturedSteps = stepCaptor.getAllValues();
        assertThat(capturedSteps).hasSize(4);
        assertThat(capturedSteps.get(0).getDelayHours()).isEqualTo(24);
        assertThat(capturedSteps.get(1).getDelayHours()).isEqualTo(72);
        assertThat(capturedSteps.get(2).getDelayHours()).isEqualTo(168);
        assertThat(capturedSteps.get(3).getDelayHours()).isEqualTo(336);
    }

    @Test
    @DisplayName("Lead -> Step 1 -> Step 2 -> Step 3 -> Step 4 -> no reply -> canonical NURTURE status -> no Step 5")
    void testFollowUpExhaustion_LeadMovesToCanonicalNurture() {
        when(leadRepo.findById(leadId)).thenReturn(Optional.of(testLead));
        when(stepRepo.findBySequenceIdOrderByStepNumberAsc(sequenceId)).thenReturn(testSteps);

        // Step 1: Enroll lead into sequence
        followUpService.enrollLeadInSequence(leadId, sequenceId, tenantId);

        ArgumentCaptor<ScheduledFollowUp> scheduledCaptor = ArgumentCaptor.forClass(ScheduledFollowUp.class);
        verify(scheduledRepo, times(4)).save(scheduledCaptor.capture());
        List<ScheduledFollowUp> scheduledSteps = scheduledCaptor.getAllValues();
        assertThat(scheduledSteps).hasSize(4); // Exactly 4 scheduled steps, no Step 5!
        scheduledSteps.forEach(s -> s.setId(UUID.randomUUID()));

        // Simulate step 1 execution
        ScheduledFollowUp step1 = scheduledSteps.get(0);
        when(scheduledRepo.findByLeadIdOrderByScheduledAtAsc(leadId)).thenReturn(scheduledSteps);
        followUpService.processScheduledFollowUp(step1);
        assertThat(step1.getStatus()).isEqualTo(FollowUpStatus.SENT);
        assertThat(testLead.getStatus()).isEqualTo(LeadStatus.CONTACTED);

        // Simulate step 2 execution
        ScheduledFollowUp step2 = scheduledSteps.get(1);
        followUpService.processScheduledFollowUp(step2);
        assertThat(step2.getStatus()).isEqualTo(FollowUpStatus.SENT);
        assertThat(testLead.getStatus()).isEqualTo(LeadStatus.CONTACTED);

        // Simulate step 3 execution
        ScheduledFollowUp step3 = scheduledSteps.get(2);
        followUpService.processScheduledFollowUp(step3);
        assertThat(step3.getStatus()).isEqualTo(FollowUpStatus.SENT);
        assertThat(testLead.getStatus()).isEqualTo(LeadStatus.CONTACTED);

        // Simulate step 4 execution (Final step - Exhaustion)
        ScheduledFollowUp step4 = scheduledSteps.get(3);
        followUpService.processScheduledFollowUp(step4);

        // VERIFY:
        // 1. Step 4 status is SENT
        assertThat(step4.getStatus()).isEqualTo(FollowUpStatus.SENT);
        // 2. Lead status is canonically transitioned to NURTURE
        assertThat(testLead.getStatus()).isEqualTo(LeadStatus.NURTURE);
        // 3. nextFollowUpAt is cleared to null (no more followups)
        assertThat(testLead.getNextFollowUpAt()).isNull();
        // 4. Exactly 4 follow up emails were sent
        verify(emailService, times(4)).sendFollowUp(eq(testLead), anyString());
        // 5. Total scheduled follow-up steps created is strictly 4 (No step 5 created)
        assertThat(scheduledSteps).hasSize(4);
    }

    @Test
    @DisplayName("Lead replies after Step 2 -> pending steps (Step 3, Step 4) CANCELLED -> nextFollowUpAt cleared")
    void testLeadReplyAfterStep2_CancelsPendingFollowUps() {
        ScheduledFollowUp s1 = ScheduledFollowUp.builder().id(UUID.randomUUID()).lead(testLead).step(testSteps.get(0)).status(FollowUpStatus.SENT).build();
        ScheduledFollowUp s2 = ScheduledFollowUp.builder().id(UUID.randomUUID()).lead(testLead).step(testSteps.get(1)).status(FollowUpStatus.SENT).build();
        ScheduledFollowUp s3 = ScheduledFollowUp.builder().id(UUID.randomUUID()).lead(testLead).step(testSteps.get(2)).status(FollowUpStatus.PENDING).build();
        ScheduledFollowUp s4 = ScheduledFollowUp.builder().id(UUID.randomUUID()).lead(testLead).step(testSteps.get(3)).status(FollowUpStatus.PENDING).build();

        List<ScheduledFollowUp> list = List.of(s1, s2, s3, s4);
        when(scheduledRepo.findByLeadIdOrderByScheduledAtAsc(leadId)).thenReturn(list);
        when(leadRepo.findById(leadId)).thenReturn(Optional.of(testLead));

        // Customer replies
        followUpService.cancelFollowUpsForLead(leadId, "Customer replied in conversation");

        assertThat(s1.getStatus()).isEqualTo(FollowUpStatus.SENT);
        assertThat(s2.getStatus()).isEqualTo(FollowUpStatus.SENT);
        assertThat(s3.getStatus()).isEqualTo(FollowUpStatus.CANCELLED);
        assertThat(s4.getStatus()).isEqualTo(FollowUpStatus.CANCELLED);
        assertThat(s3.getErrorMessage()).contains("Customer replied");
        assertThat(s4.getErrorMessage()).contains("Customer replied");
        assertThat(testLead.getNextFollowUpAt()).isNull();
    }

    @Test
    @DisplayName("Safety rule: Leads in terminal/meeting stages (MEETING_BOOKED, WON, LOST, HUMAN_REVIEW, NURTURE) are skipped")
    void testTerminalStates_SkippedInFollowUp() {
        LeadStatus[] terminalStatuses = {
            LeadStatus.MEETING_BOOKED, LeadStatus.WON, LeadStatus.LOST,
            LeadStatus.HUMAN_REVIEW, LeadStatus.NURTURE
        };

        for (LeadStatus status : terminalStatuses) {
            testLead.setStatus(status);
            when(leadRepo.findById(leadId)).thenReturn(Optional.of(testLead));

            ScheduledFollowUp followUp = ScheduledFollowUp.builder()
                .id(UUID.randomUUID())
                .lead(testLead)
                .step(testSteps.get(0))
                .status(FollowUpStatus.PENDING)
                .build();

            followUpService.processScheduledFollowUp(followUp);

            assertThat(followUp.getStatus()).isEqualTo(FollowUpStatus.SKIPPED);
            assertThat(followUp.getErrorMessage()).contains("Skipped because lead reached terminal/inactive stage");
        }

        // Verify no email was sent for terminal/skipped leads
        verify(emailService, never()).sendFollowUp(any(), any());
    }

    @Test
    @DisplayName("Safety rule: Enrolling a lead in terminal/nurture state is rejected without creating steps")
    void testEnrollmentInTerminalState_Rejected() {
        testLead.setStatus(LeadStatus.NURTURE);
        when(leadRepo.findById(leadId)).thenReturn(Optional.of(testLead));

        followUpService.enrollLeadInSequence(leadId, sequenceId, tenantId);

        verify(scheduledRepo, never()).save(any(ScheduledFollowUp.class));
    }
}
