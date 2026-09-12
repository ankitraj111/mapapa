package com.airevenue.operator.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity @Table(name = "follow_up_sequence")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class FollowUpSequence {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false) private UUID tenantId;
    @Column(nullable = false) private String name;
    @Builder.Default private boolean isActive = true;
    @Builder.Default private boolean stopOnReply = true;
    @Builder.Default private boolean stopOnBooking = true;
    @Builder.Default private Integer maxFollowUps = 4;
    @CreationTimestamp private ZonedDateTime createdAt;

    public Boolean getIsActive() { return isActive; }
    public Boolean getStopOnReply() { return stopOnReply; }
    public Boolean getStopOnBooking() { return stopOnBooking; }
}
