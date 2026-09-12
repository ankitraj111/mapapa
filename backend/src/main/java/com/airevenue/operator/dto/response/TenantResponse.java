package com.airevenue.operator.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data 
@Builder 
public class TenantResponse {
    private UUID id;
    private String name;
    private String slug;
    private String description;
    private String industry;
    private String website;
    private String phone;
    private String email;
    private String timezone;
    private String currency;
    private String aiTone;
    private LocalTime workingHoursStart;
    private LocalTime workingHoursEnd;
    private boolean followUpEnabled;
    private boolean isActive;
    private ZonedDateTime createdAt;
}
