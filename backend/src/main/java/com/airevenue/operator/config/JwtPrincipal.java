package com.airevenue.operator.config;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtPrincipal {
    private UUID userId;
    private UUID tenantId;
    private String role;

    public UUID userId() { return userId; }
    public UUID tenantId() { return tenantId; }
    public String role() { return role; }
}