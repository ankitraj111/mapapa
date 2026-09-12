package com.airevenue.operator.repository;
import com.airevenue.operator.domain.model.FollowUpSequence;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface FollowUpSequenceRepository extends JpaRepository<FollowUpSequence, UUID> {
    List<FollowUpSequence> findByTenantIdAndIsActiveTrue(UUID tenantId);
}
