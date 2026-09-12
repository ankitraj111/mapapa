package com.airevenue.operator.domain.model;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "tenant")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tenant {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String industry;
    private String website;
    private String phone;
    private String email;
    
    @Column(columnDefinition = "TEXT")
    private String address;
    
    @Builder.Default
    private String timezone = "UTC";
    
    @Builder.Default
    private String currency = "USD";
    
    private LocalTime workingHoursStart;
    private LocalTime workingHoursEnd;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private String workingDays;
    
    private String aiTone;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private String qualificationRules;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private String scoringRules;
    
    @Builder.Default
    private boolean followUpEnabled = true;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private String escalationRules;
    
    @Builder.Default
    private String plan = "GROWTH";

    @Builder.Default
    private String subscriptionStatus = "ACTIVE";

    private ZonedDateTime subscriptionPeriodEnd;

    @Builder.Default
    private Integer monthlyLeadLimit = 1000;

    @Builder.Default
    private Integer monthlyAiActionLimit = 10000;

    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    
    @Builder.Default
    private boolean isActive = true;

    public boolean isActive() { return isActive; }
    public boolean getIsActive() { return isActive; }
    public boolean getFollowUpEnabled() { return followUpEnabled; }
    
    @PrePersist
    protected void onCreate() {
        createdAt = ZonedDateTime.now();
        updatedAt = createdAt;
        if (subscriptionPeriodEnd == null) {
            subscriptionPeriodEnd = createdAt.plusDays(30);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = ZonedDateTime.now();
    }
}