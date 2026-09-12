package com.airevenue.operator.repository;

import com.airevenue.operator.domain.model.AgentAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AgentActionRepository extends JpaRepository<AgentAction, UUID> {
    List<AgentAction> findByLeadIdOrderByCreatedAtDesc(UUID leadId);

    @Query("SELECT COUNT(a) FROM AgentAction a WHERE a.tenantId = :tenantId AND a.createdAt > :since")
    long countByTenantIdAndCreatedAtAfter(@Param("tenantId") UUID tenantId, @Param("since") ZonedDateTime since);

    List<AgentAction> findByTenantIdOrderByCreatedAtDesc(UUID tenantId, org.springframework.data.domain.Pageable pageable);
}
