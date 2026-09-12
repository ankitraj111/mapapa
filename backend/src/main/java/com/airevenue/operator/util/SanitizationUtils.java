package com.airevenue.operator.util;

import java.util.regex.Pattern;

public class SanitizationUtils {

    private static final Pattern SCRIPT_PATTERN = Pattern.compile("(?i)<script[\\s\\S]*?>[\\s\\S]*?</script>");
    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]+>");
    private static final Pattern JS_PROTOCOL_PATTERN = Pattern.compile("(?i)(javascript|vbscript|data):[^\\s]*");
    private static final Pattern CONTROL_CHARS = Pattern.compile("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]");

    public static String sanitize(String input) {
        if (input == null) return "";
        String clean = SCRIPT_PATTERN.matcher(input).replaceAll("");
        clean = HTML_TAG_PATTERN.matcher(clean).replaceAll("");
        clean = JS_PROTOCOL_PATTERN.matcher(clean).replaceAll("");
        clean = CONTROL_CHARS.matcher(clean).replaceAll("");
        return clean.trim();
    }

    public static String sanitizeEmail(String email) {
        if (email == null) return "";
        String clean = sanitize(email).toLowerCase().replaceAll("\\s+", "");
        return clean;
    }

    public static String sanitizePhone(String phone) {
        if (phone == null) return "";
        String clean = phone.replaceAll("[^0-9+()\\-\\s]", "").trim();
        return clean;
    }
}
