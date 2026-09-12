package com.airevenue.operator.repository;

import com.airevenue.operator.domain.enums.FollowUpStatus;
import com.airevenue.operator.domain.model.ScheduledFollowUp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ScheduledFollowUpRepository extends JpaRepository<ScheduledFollowUp, UUID> {
    List<ScheduledFollowUp> findByStatusAndScheduledAtBefore(FollowUpStatus status, ZonedDateTime before);
    
    @Query("SELECT s FROM ScheduledFollowUp s WHERE s.lead.id = :leadId ORDER BY s.scheduledAt ASC")
    List<ScheduledFollowUp> findByLeadIdOrderByScheduledAtAsc(@Param("leadId") UUID leadId);
    
    long countByTenantIdAndStatus(UUID tenantId, FollowUpStatus status);
}