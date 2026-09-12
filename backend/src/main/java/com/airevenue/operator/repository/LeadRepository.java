package com.airevenue.operator.repository;

import com.airevenue.operator.domain.enums.LeadStatus;
import com.airevenue.operator.domain.model.Lead;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeadRepository extends JpaRepository<Lead, UUID> {
    List<Lead> findByTenantId(UUID tenantId);
    Page<Lead> findByTenantId(UUID tenantId, Pageable pageable);
    Optional<Lead> findByTenantIdAndEmail(UUID tenantId, String email);
    Optional<Lead> findByTenantIdAndPhone(UUID tenantId, String phone);
    
    List<Lead> findByTenantIdAndStatus(UUID tenantId, LeadStatus status);
    Page<Lead> findByTenantIdAndStatus(UUID tenantId, LeadStatus status, Pageable pageable);
    List<Lead> findByTenantIdAndScoreGreaterThanEqualOrderByScoreDesc(UUID tenantId, int minScore);
    
    @Query("SELECT l FROM Lead l WHERE l.tenantId = :tenantId AND (LOWER(l.firstName) LIKE %:search% OR LOWER(l.lastName) LIKE %:search% OR LOWER(l.email) LIKE %:search% OR LOWER(l.company) LIKE %:search%)")
    Page<Lead> findByTenantIdAndSearch(@Param("tenantId") UUID tenantId, @Param("search") String search, Pageable pageable);
    
    long countByTenantIdAndCreatedAtAfter(UUID tenantId, ZonedDateTime date);
    long countByTenantIdAndStatus(UUID tenantId, LeadStatus status);
    long countByTenantIdAndStatusInAndCreatedAtAfter(UUID tenantId, List<LeadStatus> statuses, ZonedDateTime date);
    
    List<Lead> findByTenantIdAndNextFollowUpAtBefore(UUID tenantId, ZonedDateTime date);
    
    @Query("SELECT l.status, COUNT(l) FROM Lead l WHERE l.tenantId = :tenantId GROUP BY l.status")
    List<Object[]> countGroupByStatus(@Param("tenantId") UUID tenantId);

    @Query("SELECT l.source, COUNT(l) FROM Lead l WHERE l.tenantId = :tenantId AND l.createdAt > :since GROUP BY l.source")
    List<Object[]> countGroupBySource(@Param("tenantId") UUID tenantId, @Param("since") ZonedDateTime since);

    long countByTenantIdAndCreatedAtBetween(UUID tenantId, ZonedDateTime start, ZonedDateTime end);
    long countByTenantIdAndStatusInAndCreatedAtBetween(UUID tenantId, List<LeadStatus> statuses, ZonedDateTime start, ZonedDateTime end);

    @Query("SELECT COALESCE(SUM(l.estimatedBudget), 0) FROM Lead l WHERE l.tenantId = :tenantId AND l.status IN ('QUALIFIED','HOT','MEETING_BOOKED')")
    Double sumPipelineValue(@Param("tenantId") UUID tenantId);
}