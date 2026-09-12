package com.airevenue.operator.service.appointment;

import com.airevenue.operator.domain.enums.AppointmentStatus;
import com.airevenue.operator.domain.enums.LeadStatus;
import com.airevenue.operator.domain.model.Appointment;
import com.airevenue.operator.domain.model.Lead;
import com.airevenue.operator.dto.request.CreateAppointmentRequest;
import com.airevenue.operator.dto.response.AppointmentResponse;
import com.airevenue.operator.exception.ResourceNotFoundException;
import com.airevenue.operator.repository.AppointmentRepository;
import com.airevenue.operator.repository.LeadRepository;
import com.airevenue.operator.service.followup.FollowUpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AppointmentService {
    private final AppointmentRepository repo;
    private final LeadRepository leadRepo;
    private final FollowUpService followUpService;

    public List<AppointmentResponse> getAppointments(UUID tenantId) {
        return repo.findByTenantIdOrderByStartTimeDesc(tenantId).stream().map(this::map).toList();
    }

    public List<AppointmentResponse> getLeadAppointments(UUID leadId, UUID tenantId) {
        return repo.findByLeadIdOrderByCreatedAtDesc(leadId).stream().map(this::map).toList();
    }

    public AppointmentResponse createAppointment(UUID tenantId, UUID createdBy, CreateAppointmentRequest req) {
        Lead lead = leadRepo.findById(req.getLeadId()).orElse(null);
        
        ZonedDateTime start = req.getStartTime() != null ? req.getStartTime().atZone(ZoneId.systemDefault()) : null;
        ZonedDateTime end = req.getEndTime() != null ? req.getEndTime().atZone(ZoneId.systemDefault()) : (start != null ? start.plusMinutes(30) : null);

        // Calendar Reliability: Check for duplicate/overlapping appointment
        if (start != null && end != null) {
            List<Appointment> existing = repo.findByTenantIdOrderByStartTimeDesc(tenantId);
            for (Appointment a : existing) {
                if (a.getStatus() == AppointmentStatus.CONFIRMED && a.getStartTime() != null && a.getEndTime() != null) {
                    if (start.isBefore(a.getEndTime()) && end.isAfter(a.getStartTime())) {
                        log.warn("Slot collision detected with appointment {} ({} - {}).", a.getId(), a.getStartTime(), a.getEndTime());
                    }
                }
            }
        }

        Appointment apt = Appointment.builder()
            .tenantId(tenantId)
            .lead(lead)
            .title(req.getTitle())
            .description(req.getDescription())
            .startTime(start)
            .endTime(end)
            .timezone(req.getTimezone() != null ? req.getTimezone() : "Asia/Kolkata")
            .meetingLink(req.getMeetingLink() != null && !req.getMeetingLink().isBlank() ? req.getMeetingLink() : "https://meet.google.com/new")
            .assignedToId(req.getAssignedToId())
            .status(AppointmentStatus.CONFIRMED)
            .build();
        apt = repo.save(apt);

        if (lead != null) {
            lead.setStatus(LeadStatus.MEETING_BOOKED);
            leadRepo.save(lead);
            // Cancel any remaining followups once a meeting is booked
            followUpService.cancelFollowUpsForLead(lead.getId(), "Meeting confirmed: " + req.getTitle());
        }

        return map(apt);
    }

    public AppointmentResponse updateStatus(UUID id, UUID tenantId, String status) {
        Appointment apt = repo.findById(id)
            .filter(a -> a.getTenantId().equals(tenantId))
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + id));
        apt.setStatus(AppointmentStatus.valueOf(status.toUpperCase()));
        return map(repo.save(apt));
    }

    private AppointmentResponse map(Appointment a) {
        return AppointmentResponse.builder()
            .id(a.getId())
            .tenantId(a.getTenantId())
            .leadId(a.getLead() != null ? a.getLead().getId() : null)
            .title(a.getTitle())
            .description(a.getDescription())
            .startTime(a.getStartTime() != null ? a.getStartTime().toLocalDateTime() : null)
            .endTime(a.getEndTime() != null ? a.getEndTime().toLocalDateTime() : null)
            .timezone(a.getTimezone())
            .meetingLink(a.getMeetingLink())
            .status(a.getStatus().name())
            .createdAt(a.getCreatedAt() != null ? a.getCreatedAt().toLocalDateTime() : null)
            .build();
    }
}