package com.airevenue.operator.dto.request;

import lombok.Data;

@Data
public class UpdateLeadRequest {
    private String firstName;
    private String lastName;
    private String phone;
    private String company;
    private String location;
    private String requirement;
    private Double estimatedBudget;
    private String timeline;
    private String intent;
}
