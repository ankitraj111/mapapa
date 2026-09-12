package com.airevenue.operator.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private UUID tenantId;

    @Column(nullable = false)
    private String actorType;

    private String actorId;

    @Column(nullable = false)
    private String action;

    private String targetType;
    private String targetId;

    @Column(columnDefinition = "TEXT")
    private String inputSummary;

    @Column(columnDefinition = "TEXT")
    private String result;

    private String status;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @CreationTimestamp
    private ZonedDateTime createdAt;
}
