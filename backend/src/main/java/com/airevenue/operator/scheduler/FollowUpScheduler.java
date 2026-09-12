package com.airevenue.operator.scheduler;

import com.airevenue.operator.domain.enums.FollowUpStatus;
import com.airevenue.operator.domain.model.ScheduledFollowUp;
import com.airevenue.operator.repository.ScheduledFollowUpRepository;
import com.airevenue.operator.service.followup.FollowUpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.ZonedDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class FollowUpScheduler {
    private final ScheduledFollowUpRepository scheduledFollowUpRepo;
    private final FollowUpService followUpService;

    @Scheduled(fixedDelay = 300000)
    public void processScheduledFollowUps() {
        List<ScheduledFollowUp> due = scheduledFollowUpRepo
            .findByStatusAndScheduledAtBefore(FollowUpStatus.PENDING, ZonedDateTime.now());
        if (!due.isEmpty()) log.info("Processing {} due follow-ups", due.size());
        for (ScheduledFollowUp followUp : due) {
            try {
                followUpService.processScheduledFollowUp(followUp);
            } catch (Exception e) {
                log.error("Error processing follow-up {}: {}", followUp.getId(), e.getMessage());
            }
        }
    }
}