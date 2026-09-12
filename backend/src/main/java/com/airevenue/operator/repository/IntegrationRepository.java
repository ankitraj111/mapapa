package com.airevenue.operator.repository;
import com.airevenue.operator.domain.enums.IntegrationType;
import com.airevenue.operator.domain.model.Integration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface IntegrationRepository extends JpaRepository<Integration, UUID> {
    List<Integration> findByTenantId(UUID tenantId);
    List<Integration> findByTenantIdAndIsActiveTrue(UUID tenantId);
    Optional<Integration> findByTenantIdAndType(UUID tenantId, IntegrationType type);
}
