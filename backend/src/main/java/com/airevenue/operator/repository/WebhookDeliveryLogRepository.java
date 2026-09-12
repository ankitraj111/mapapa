package com.airevenue.operator.repository;

import com.airevenue.operator.domain.model.WebhookDeliveryLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WebhookDeliveryLogRepository extends JpaRepository<WebhookDeliveryLog, UUID> {

    Optional<WebhookDeliveryLog> findByIdempotencyKey(String idempotencyKey);

    boolean existsByIdempotencyKeyAndCreatedAtAfter(String idempotencyKey, ZonedDateTime after);

    List<WebhookDeliveryLog> findByTenantIdAndStatusOrderByCreatedAtDesc(UUID tenantId, String status);
}
