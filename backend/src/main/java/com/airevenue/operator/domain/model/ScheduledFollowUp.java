package com.airevenue.operator.domain.model;

import com.airevenue.operator.domain.enums.FollowUpStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "scheduled_follow_up")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduledFollowUp {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID tenantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id")
    private Lead lead;

    private UUID sequenceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step_id")
    private FollowUpStep step;

    @Column(nullable = false)
    private ZonedDateTime scheduledAt;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private FollowUpStatus status = FollowUpStatus.PENDING;

    private ZonedDateTime sentAt;

    private String errorMessage;

    @CreationTimestamp
    private ZonedDateTime createdAt;

    public UUID getLeadId() {
        return lead != null ? lead.getId() : null;
    }
}