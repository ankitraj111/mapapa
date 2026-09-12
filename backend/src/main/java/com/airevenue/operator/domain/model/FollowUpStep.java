package com.airevenue.operator.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "follow_up_step")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FollowUpStep {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sequence_id", nullable = false)
    private FollowUpSequence sequence;

    @Column(nullable = false)
    private Integer stepNumber;

    @Column(nullable = false)
    private Integer delayHours;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String messageTemplate;

    @Builder.Default
    private String channel = "EMAIL";

    @CreationTimestamp
    private ZonedDateTime createdAt;
}
