package com.airevenue.operator.repository;

import com.airevenue.operator.domain.enums.AppointmentStatus;
import com.airevenue.operator.domain.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    List<Appointment> findByTenantId(UUID tenantId);
    List<Appointment> findByTenantIdOrderByStartTimeDesc(UUID tenantId);
    @org.springframework.data.jpa.repository.Query("SELECT a FROM Appointment a WHERE a.lead.id = :leadId ORDER BY a.createdAt DESC")
    List<Appointment> findByLeadIdOrderByCreatedAtDesc(UUID leadId);
    long countByTenantIdAndStatus(UUID tenantId, AppointmentStatus status);
}
