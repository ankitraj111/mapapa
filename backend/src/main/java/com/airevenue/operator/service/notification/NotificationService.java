package com.airevenue.operator.service.notification;

import com.airevenue.operator.domain.model.Notification;
import com.airevenue.operator.dto.response.NotificationResponse;
import com.airevenue.operator.repository.MembershipRepository;
import com.airevenue.operator.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {
    private final NotificationRepository repo;
    private final MembershipRepository membershipRepo;

    public void createNotification(UUID tenantId, UUID userId, String type, String title, String message, Map<String,Object> metadata) {
        repo.save(Notification.builder().tenantId(tenantId).userId(userId).type(type)
            .title(title).message(message).isRead(false).build());
    }

    public void notifyTenantOwners(UUID tenantId, String type, String title, String message) {
        membershipRepo.findByTenantIdAndIsActiveTrue(tenantId).stream()
            .filter(m -> "OWNER".equals(m.getRole().name()) || "ADMIN".equals(m.getRole().name()))
            .forEach(m -> createNotification(tenantId, m.getUserId(), type, title, message, null));
    }

    public List<NotificationResponse> getNotifications(UUID userId, Pageable pageable) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId, pageable).stream()
            .map(n -> NotificationResponse.builder()
                .id(n.getId())
                .tenantId(n.getTenantId())
                .userId(n.getUserId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt() != null ? n.getCreatedAt().toLocalDateTime() : null)
                .build())
            .toList();
    }

    public void markAsRead(UUID id, UUID userId) {
        repo.findById(id).ifPresent(n -> { n.setIsRead(true); repo.save(n); });
    }

    public void markAllAsRead(UUID userId) {
        repo.findByUserIdAndIsReadFalse(userId).forEach(n -> { n.setIsRead(true); repo.save(n); });
    }

    public long getUnreadCount(UUID userId) {
        return repo.countByUserIdAndIsReadFalse(userId);
    }
}