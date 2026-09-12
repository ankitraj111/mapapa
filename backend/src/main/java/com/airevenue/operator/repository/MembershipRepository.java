package com.airevenue.operator.repository;

import com.airevenue.operator.domain.model.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, UUID> {
    @Query("SELECT m FROM Membership m WHERE m.user.id = :userId AND m.isActive = true")
    List<Membership> findByUserIdAndIsActiveTrue(@Param("userId") UUID userId);

    @Query("SELECT m FROM Membership m WHERE m.tenant.id = :tenantId AND m.isActive = true")
    List<Membership> findByTenantIdAndIsActiveTrue(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(m) > 0 FROM Membership m WHERE m.tenant.id = :tenantId AND m.user.id = :userId")
    boolean existsByTenantIdAndUserId(@Param("tenantId") UUID tenantId, @Param("userId") UUID userId);
}
