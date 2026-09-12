package com.airevenue.operator.scheduler;
import com.airevenue.operator.repository.TenantRepository;
import com.airevenue.operator.service.ai.AISummaryService;
import com.airevenue.operator.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DailySummaryScheduler {
    private final TenantRepository tenantRepo;
    private final AISummaryService summaryService;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 8 * * *")
    public void generateDailySummaries() {
        log.info("Generating daily summaries for all active tenants");
        tenantRepo.findByIsActiveTrue().forEach(tenant -> {
            try {
                String summary = summaryService.generateDailySummary(tenant.getId());
                notificationService.notifyTenantOwners(tenant.getId(), "DAILY_SUMMARY", "Daily Sales Summary", summary);
            } catch (Exception e) {
                log.error("Failed daily summary for tenant {}: {}", tenant.getId(), e.getMessage());
            }
        });
    }
}
