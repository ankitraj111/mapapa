package com.airevenue.operator.service.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
@Slf4j
public class OpenAIProvider implements AIProvider {

    @Value("${app.openai.api-key:}") 
    private String apiKey;
    
    @Value("${app.openai.base-url:}") 
    private String baseUrl;

    @Value("${app.openai.default-model:gpt-4o-mini}") 
    private String defaultModel;
    
    @Value("${app.openai.max-tokens:2000}") 
    private int maxTokens;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String DEFAULT_OPENAI_URL = "https://api.openai.com/v1/chat/completions";
    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    
    private static final String FALLBACK_RESPONSE = 
        "Thank you for reaching out! I've noted your inquiry and our team will review it shortly. " +
        "Could you share a bit more about your specific requirements so I can better assist you?";

    @Override
    public String generateText(String systemPrompt, String userPrompt, String model) {
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("your-openai-key-here") || apiKey.equals("sk-dummy")) {
            log.warn("AI API key not configured. Returning fallback response.");
            return FALLBACK_RESPONSE;
        }

        try {
            String targetUrl = DEFAULT_OPENAI_URL;
            String targetModel = model != null ? model : defaultModel;

            if (baseUrl != null && !baseUrl.isBlank()) {
                targetUrl = baseUrl;
            } else if (apiKey.startsWith("gsk_")) {
                targetUrl = GROQ_URL;
                targetModel = "llama-3.3-70b-versatile";
            }

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey.trim());
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", targetModel);
            requestBody.put("messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)
            ));
            requestBody.put("max_tokens", maxTokens);
            requestBody.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(targetUrl, entity, Map.class);

            if (response.getBody() == null) return FALLBACK_RESPONSE;

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
            if (choices == null || choices.isEmpty()) return FALLBACK_RESPONSE;

            @SuppressWarnings("unchecked")
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            String content = (String) message.get("content");
            
            log.debug("OpenAI response received, length: {}", content != null ? content.length() : 0);
            return content != null ? content.trim() : FALLBACK_RESPONSE;

        } catch (Exception e) {
            log.error("OpenAI API call failed: {} - {}", e.getClass().getSimpleName(), e.getMessage());
            return FALLBACK_RESPONSE;
        }
    }

    @Override
    public String getProviderName() { return "openai"; }
}
