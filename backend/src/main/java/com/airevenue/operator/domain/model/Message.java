package com.airevenue.operator.domain.model;

import com.airevenue.operator.domain.enums.MessageType;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "message")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID tenantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageType type;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private String metadata;

    private String senderName;

    @Builder.Default
    private boolean isRead = false;

    @CreationTimestamp
    private ZonedDateTime createdAt;
}
