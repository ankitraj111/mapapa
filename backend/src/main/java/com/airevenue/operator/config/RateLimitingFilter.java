package com.airevenue.operator.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Slf4j
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS_PER_MINUTE = 60;
    
    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    // Fallback in-memory store if Redis is absent or unreachable
    private final ConcurrentHashMap<String, RequestBucket> inMemoryBuckets = new ConcurrentHashMap<>();

    private static class RequestBucket {
        final long windowStart;
        final AtomicInteger count;

        RequestBucket(long windowStart) {
            this.windowStart = windowStart;
            this.count = new AtomicInteger(1);
        }
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();

        // Rate limit webhooks and auth endpoints
        if (isRateLimitedPath(path)) {
            String clientIp = extractClientIp(request);
            if (!isAllowed(clientIp)) {
                log.warn("Rate limit exceeded for IP {} on path {}", clientIp, path);
                response.setStatus(429);
                response.setHeader("Retry-After", "60");
                response.setContentType("application/json");
                response.getWriter().write("""
                    {"status":429,"error":"Too Many Requests","message":"Rate limit exceeded. Please try again in a minute."}
                """);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimitedPath(String path) {
        return path.startsWith("/api/v1/webhooks/") || path.startsWith("/api/v1/auth/");
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }

    public boolean isAllowed(String clientIp) {
        long currentMinute = System.currentTimeMillis() / 60000L;
        String key = "ratelimit:" + clientIp + ":" + currentMinute;

        // Try distributed Redis first
        if (redisTemplate != null) {
            try {
                Long count = redisTemplate.opsForValue().increment(key);
                if (count != null && count == 1) {
                    redisTemplate.expire(key, Duration.ofSeconds(65));
                }
                return count != null && count <= MAX_REQUESTS_PER_MINUTE;
            } catch (Exception e) {
                log.debug("Redis rate limiting unavailable, falling back to in-memory: {}", e.getMessage());
            }
        }

        // In-Memory Fallback
        if (inMemoryBuckets.size() > 5000) {
            inMemoryBuckets.entrySet().removeIf(e -> e.getValue().windowStart < currentMinute);
        }

        RequestBucket bucket = inMemoryBuckets.compute(key, (k, existing) -> {
            if (existing == null) {
                return new RequestBucket(currentMinute);
            }
            existing.count.incrementAndGet();
            return existing;
        });

        return bucket.count.get() <= MAX_REQUESTS_PER_MINUTE;
    }

    public void clear() {
        inMemoryBuckets.clear();
    }
}
