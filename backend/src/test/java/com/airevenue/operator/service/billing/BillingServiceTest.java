package com.airevenue.operator.service.billing;

import com.airevenue.operator.domain.model.Tenant;
import com.airevenue.operator.repository.AgentActionRepository;
import com.airevenue.operator.repository.IntegrationRepository;
import com.airevenue.operator.repository.LeadRepository;
import com.airevenue.operator.repository.TenantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BillingServiceTest {

    @Mock
    private TenantRepository tenantRepo;

    @Mock
    private LeadRepository leadRepo;

    @Mock
    private AgentActionRepository agentActionRepo;

    @Mock
    private IntegrationRepository integrationRepo;

    @InjectMocks
    private BillingService billingService;

    private UUID tenantId;
    private Tenant tenant;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        tenant = new Tenant();
        tenant.setId(tenantId);
        tenant.setName("Acme Agency");
        tenant.setPlan("GROWTH");
        tenant.setMonthlyLeadLimit(1000);
        tenant.setMonthlyAiActionLimit(10000);
        tenant.setSubscriptionStatus("ACTIVE");
        tenant.setSubscriptionPeriodEnd(ZonedDateTime.now().plusDays(15));
    }

    @Test
    void testGetBillingSummary() {
        when(tenantRepo.findById(tenantId)).thenReturn(Optional.of(tenant));
        when(leadRepo.countByTenantIdAndCreatedAtAfter(eq(tenantId), any())).thenReturn(250L);
        when(agentActionRepo.countByTenantIdAndCreatedAtAfter(eq(tenantId), any())).thenReturn(1500L);
        when(integrationRepo.findByTenantIdAndIsActiveTrue(tenantId)).thenReturn(Collections.emptyList());

        Map<String, Object> summary = billingService.getBillingSummary(tenantId);

        assertNotNull(summary);
        assertEquals("GROWTH", summary.get("plan"));
        assertEquals(250L, summary.get("leadsUsed"));
        assertEquals(1000, summary.get("leadLimit"));
        assertEquals(25.0, summary.get("leadUsagePercent"));
        assertEquals(1500L, summary.get("aiActionsUsed"));
        assertEquals(10000, summary.get("aiActionLimit"));
        assertEquals(15.0, summary.get("aiUsagePercent"));
    }

    @Test
    void testChangePlanToProAgency() {
        when(tenantRepo.findById(tenantId)).thenReturn(Optional.of(tenant));
        when(leadRepo.countByTenantIdAndCreatedAtAfter(eq(tenantId), any())).thenReturn(50L);
        when(agentActionRepo.countByTenantIdAndCreatedAtAfter(eq(tenantId), any())).thenReturn(300L);
        when(integrationRepo.findByTenantIdAndIsActiveTrue(tenantId)).thenReturn(Collections.emptyList());

        Map<String, Object> updated = billingService.changePlan(tenantId, "PRO_AGENCY");

        assertEquals("PRO_AGENCY", updated.get("plan"));
        assertEquals(10000, updated.get("leadLimit"));
        assertEquals(50000, updated.get("aiActionLimit"));
        verify(tenantRepo, times(1)).save(tenant);
        assertEquals("PRO_AGENCY", tenant.getPlan());
    }

    @Test
    void testChangePlanInvalidThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> billingService.changePlan(tenantId, "NON_EXISTENT_PLAN"));
    }

    @Test
    void testGetAvailablePlans() {
        List<Map<String, Object>> plans = billingService.getAvailablePlans();
        assertNotNull(plans);
        assertEquals(3, plans.size());
    }
}
