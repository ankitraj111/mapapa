package com.airevenue.operator.repository;
import com.airevenue.operator.domain.model.FollowUpStep;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface FollowUpStepRepository extends JpaRepository<FollowUpStep, UUID> {
    List<FollowUpStep> findBySequenceIdOrderByStepNumberAsc(UUID sequenceId);
}
