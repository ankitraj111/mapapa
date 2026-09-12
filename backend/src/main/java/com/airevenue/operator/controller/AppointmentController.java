package com.airevenue.operator.controller;

import com.airevenue.operator.config.JwtPrincipal;
import com.airevenue.operator.dto.request.CreateAppointmentRequest;
import com.airevenue.operator.dto.response.AppointmentResponse;
import com.airevenue.operator.service.appointment.AppointmentService;
import com.airevenue.operator.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
public class AppointmentController {
    private final AppointmentService appointmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAll(@AuthenticationPrincipal JwtPrincipal p) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getAppointments(p.getTenantId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponse>> create(
            @AuthenticationPrincipal JwtPrincipal p, @Valid @RequestBody CreateAppointmentRequest req) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.createAppointment(p.getTenantId(), p.getUserId(), req), "Created"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateStatus(
            @AuthenticationPrincipal JwtPrincipal p, @PathVariable UUID id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.updateStatus(id, p.getTenantId(), body.get("status"))));
    }

    @GetMapping("/lead/{leadId}")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getByLead(
            @AuthenticationPrincipal JwtPrincipal p, @PathVariable UUID leadId) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getLeadAppointments(leadId, p.getTenantId())));
    }
}