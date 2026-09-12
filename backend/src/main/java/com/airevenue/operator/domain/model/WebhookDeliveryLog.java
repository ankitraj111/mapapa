package com.airevenue.operator.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "webhook_delivery_log", indexes = {
    @Index(name = "idx_webhook_idempotency", columnList = "idempotencyKey"),
    @Index(name = "idx_webhook_tenant_source", columnList = "tenantId, source")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebhookDeliveryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID tenantId;

    @Column(nullable = false, length = 50)
    private String source;

    @Column(unique = true, length = 255)
    private String idempotencyKey;

    @Column(columnDefinition = "TEXT")
    private String payload;

    @Builder.Default
    @Column(nullable = false, length = 30)
    private String status = "PENDING"; // PENDING, SUCCESS, FAILED, DEAD

    @Builder.Default
    private int attempts = 1;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @CreationTimestamp
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;

    private ZonedDateTime processedAt;
    private ZonedDateTime nextRetryAt;
}
