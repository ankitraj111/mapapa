package com.airevenue.operator.domain.model;

import com.airevenue.operator.domain.enums.ActionStatus;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "agent_action")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentAction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID tenantId;

    private UUID leadId;
    private UUID conversationId;

    @Column(nullable = false)
    private String actionType;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private String actionInput;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private String actionResult;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ActionStatus status = ActionStatus.PENDING;

    @Builder.Default
    private boolean requiresApproval = false;

    private UUID approvedBy;
    private ZonedDateTime approvedAt;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    private String aiModel;
    private String promptVersion;
    private Integer tokenUsage;
    private Long latencyMs;

    @CreationTimestamp
    private ZonedDateTime createdAt;
}
