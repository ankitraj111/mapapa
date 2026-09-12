package com.airevenue.operator.controller;

import com.airevenue.operator.config.JwtPrincipal;
import com.airevenue.operator.dto.response.NotificationResponse;
import com.airevenue.operator.service.notification.NotificationService;
import com.airevenue.operator.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> get(@AuthenticationPrincipal JwtPrincipal p) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getNotifications(p.getUserId(), PageRequest.of(0, 30))));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> unreadCount(@AuthenticationPrincipal JwtPrincipal p) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUnreadCount(p.getUserId())));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<String>> markRead(@AuthenticationPrincipal JwtPrincipal p, @PathVariable UUID id) {
        notificationService.markAsRead(id, p.getUserId());
        return ResponseEntity.ok(ApiResponse.success("OK", "Marked as read"));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<String>> markAllRead(@AuthenticationPrincipal JwtPrincipal p) {
        notificationService.markAllAsRead(p.getUserId());
        return ResponseEntity.ok(ApiResponse.success("OK", "All marked as read"));
    }
}