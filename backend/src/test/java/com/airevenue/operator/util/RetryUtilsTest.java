package com.airevenue.operator.util;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;

import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

class RetryUtilsTest {

    @Test
    void testExecuteWithRetrySucceedsOnFirstAttempt() {
        String result = RetryUtils.executeWithRetry("SuccessfulTask", () -> "SUCCESS");
        assertEquals("SUCCESS", result);
    }

    @Test
    void testExecuteWithRetryRecoversAfterTransient500Error() {
        AtomicInteger attempts = new AtomicInteger(0);

        String result = RetryUtils.executeWithRetry("RecoverableTask", () -> {
            int current = attempts.incrementAndGet();
            if (current < 2) {
                throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Temporary outage");
            }
            return "RECOVERED";
        }, 3, 50L, 1.5);

        assertEquals("RECOVERED", result);
        assertEquals(2, attempts.get());
    }

    @Test
    void testExecuteWithRetryFailsFastOn400BadRequest() {
        AtomicInteger attempts = new AtomicInteger(0);

        assertThrows(HttpClientErrorException.class, () -> {
            RetryUtils.executeWithRetry("FatalTask", () -> {
                attempts.incrementAndGet();
                throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Invalid payload");
            }, 3, 50L, 1.5);
        });

        assertEquals(1, attempts.get(), "Non-retryable 400 error must not be retried");
    }

    @Test
    void testExecuteWithRetryRetriesOn429RateLimit() {
        AtomicInteger attempts = new AtomicInteger(0);

        String result = RetryUtils.executeWithRetry("RateLimitedTask", () -> {
            int current = attempts.incrementAndGet();
            if (current < 3) {
                throw new HttpClientErrorException(HttpStatus.TOO_MANY_REQUESTS, "Rate limit reached");
            }
            return "SUCCESS_AFTER_BACKOFF";
        }, 3, 50L, 1.5);

        assertEquals("SUCCESS_AFTER_BACKOFF", result);
        assertEquals(3, attempts.get());
    }
}
