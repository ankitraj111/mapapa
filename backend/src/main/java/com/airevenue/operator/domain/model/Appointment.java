package com.airevenue.operator.domain.model;

import com.airevenue.operator.domain.enums.AppointmentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "appointment")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID tenantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id")
    private Lead lead;

    private UUID conversationId;
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private ZonedDateTime startTime;
    private ZonedDateTime endTime;

    @Builder.Default
    private String timezone = "UTC";

    private String meetingLink;
    private String googleEventId;
    private UUID assignedToId;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.PENDING;

    @CreationTimestamp
    private ZonedDateTime createdAt;

    public UUID getLeadId() {
        return lead != null ? lead.getId() : null;
    }
}