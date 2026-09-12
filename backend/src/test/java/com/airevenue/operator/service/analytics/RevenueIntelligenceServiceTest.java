package com.airevenue.operator.service.analytics;

import com.airevenue.operator.domain.enums.AppointmentStatus;
import com.airevenue.operator.domain.enums.LeadStatus;
import com.airevenue.operator.domain.model.Appointment;
import com.airevenue.operator.domain.model.Lead;
import com.airevenue.operator.repository.AgentActionRepository;
import com.airevenue.operator.repository.AppointmentRepository;
import com.airevenue.operator.repository.LeadRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RevenueIntelligenceServiceTest {

    @Mock
    private LeadRepository leadRepo;
    @Mock
    private AppointmentRepository appointmentRepo;
    @Mock
    private AgentActionRepository agentActionRepo;

    @InjectMocks
    private RevenueIntelligenceService intelligenceService;

    private UUID tenantId;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Next Best Action assigns PROPOSE_MEETING_SLOTS for HOT leads and ESCALATE for HUMAN_REVIEW")
    void testGetNextBestActions_CalculatesCorrectActions() {
        Lead hotLead = Lead.builder()
            .id(UUID.randomUUID())
            .tenantId(tenantId)
            .firstName("Aman")
            .status(LeadStatus.HOT)
            .score(90)
            .build();

        Lead reviewLead = Lead.builder()
            .id(UUID.randomUUID())
            .tenantId(tenantId)
            .firstName("Kavita")
            .status(LeadStatus.HUMAN_REVIEW)
            .score(60)
            .build();

        when(leadRepo.findByTenantId(tenantId)).thenReturn(List.of(hotLead, reviewLead));

        List<Map<String, Object>> actions = intelligenceService.getNextBestActions(tenantId);

        assertThat(actions).hasSize(2);
        // Review lead should have URGENT priority, listed first
        assertThat(actions.get(0).get("recommendedAction")).isEqualTo("ESCALATE_TO_SENIOR_REP");
        assertThat(actions.get(0).get("priority")).isEqualTo("URGENT");

        // Hot lead should have HIGH priority
        assertThat(actions.get(1).get("recommendedAction")).isEqualTo("PROPOSE_MEETING_SLOTS");
        assertThat(actions.get(1).get("priority")).isEqualTo("HIGH");
    }

    @Test
    @DisplayName("Revenue Attribution accurately calculates total pipeline and won deals")
    void testGetRevenueAttribution() {
        Lead l1 = Lead.builder()
            .id(UUID.randomUUID())
            .tenantId(tenantId)
            .estimatedBudget(BigDecimal.valueOf(200000))
            .status(LeadStatus.WON)
            .source("WEBSITE_FORM")
            .build();

        Lead l2 = Lead.builder()
            .id(UUID.randomUUID())
            .tenantId(tenantId)
            .estimatedBudget(BigDecimal.valueOf(300000))
            .status(LeadStatus.QUALIFIED)
            .source("WHATSAPP")
            .build();

        Appointment apt = Appointment.builder()
            .id(UUID.randomUUID())
            .tenantId(tenantId)
            .status(AppointmentStatus.CONFIRMED)
            .build();

        when(leadRepo.findByTenantId(tenantId)).thenReturn(List.of(l1, l2));
        when(appointmentRepo.findByTenantIdOrderByStartTimeDesc(tenantId)).thenReturn(List.of(apt));
        when(agentActionRepo.countByTenantIdAndCreatedAtAfter(eq(tenantId), any())).thenReturn(45L);

        Map<String, Object> attribution = intelligenceService.getRevenueAttribution(tenantId);

        assertThat(attribution.get("totalPipelineValue")).isEqualTo(BigDecimal.valueOf(500000));
        assertThat(attribution.get("aiGeneratedRevenue")).isEqualTo(BigDecimal.valueOf(200000));
        assertThat(attribution.get("totalLeads")).isEqualTo(2L);
        assertThat(attribution.get("meetingsBooked")).isEqualTo(1L);
        assertThat(attribution.get("dealsWon")).isEqualTo(1L);
    }
}
