package com.airevenue.operator.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;

import java.util.concurrent.Callable;

@Slf4j
public class RetryUtils {

    public static final int DEFAULT_MAX_ATTEMPTS = 3;
    public static final long DEFAULT_INITIAL_BACKOFF_MS = 500L;
    public static final double DEFAULT_MULTIPLIER = 2.0;

    public static <T> T executeWithRetry(String operationName, Callable<T> task) {
        return executeWithRetry(operationName, task, DEFAULT_MAX_ATTEMPTS, DEFAULT_INITIAL_BACKOFF_MS, DEFAULT_MULTIPLIER);
    }

    public static <T> T executeWithRetry(String operationName, Callable<T> task, int maxAttempts, long initialBackoffMs, double multiplier) {
        int attempt = 0;
        long backoff = initialBackoffMs;

        while (true) {
            attempt++;
            try {
                return task.call();
            } catch (Exception e) {
                boolean isRetryable = isRetryableException(e);
                if (!isRetryable || attempt >= maxAttempts) {
                    log.error("Operation [{}] failed after {} attempt(s). Retryable: {}. Error: {}", 
                        operationName, attempt, isRetryable, e.getMessage());
                    if (e instanceof RuntimeException re) {
                        throw re;
                    }
                    throw new RuntimeException("Execution failed in " + operationName, e);
                }

                log.warn("Operation [{}] failed on attempt {}/{}. Retrying in {} ms. Cause: {}", 
                    operationName, attempt, maxAttempts, backoff, e.getMessage());

                try {
                    Thread.sleep(backoff);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Retry interrupted for operation: " + operationName, ie);
                }

                backoff = (long) (backoff * multiplier);
            }
        }
    }

    public static void runWithRetry(String operationName, Runnable task) {
        executeWithRetry(operationName, () -> {
            task.run();
            return null;
        });
    }

    public static boolean isRetryableException(Throwable t) {
        if (t == null) return false;

        String msg = t.getMessage() != null ? t.getMessage().toLowerCase() : "";

        // 401 invalid_grant / revoked token must fail-fast without retry
        if (msg.contains("invalid_grant") || msg.contains("invalid_token") || msg.contains("token has been revoked")) {
            return false;
        }

        // Rate Limit (429) is retryable
        if (t instanceof HttpClientErrorException hce) {
            return hce.getStatusCode().value() == 429;
        }

        // Other 4xx client errors (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found) fail fast
        if (t instanceof HttpClientErrorException) {
            return false;
        }

        // Server Errors (5xx) are retryable
        if (t instanceof HttpServerErrorException) {
            return true;
        }

        // Network / timeout errors are retryable
        if (t instanceof ResourceAccessException || t instanceof java.io.IOException || t instanceof java.net.SocketTimeoutException) {
            return true;
        }

        // Inspect cause
        if (t.getCause() != null && t.getCause() != t) {
            return isRetryableException(t.getCause());
        }

        // Check exception message for common retryable HTTP indicators
        return msg.contains("429") || msg.contains("rate limit") || msg.contains("500") || 
               msg.contains("502") || msg.contains("503") || msg.contains("504") || 
               msg.contains("timeout") || msg.contains("connection reset") || 
               msg.contains("broken pipe") || msg.contains("connection refused");
    }
}
