package com.airevenue.operator.service.integration;

import com.airevenue.operator.domain.enums.AppointmentStatus;
import com.airevenue.operator.domain.enums.IntegrationType;
import com.airevenue.operator.domain.enums.LeadStatus;
import com.airevenue.operator.domain.model.Appointment;
import com.airevenue.operator.domain.model.Lead;
import com.airevenue.operator.repository.AppointmentRepository;
import com.airevenue.operator.repository.LeadRepository;
import com.airevenue.operator.service.followup.FollowUpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleCalendarService {

    private final GoogleAuthService googleAuthService;
    private final AppointmentRepository appointmentRepo;
    private final LeadRepository leadRepo;
    private final FollowUpService followUpService;
    private final RestClient restClient = RestClient.builder().build();

    public List<Map<String, String>> getAvailableSlots(UUID tenantId, LocalDate date, String timezone) {
        String tz = timezone != null ? timezone : "Asia/Kolkata";
        ZoneId zoneId = ZoneId.of(tz);

        ZonedDateTime dayStart = date.atTime(LocalTime.of(9, 0)).atZone(zoneId);
        ZonedDateTime dayEnd = date.atTime(LocalTime.of(18, 0)).atZone(zoneId);

        List<ZonedDateTime[]> busyIntervals = new ArrayList<>();

        // 1. Fetch busy slots from Google Calendar if connected
        try {
            String accessToken = googleAuthService.getValidAccessToken(tenantId, IntegrationType.GOOGLE_CALENDAR);
            Map<String, Object> req = Map.of(
                "timeMin", dayStart.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
                "timeMax", dayEnd.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
                "timeZone", tz,
                "items", List.of(Map.of("id", "primary"))
            );

            Map<String, Object> res = com.airevenue.operator.util.RetryUtils.executeWithRetry("GoogleCalendarFreeBusy", () ->
                restClient.post()
                    .uri("https://www.googleapis.com/calendar/v3/freeBusy")
                    .header("Authorization", "Bearer " + accessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(req)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {})
            );

            if (res != null && res.containsKey("calendars")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> calendars = (Map<String, Object>) res.get("calendars");
                @SuppressWarnings("unchecked")
                Map<String, Object> primary = (Map<String, Object>) calendars.get("primary");
                if (primary != null && primary.containsKey("busy")) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, String>> busyList = (List<Map<String, String>>) primary.get("busy");
                    for (Map<String, String> b : busyList) {
                        ZonedDateTime bStart = ZonedDateTime.parse(b.get("start"));
                        ZonedDateTime bEnd = ZonedDateTime.parse(b.get("end"));
                        busyIntervals.add(new ZonedDateTime[]{bStart, bEnd});
                    }
                }
            }
        } catch (Exception e) {
            log.info("Google Calendar freeBusy query skipped for tenant {}: {}", tenantId, e.getMessage());
        }

        // 2. Fetch busy slots from internal appointments
        List<Appointment> internalApts = appointmentRepo.findByTenantIdOrderByStartTimeDesc(tenantId);
        for (Appointment a : internalApts) {
            if (a.getStatus() == AppointmentStatus.CONFIRMED && a.getStartTime() != null && a.getEndTime() != null) {
                if (a.getStartTime().isBefore(dayEnd) && a.getEndTime().isAfter(dayStart)) {
                    busyIntervals.add(new ZonedDateTime[]{a.getStartTime(), a.getEndTime()});
                }
            }
        }

        // 3. Compute available 30-minute open windows
        List<Map<String, String>> openSlots = new ArrayList<>();
        ZonedDateTime cursor = dayStart;

        while (cursor.plusMinutes(30).isBefore(dayEnd) || cursor.plusMinutes(30).isEqual(dayEnd)) {
            ZonedDateTime slotStart = cursor;
            ZonedDateTime slotEnd = cursor.plusMinutes(30);

            boolean isColliding = busyIntervals.stream().anyMatch(b ->
                slotStart.isBefore(b[1]) && slotEnd.isAfter(b[0])
            );

            if (!isColliding) {
                openSlots.add(Map.of(
                    "startTime", slotStart.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
                    "endTime", slotEnd.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
                    "displayTime", slotStart.format(DateTimeFormatter.ofPattern("hh:mm a")) + " - " + slotEnd.format(DateTimeFormatter.ofPattern("hh:mm a z"))
                ));
            }
            cursor = cursor.plusMinutes(30);
        }

        return openSlots;
    }

    public Appointment bookConfirmedMeeting(UUID tenantId, UUID leadId, String title, String description, ZonedDateTime startTime, ZonedDateTime endTime, String timezone) {
        Lead lead = leadRepo.findById(leadId).orElse(null);
        String tz = timezone != null ? timezone : "Asia/Kolkata";
        String meetingLink = "https://meet.google.com/new";

        // Try creating real Google Calendar event with Hangouts Meet
        try {
            String accessToken = googleAuthService.getValidAccessToken(tenantId, IntegrationType.GOOGLE_CALENDAR);

            Map<String, Object> eventPayload = new HashMap<>();
            eventPayload.put("summary", title);
            eventPayload.put("description", description);
            eventPayload.put("start", Map.of("dateTime", startTime.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME), "timeZone", tz));
            eventPayload.put("end", Map.of("dateTime", endTime.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME), "timeZone", tz));

            if (lead != null && lead.getEmail() != null) {
                eventPayload.put("attendees", List.of(Map.of("email", lead.getEmail())));
            }

            eventPayload.put("conferenceData", Map.of(
                "createRequest", Map.of(
                    "requestId", UUID.randomUUID().toString(),
                    "conferenceSolutionKey", Map.of("type", "hangoutsMeet")
                )
            ));

            Map<String, Object> createdEvent = com.airevenue.operator.util.RetryUtils.executeWithRetry("GoogleCalendarCreateEvent", () ->
                restClient.post()
                    .uri("https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1")
                    .header("Authorization", "Bearer " + accessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(eventPayload)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {})
            );

            if (createdEvent != null && createdEvent.containsKey("hangoutLink")) {
                meetingLink = (String) createdEvent.get("hangoutLink");
            }
        } catch (Exception e) {
            log.warn("Google Calendar API event creation fallback for tenant {}: {}", tenantId, e.getMessage());
        }

        Appointment apt = Appointment.builder()
            .tenantId(tenantId)
            .lead(lead)
            .title(title)
            .description(description)
            .startTime(startTime)
            .endTime(endTime)
            .timezone(tz)
            .meetingLink(meetingLink)
            .status(AppointmentStatus.CONFIRMED)
            .build();

        apt = appointmentRepo.save(apt);

        if (lead != null) {
            lead.setStatus(LeadStatus.MEETING_BOOKED);
            leadRepo.save(lead);
            followUpService.cancelFollowUpsForLead(lead.getId(), "Meeting confirmed and scheduled: " + title);
        }

        log.info("Meeting successfully booked for tenant {} and lead {} - Meet Link: {}", tenantId, leadId, meetingLink);
        return apt;
    }
}
