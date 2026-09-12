package com.airevenue.operator.service.ai;

import com.airevenue.operator.domain.enums.LeadStatus;
import com.airevenue.operator.domain.model.Lead;
import com.airevenue.operator.domain.model.Tenant;
import com.airevenue.operator.dto.response.AgentCommandResponse;
import com.airevenue.operator.repository.LeadRepository;
import com.airevenue.operator.repository.TenantRepository;
import com.airevenue.operator.service.followup.FollowUpService;
import com.airevenue.operator.service.lead.LeadScoringService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AICommandCenterServiceTest {

    @Mock
    private LeadRepository leadRepo;
    @Mock
    private TenantRepository tenantRepo;
    @Mock
    private LeadScoringService leadScoringService;
    @Mock
    private FollowUpService followUpService;
    @Mock
    private AIProvider aiProvider;

    @InjectMocks
    private AICommandCenterService commandCenterService;

    private UUID tenantId;
    private Tenant tenant;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        tenant = Tenant.builder().id(tenantId).name("NexGen Media").build();
    }

    @Test
    @DisplayName("Execute command 'recalculate scores' updates scoring across leads")
    void testExecuteCommand_RecalculateScores() {
        Lead lead = Lead.builder().id(UUID.randomUUID()).tenantId(tenantId).score(40).status(LeadStatus.QUALIFYING).build();
        when(tenantRepo.findById(tenantId)).thenReturn(Optional.of(tenant));
        when(leadRepo.findByTenantId(tenantId)).thenReturn(List.of(lead));
        when(leadScoringService.calculateScore(lead)).thenReturn(85);

        AgentCommandResponse res = commandCenterService.executeCommand(tenantId, "recalculate lead scores");

        assertThat(res).isNotNull();
        assertThat(res.getInterpretation()).contains("recalculated AI qualification scores");
        assertThat(res.getProposedActions()).isNotEmpty();
        assertThat(res.getProposedActions().get(0).getActionType()).isEqualTo("RECALCULATE_SCORES");
        assertThat(lead.getScore()).isEqualTo(85);
        verify(leadRepo).save(lead);
    }

    @Test
    @DisplayName("Execute command 'show hot leads' identifies hot leads and proposes meeting batch with approval")
    void testExecuteCommand_HotLeads() {
        Lead hotLead = Lead.builder().id(UUID.randomUUID()).tenantId(tenantId).score(92).status(LeadStatus.HOT).build();
        when(tenantRepo.findById(tenantId)).thenReturn(Optional.of(tenant));
        when(leadRepo.findByTenantId(tenantId)).thenReturn(List.of(hotLead));

        AgentCommandResponse res = commandCenterService.executeCommand(tenantId, "show hot leads from this week");

        assertThat(res).isNotNull();
        assertThat(res.isRequiresApproval()).isTrue();
        assertThat(res.getProposedActions().get(0).getActionType()).isEqualTo("PROPOSE_MEETINGS_BATCH");
        assertThat(res.getProposedActions().get(0).getEstimatedCount()).isEqualTo(1);
    }
}
