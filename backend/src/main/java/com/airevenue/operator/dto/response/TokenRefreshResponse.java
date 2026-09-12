package com.airevenue.operator.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data 
@Builder 
@AllArgsConstructor 
public class TokenRefreshResponse {
    private String accessToken;
}
