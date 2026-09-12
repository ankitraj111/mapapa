package com.airevenue.operator.service.ai;

public interface AIProvider {
    String generateText(String systemPrompt, String userPrompt, String model);
    String getProviderName();
}
