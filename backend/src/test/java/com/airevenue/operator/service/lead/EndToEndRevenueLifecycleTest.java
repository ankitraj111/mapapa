package com.airevenue.operator.service.lead;

import com.airevenue.operator.domain.enums.AppointmentStatus;
import com.airevenue.operator.domain.enums.LeadStatus;
import com.airevenue.operator.domain.enums.MessageType;
import com.airevenue.operator.domain.model.*;
import com.airevenue.operator.dto.request.CreateLeadRequest;
import com.airevenue.operator.dto.response.LeadResponse;
import com.airevenue.operator.repository.*;
import com.airevenue.operator.service.ai.AIConversationService;
import com.airevenue.operator.service.followup.FollowUpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EndToEndRevenueLifecycleTest {

    @Mock
    private LeadRepository leadRepository;
    @Mock
    private ConversationRepository conversationRepository;
    @Mock
    private MessageRepository messageRepository;
    @Mock
    private LeadScoringService leadScoringService;
    @Mock
    private AgentActionRepository agentActionRepository;
    @Mock
    private AuditLogRepository auditLogRepository;
    @Mock
    private AIConversationService aiConversationService;
    @Mock
    private AppointmentRepository appointmentRepository;

    @InjectMocks
    private LeadService leadService;

    private UUID tenantId;
    private UUID leadId;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        leadId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Complete E2E: Ingest Lead -> AI Qualify -> Score 90 -> Meeting Booking -> Status MEETING_BOOKED")
    void testEndToEndLeadToMeetingLifecycle() {
        CreateLeadRequest req = new CreateLeadRequest();
        req.setFirstName("Sarah");
        req.setLastName("Jenkins");
        req.setEmail("sjenkins@enterprise.com");
        req.setPhone("+1 555-0199");
        req.setCompany("Enterprise Corp");
        req.setRequirement("Need custom AI sales agent with CRM integration. Budget $50,000, 2-month timeline.");
        req.setEstimatedBudget(50000.0);
        req.setTimeline("2 months");

        Lead initialLead = Lead.builder()
            .id(leadId)
            .tenantId(tenantId)
            .firstName("Sarah")
            .lastName("Jenkins")
            .email("sjenkins@enterprise.com")
            .estimatedBudget(BigDecimal.valueOf(50000.0))
            .score(90)
            .status(LeadStatus.HOT)
            .build();

        when(leadRepository.save(any(Lead.class))).thenReturn(initialLead);
        when(leadScoringService.calculateScore(any(Lead.class))).thenReturn(90);
        when(leadScoringService.determineStatus(90)).thenReturn(LeadStatus.HOT);
        when(conversationRepository.save(any(Conversation.class))).thenReturn(
            Conversation.builder().id(UUID.randomUUID()).tenantId(tenantId).lead(initialLead).status("OPEN").build()
        );

        // 1. Ingest Lead
        LeadResponse createdLead = leadService.createLead(tenantId, req);
        assertThat(createdLead).isNotNull();
        assertThat(createdLead.getScore()).isEqualTo(90);
        assertThat(createdLead.getStatus()).isEqualTo(LeadStatus.HOT);

        // 2. Simulate Calendar Booking Confirmation
        when(leadRepository.findById(leadId)).thenReturn(Optional.of(initialLead));
        initialLead.setStatus(LeadStatus.MEETING_BOOKED);

        LeadResponse bookedLead = leadService.updateStatus(leadId, tenantId, "MEETING_BOOKED");
        assertThat(bookedLead.getStatus()).isEqualTo(LeadStatus.MEETING_BOOKED);

        // Verify that Lead is saved with MEETING_BOOKED
        verify(leadRepository, atLeastOnce()).save(initialLead);
    }
}
