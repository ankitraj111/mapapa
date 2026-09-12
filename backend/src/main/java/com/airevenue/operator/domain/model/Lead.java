package com.airevenue.operator.domain.model;

import com.airevenue.operator.domain.enums.LeadStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "lead")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lead {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID tenantId;

    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String company;
    private String source;
    private String sourceCampaign;
    private String location;
    
    @Column(columnDefinition = "TEXT")
    private String requirement;
    
    private BigDecimal estimatedBudget;
    private String timeline;
    private String intent;
    
    @Builder.Default
    private Integer score = 0;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeadStatus status;
    
    private UUID ownerId;
    private String qualificationStatus;
    
    @Column(columnDefinition = "TEXT")
    private String conversationSummary;
    
    @Column(columnDefinition = "TEXT")
    private String aiSummary;
    
    @Column(columnDefinition = "TEXT")
    private String humanNotes;
    
    private ZonedDateTime lastContactedAt;
    private ZonedDateTime nextFollowUpAt;
    
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = ZonedDateTime.now();
        updatedAt = createdAt;
        if(status == null) status = LeadStatus.NEW;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = ZonedDateTime.now();
    }
}
