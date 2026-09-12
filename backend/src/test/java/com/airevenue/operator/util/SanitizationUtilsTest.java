package com.airevenue.operator.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SanitizationUtilsTest {

    @Test
    @DisplayName("Should strip script tags and inline javascript payloads")
    void testSanitizeScriptTags() {
        String xss = "<script>alert('pwned')</script>John Doe";
        String clean = SanitizationUtils.sanitize(xss);
        assertThat(clean).isEqualTo("John Doe");

        String inlineJs = "javascript:alert(1)";
        assertThat(SanitizationUtils.sanitize(inlineJs)).isEmpty();
    }

    @Test
    @DisplayName("Should strip HTML tags and unwanted control characters")
    void testSanitizeHtmlTags() {
        String html = "<b>High Priority</b> Requirement <img src=x onerror=alert(1)>";
        String clean = SanitizationUtils.sanitize(html);
        assertThat(clean).isEqualTo("High Priority Requirement");
    }

    @Test
    @DisplayName("Should normalize and sanitize email addresses")
    void testSanitizeEmail() {
        String dirtyEmail = "  User.Name+Test@Example.COM <script>bad</script> ";
        String clean = SanitizationUtils.sanitizeEmail(dirtyEmail);
        assertThat(clean).isEqualTo("user.name+test@example.com");
    }

    @Test
    @DisplayName("Should normalize and sanitize phone numbers")
    void testSanitizePhone() {
        String dirtyPhone = "+91 (987) 654-3210 <script>";
        String clean = SanitizationUtils.sanitizePhone(dirtyPhone);
        assertThat(clean).isEqualTo("+91 (987) 654-3210");
    }
}
