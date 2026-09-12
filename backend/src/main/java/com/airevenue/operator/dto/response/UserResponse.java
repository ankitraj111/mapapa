package com.airevenue.operator.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data 
@Builder 
public class UserResponse {
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String avatarUrl;
    private boolean isEmailVerified;
}
