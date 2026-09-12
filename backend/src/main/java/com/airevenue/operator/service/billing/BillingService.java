package com.airevenue.operator.service.billing;

import com.airevenue.operator.domain.model.Tenant;
import com.airevenue.operator.repository.AgentActionRepository;
import com.airevenue.operator.repository.IntegrationRepository;
import com.airevenue.operator.repository.LeadRepository;
import com.airevenue.operator.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class BillingService {

    private final TenantRepository tenantRepo;
    private final LeadRepository leadRepo;
    private final AgentActionRepository agentActionRepo;
    private final IntegrationRepository integrationRepo;

    public static final Map<String, PlanConfig> PLANS = Map.of(
        "STARTER", new PlanConfig("Starter", 99, "₹7,999", 200, 1000, 1, List.of("200 Leads/Month", "1,000 AI Actions", "1 Integration Channel", "Standard Follow-Up Engine")),
        "GROWTH", new PlanConfig("Growth", 249, "₹19,999", 1000, 10000, 3, List.of("1,000 Leads/Month", "10,000 AI Actions", "Gmail + Google Calendar + WhatsApp", "Revenue Attribution & Next Best Action", "4-Step Follow-Up Sequence")),
        "PRO_AGENCY", new PlanConfig("Pro Agency", 599, "₹49,999", 10000, 50000, 10, List.of("10,000 Leads/Month", "50,000 AI Actions", "Unlimited Channels & Team Seats", "Dedicated Webhook Pipeline", "AI Command Center Priority API", "Custom SLA"))
    );

    public record PlanConfig(String name, int priceUsd, String priceInr, int leadLimit, int aiActionLimit, int channelLimit, List<String> features) {}

    @Transactional(readOnly = true)
    public Map<String, Object> getBillingSummary(UUID tenantId) {
        Tenant tenant = tenantRepo.findById(tenantId).orElseThrow();
        String currentPlanKey = tenant.getPlan() != null ? tenant.getPlan().toUpperCase() : "GROWTH";
        PlanConfig config = PLANS.getOrDefault(currentPlanKey, PLANS.get("GROWTH"));

        ZonedDateTime startOfCycle = tenant.getSubscriptionPeriodEnd() != null 
            ? tenant.getSubscriptionPeriodEnd().minusDays(30) 
            : ZonedDateTime.now().minusDays(30);

        long leadsUsed = leadRepo.countByTenantIdAndCreatedAtAfter(tenantId, startOfCycle);
        long aiActionsUsed = agentActionRepo.countByTenantIdAndCreatedAtAfter(tenantId, startOfCycle);
        long activeChannels = integrationRepo.findByTenantIdAndIsActiveTrue(tenantId).size();

        int leadLimit = tenant.getMonthlyLeadLimit() != null ? tenant.getMonthlyLeadLimit() : config.leadLimit();
        int aiLimit = tenant.getMonthlyAiActionLimit() != null ? tenant.getMonthlyAiActionLimit() : config.aiActionLimit();

        double leadUsagePercent = leadLimit > 0 ? ((double) leadsUsed / leadLimit) * 100 : 0.0;
        double aiUsagePercent = aiLimit > 0 ? ((double) aiActionsUsed / aiLimit) * 100 : 0.0;

        Map<String, Object> summary = new HashMap<>();
        summary.put("plan", currentPlanKey);
        summary.put("planName", config.name());
        summary.put("priceUsd", config.priceUsd());
        summary.put("priceInr", config.priceInr());
        summary.put("status", tenant.getSubscriptionStatus() != null ? tenant.getSubscriptionStatus() : "ACTIVE");
        summary.put("periodEnd", tenant.getSubscriptionPeriodEnd() != null ? tenant.getSubscriptionPeriodEnd().toString() : ZonedDateTime.now().plusDays(30).toString());

        summary.put("leadsUsed", leadsUsed);
        summary.put("leadLimit", leadLimit);
        summary.put("leadUsagePercent", Math.min(Math.round(leadUsagePercent * 10.0) / 10.0, 100.0));

        summary.put("aiActionsUsed", aiActionsUsed);
        summary.put("aiActionLimit", aiLimit);
        summary.put("aiUsagePercent", Math.min(Math.round(aiUsagePercent * 10.0) / 10.0, 100.0));

        summary.put("activeChannels", activeChannels);
        summary.put("channelLimit", config.channelLimit());
        summary.put("features", config.features());

        return summary;
    }

    public Map<String, Object> changePlan(UUID tenantId, String targetPlan) {
        String planKey = targetPlan.toUpperCase().trim();
        if (!PLANS.containsKey(planKey)) {
            throw new IllegalArgumentException("Invalid plan selected: " + targetPlan);
        }

        Tenant tenant = tenantRepo.findById(tenantId).orElseThrow();
        PlanConfig config = PLANS.get(planKey);

        tenant.setPlan(planKey);
        tenant.setMonthlyLeadLimit(config.leadLimit());
        tenant.setMonthlyAiActionLimit(config.aiActionLimit());
        tenant.setSubscriptionStatus("ACTIVE");
        tenant.setSubscriptionPeriodEnd(ZonedDateTime.now().plusDays(30));
        tenantRepo.save(tenant);

        log.info("Tenant {} updated subscription plan to {}", tenantId, planKey);
        return getBillingSummary(tenantId);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAvailablePlans() {
        List<Map<String, Object>> list = new ArrayList<>();
        PLANS.forEach((key, val) -> {
            Map<String, Object> p = new HashMap<>();
            p.put("id", key);
            p.put("name", val.name());
            p.put("priceUsd", val.priceUsd());
            p.put("priceInr", val.priceInr());
            p.put("leadLimit", val.leadLimit());
            p.put("aiActionLimit", val.aiActionLimit());
            p.put("channelLimit", val.channelLimit());
            p.put("features", val.features());
            list.add(p);
        });
        return list;
    }
}
