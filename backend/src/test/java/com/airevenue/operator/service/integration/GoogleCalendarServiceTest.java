package com.airevenue.operator.service.integration;

import com.airevenue.operator.domain.enums.AppointmentStatus;
import com.airevenue.operator.domain.enums.LeadStatus;
import com.airevenue.operator.domain.model.Appointment;
import com.airevenue.operator.domain.model.Lead;
import com.airevenue.operator.repository.AppointmentRepository;
import com.airevenue.operator.repository.LeadRepository;
import com.airevenue.operator.service.followup.FollowUpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GoogleCalendarServiceTest {

    @Mock
    private GoogleAuthService googleAuthService;
    @Mock
    private AppointmentRepository appointmentRepo;
    @Mock
    private LeadRepository leadRepo;
    @Mock
    private FollowUpService followUpService;

    @InjectMocks
    private GoogleCalendarService calendarService;

    private UUID tenantId;
    private UUID leadId;
    private Lead testLead;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        leadId = UUID.randomUUID();
        testLead = Lead.builder()
            .id(leadId)
            .tenantId(tenantId)
            .firstName("Rohan")
            .email("rohan@example.com")
            .status(LeadStatus.HOT)
            .build();
    }

    @Test
    @DisplayName("Compute available slots detects collisions and excludes busy windows")
    void testGetAvailableSlots_ExcludesBusyBlocks() {
        LocalDate testDate = LocalDate.now().plusDays(1);
        ZoneId zoneId = ZoneId.of("Asia/Kolkata");
        ZonedDateTime busyStart = testDate.atTime(10, 0).atZone(zoneId);
        ZonedDateTime busyEnd = testDate.atTime(10, 30).atZone(zoneId);

        Appointment existingApt = Appointment.builder()
            .id(UUID.randomUUID())
            .tenantId(tenantId)
            .startTime(busyStart)
            .endTime(busyEnd)
            .status(AppointmentStatus.CONFIRMED)
            .build();

        when(appointmentRepo.findByTenantIdOrderByStartTimeDesc(tenantId)).thenReturn(List.of(existingApt));

        List<Map<String, String>> slots = calendarService.getAvailableSlots(tenantId, testDate, "Asia/Kolkata");

        assertThat(slots).isNotEmpty();
        // Verify 10:00 - 10:30 slot is excluded
        boolean hasBusySlot = slots.stream().anyMatch(s -> s.get("startTime").contains("10:00:00"));
        assertThat(hasBusySlot).isFalse();
    }

    @Test
    @DisplayName("Book confirmed meeting sets status to MEETING_BOOKED and cancels pending follow-ups")
    void testBookConfirmedMeeting_TransitionsStatusAndCancelsFollowups() {
        ZonedDateTime start = ZonedDateTime.now().plusDays(2);
        ZonedDateTime end = start.plusMinutes(30);

        when(leadRepo.findById(leadId)).thenReturn(Optional.of(testLead));
        when(appointmentRepo.save(any(Appointment.class))).thenAnswer(i -> i.getArgument(0));

        Appointment apt = calendarService.bookConfirmedMeeting(
            tenantId, leadId, "Discovery Call", "Scope discussion", start, end, "Asia/Kolkata"
        );

        assertThat(apt).isNotNull();
        assertThat(apt.getStatus()).isEqualTo(AppointmentStatus.CONFIRMED);
        assertThat(testLead.getStatus()).isEqualTo(LeadStatus.MEETING_BOOKED);
        verify(leadRepo).save(testLead);
        verify(followUpService).cancelFollowUpsForLead(eq(leadId), contains("Meeting confirmed"));
    }
}
