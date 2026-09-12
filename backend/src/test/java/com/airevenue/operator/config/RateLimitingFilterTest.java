package com.airevenue.operator.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimitingFilterTest {

    private RateLimitingFilter rateLimitingFilter;

    @BeforeEach
    void setUp() {
        rateLimitingFilter = new RateLimitingFilter();
        rateLimitingFilter.clear();
    }

    @Test
    @DisplayName("Should allow requests under 60 per minute limit")
    void testAllowNormalRequests() {
        String clientIp = "192.168.1.100";
        for (int i = 0; i < 60; i++) {
            assertThat(rateLimitingFilter.isAllowed(clientIp)).isTrue();
        }
    }

    @Test
    @DisplayName("Should block 61st request from same IP in the same minute")
    void testBlockExceededRequests() {
        String clientIp = "192.168.1.200";
        for (int i = 0; i < 60; i++) {
            assertThat(rateLimitingFilter.isAllowed(clientIp)).isTrue();
        }
        // 61st request must be rejected
        assertThat(rateLimitingFilter.isAllowed(clientIp)).isFalse();
    }

    @Test
    @DisplayName("Should isolate rate limits between different client IPs")
    void testDistinctClientIps() {
        String ipA = "10.0.0.1";
        String ipB = "10.0.0.2";

        for (int i = 0; i < 60; i++) {
            assertThat(rateLimitingFilter.isAllowed(ipA)).isTrue();
        }
        assertThat(rateLimitingFilter.isAllowed(ipA)).isFalse();

        // ipB should still be allowed
        assertThat(rateLimitingFilter.isAllowed(ipB)).isTrue();
    }
}
