package com.airevenue.operator.dto.request;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class CreateLeadRequest {
    private String firstName;
    private String lastName;
    @Email private String email;
    private String phone;
    private String company;
    private String source;
    private String sourceCampaign;
    private String location;
    private String requirement;
    private Double estimatedBudget;
    private String timeline;
    private String intent;

    public void setName(String name) {
        if (name != null && !name.isBlank()) {
            String[] parts = name.trim().split("\\s+", 2);
            this.firstName = parts[0];
            if (parts.length > 1) {
                this.lastName = parts[1];
            } else if (this.lastName == null) {
                this.lastName = "";
            }
        }
    }

    public void setBudget(Double budget) {
        this.estimatedBudget = budget;
    }
}
