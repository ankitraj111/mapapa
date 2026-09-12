package com.airevenue.operator.domain.model;

import com.airevenue.operator.domain.enums.IntegrationType;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity @Table(name = "integration")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Integration {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false) private UUID tenantId;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private IntegrationType type;
    @Type(JsonType.class) @Column(columnDefinition = "jsonb") private String config;
    @Column(columnDefinition = "TEXT") private String accessToken;
    @Column(columnDefinition = "TEXT") private String refreshToken;
    private ZonedDateTime tokenExpiry;
    @Builder.Default private String status = "CONNECTED";
    @Column(columnDefinition = "TEXT") private String lastErrorMessage;
    private ZonedDateTime lastSyncedAt;
    @Builder.Default private boolean isActive = true;
    @CreationTimestamp private ZonedDateTime createdAt;
    @UpdateTimestamp private ZonedDateTime updatedAt;

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(boolean active) { this.isActive = active; }
}
