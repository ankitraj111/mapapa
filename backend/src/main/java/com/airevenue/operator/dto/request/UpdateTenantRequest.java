package com.airevenue.operator.dto.request;
import lombok.Data;

@Data
public class UpdateTenantRequest {
    private String name;
    private String description;
    private String industry;
    private String website;
    private String phone;
    private String email;
    private String timezone;
    private String workingHoursStart;
    private String workingHoursEnd;
    private String aiTone;
    private Boolean followUpEnabled;
}
