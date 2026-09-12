package com.airevenue.operator.service.lead;

import com.airevenue.operator.domain.enums.LeadStatus;
import com.airevenue.operator.domain.model.Lead;
import com.airevenue.operator.dto.request.UpdateLeadRequest;
import com.airevenue.operator.exception.LeadNotFoundException;
import com.airevenue.operator.repository.AgentActionRepository;
import com.airevenue.operator.repository.AuditLogRepository;
import com.airevenue.operator.repository.ConversationRepository;
import com.airevenue.operator.repository.LeadRepository;
import com.airevenue.operator.repository.MessageRepository;
import com.airevenue.operator.service.ai.AIConversationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TenantIsolationTest {

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

    @InjectMocks
    private LeadService leadService;

    private UUID tenantA;
    private UUID tenantB;
    private UUID leadId;
    private Lead leadTenantA;

    @BeforeEach
    void setUp() {
        tenantA = UUID.randomUUID();
        tenantB = UUID.randomUUID();
        leadId = UUID.randomUUID();

        leadTenantA = Lead.builder()
            .id(leadId)
            .tenantId(tenantA)
            .firstName("Alice")
            .email("alice@agency.com")
            .status(LeadStatus.NEW)
            .score(50)
            .build();
    }

    @Test
    @DisplayName("Tenant B cannot read Tenant A's lead")
    void testTenantCannotAccessOtherTenantLead() {
        when(leadRepository.findById(leadId)).thenReturn(Optional.of(leadTenantA));

        assertThatThrownBy(() -> leadService.getLead(leadId, tenantB))
            .isInstanceOf(LeadNotFoundException.class)
            .hasMessageContaining("Lead not found");
    }

    @Test
    @DisplayName("Tenant B cannot update Tenant A's lead")
    void testTenantCannotUpdateOtherTenantLead() {
        when(leadRepository.findById(leadId)).thenReturn(Optional.of(leadTenantA));

        UpdateLeadRequest updateReq = new UpdateLeadRequest();
        updateReq.setFirstName("HackedName");

        assertThatThrownBy(() -> leadService.updateLead(leadId, tenantB, updateReq))
            .isInstanceOf(LeadNotFoundException.class)
            .hasMessageContaining("Lead not found");
    }

    @Test
    @DisplayName("Tenant B cannot delete Tenant A's lead")
    void testTenantCannotDeleteOtherTenantLead() {
        when(leadRepository.findById(leadId)).thenReturn(Optional.of(leadTenantA));

        assertThatThrownBy(() -> leadService.deleteLead(leadId, tenantB))
            .isInstanceOf(LeadNotFoundException.class)
            .hasMessageContaining("Lead not found");
    }
}
