package com.airevenue.operator.service.ai;

import com.airevenue.operator.domain.enums.ActionStatus;
import com.airevenue.operator.domain.enums.LeadStatus;
import com.airevenue.operator.domain.model.*;
import com.airevenue.operator.repository.*;
import com.airevenue.operator.service.followup.FollowUpService;
import com.airevenue.operator.service.knowledge.KnowledgeService;
import com.airevenue.operator.service.lead.LeadScoringService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AIConversationServiceTest {

    @Mock
    private AIProvider aiProvider;
    @Mock
    private LeadRepository leadRepository;
    @Mock
    private ConversationRepository conversationRepository;
    @Mock
    private MessageRepository messageRepository;
    @Mock
    private TenantRepository tenantRepository;
    @Mock
    private AgentActionRepository agentActionRepository;
    @Mock
    private KnowledgeService knowledgeService;
    @Mock
    private LeadScoringService leadScoringService;
    @Mock
    private FollowUpService followUpService;
    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private AIConversationService aiConversationService;

    private UUID tenantId;
    private UUID leadId;
    private Lead nurtureLead;
    private Conversation conversation;
    private Tenant tenant;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        leadId = UUID.randomUUID();

        tenant = Tenant.builder().id(tenantId).name("Agency Acme").aiTone("professional").build();

        nurtureLead = Lead.builder()
            .id(leadId)
            .tenantId(tenantId)
            .firstName("Sarah")
            .lastName("Connor")
            .email("sarah@example.com")
            .status(LeadStatus.NURTURE)
            .score(40)
            .build();

        conversation = Conversation.builder()
            .id(UUID.randomUUID())
            .tenantId(tenantId)
            .lead(nurtureLead)
            .channel("EMAIL")
            .status("OPEN")
            .build();
    }

    @Test
    @DisplayName("Lead in NURTURE replies -> cancels followups, transitions to QUALIFYING and continues AI conversation")
    void testNurtureLeadReply_ReEngagesSuccessfully() {
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
        when(knowledgeService.buildBusinessContext(tenantId)).thenReturn("Context");
        when(leadScoringService.calculateScore(nurtureLead)).thenReturn(65);
        when(aiProvider.generateText(anyString(), anyString(), eq("gpt-4o-mini")))
            .thenReturn("Hello Sarah! Great to hear back from you. We'd love to help with your project.");

        String reply = aiConversationService.processLeadMessage(
            nurtureLead, conversation, "Hi, I am ready to discuss my ₹100,000 project."
        );

        // Verify:
        // 1. Pending follow-ups are cancelled
        verify(followUpService).cancelFollowUpsForLead(eq(leadId), contains("actively replied"));
        // 2. Lead status moved from NURTURE to QUALIFYING
        assertThat(nurtureLead.getStatus()).isEqualTo(LeadStatus.QUALIFYING);
        // 3. AI message saved
        verify(messageRepository).save(any(Message.class));
        // 4. AI response generated and returned
        assertThat(reply).contains("Hello Sarah");
        // 5. Lead updated in repo
        verify(leadRepository).save(nurtureLead);
    }
}
