package com.airevenue.operator.repository;

import com.airevenue.operator.domain.enums.TaskStatus;
import com.airevenue.operator.domain.model.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findByTenantIdAndStatus(UUID tenantId, TaskStatus status);
    Page<Task> findByTenantIdOrderByCreatedAtDesc(UUID tenantId, Pageable pageable);
    @org.springframework.data.jpa.repository.Query("SELECT t FROM Task t WHERE t.lead.id = :leadId ORDER BY t.createdAt DESC")
    List<Task> findByLeadIdOrderByCreatedAtDesc(UUID leadId);
    List<Task> findByAssignedToIdAndStatus(UUID assignedToId, TaskStatus status);
}