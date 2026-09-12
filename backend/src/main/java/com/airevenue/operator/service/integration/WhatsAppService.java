package com.airevenue.operator.service.integration;

import com.airevenue.operator.domain.enums.IntegrationType;
import com.airevenue.operator.domain.enums.MessageType;
import com.airevenue.operator.domain.model.Conversation;
import com.airevenue.operator.domain.model.Integration;
import com.airevenue.operator.domain.model.Lead;
import com.airevenue.operator.domain.model.Message;
import com.airevenue.operator.dto.request.CreateLeadRequest;
import com.airevenue.operator.repository.ConversationRepository;
import com.airevenue.operator.repository.IntegrationRepository;
import com.airevenue.operator.repository.LeadRepository;
import com.airevenue.operator.repository.MessageRepository;
import com.airevenue.operator.service.ai.AIConversationService;
import com.airevenue.operator.service.lead.LeadService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class WhatsAppService {

    private final IntegrationRepository integrationRepo;
    private final LeadRepository leadRepo;
    private final ConversationRepository convRepo;
    private final MessageRepository msgRepo;
    private final LeadService leadService;
    private final AIConversationService aiConversationService;
    private final ObjectMapper objectMapper;
    private final RestClient restClient = RestClient.builder().build();

    public boolean verifyWebhookToken(String token, String expectedToken) {
        return token != null && token.equals(expectedToken);
    }

    public void processInboundWhatsAppPayload(UUID tenantId, Map<String, Object> payload) {
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> entryList = (List<Map<String, Object>>) payload.get("entry");
            if (entryList == null || entryList.isEmpty()) return;

            for (Map<String, Object> entry : entryList) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> changes = (List<Map<String, Object>>) entry.get("changes");
                if (changes == null) continue;

                for (Map<String, Object> change : changes) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> value = (Map<String, Object>) change.get("value");
                    if (value == null || !value.containsKey("messages")) continue;

                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> messages = (List<Map<String, Object>>) value.get("messages");
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> contacts = (List<Map<String, Object>>) value.get("contacts");

                    String senderName = "WhatsApp Prospect";
                    if (contacts != null && !contacts.isEmpty()) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> profile = (Map<String, Object>) contacts.get(0).get("profile");
                        if (profile != null && profile.containsKey("name")) {
                            senderName = (String) profile.get("name");
                        }
                    }

                    for (Map<String, Object> msg : messages) {
                        String fromPhone = (String) msg.get("from");
                        String type = (String) msg.get("type");
                        String textBody = "";

                        if ("text".equalsIgnoreCase(type)) {
                            @SuppressWarnings("unchecked")
                            Map<String, String> textObj = (Map<String, String>) msg.get("text");
                            if (textObj != null) textBody = textObj.get("body");
                        }

                        if (!textBody.isBlank() && fromPhone != null) {
                            handleIncomingWhatsAppMessage(tenantId, fromPhone, senderName, textBody);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to process WhatsApp payload for tenant {}: {}", tenantId, e.getMessage(), e);
        }
    }

    public void sendWhatsAppMessage(UUID tenantId, String recipientPhone, String text) {
        Integration integration = integrationRepo.findByTenantIdAndType(tenantId, IntegrationType.WHATSAPP)
            .filter(Integration::getIsActive)
            .orElseThrow(() -> new RuntimeException("WhatsApp integration not configured for tenant: " + tenantId));

        String phoneNumberId = "";
        String accessToken = integration.getAccessToken();

        try {
            if (integration.getConfig() != null) {
                Map<String, Object> cfg = objectMapper.readValue(integration.getConfig(), new TypeReference<>() {});
                phoneNumberId = (String) cfg.getOrDefault("phoneNumberId", "");
            }
        } catch (Exception e) {
            log.error("Failed to parse WhatsApp config: {}", e.getMessage());
        }

        if (phoneNumberId.isBlank() || accessToken == null || accessToken.isBlank()) {
            throw new RuntimeException("Missing WhatsApp phoneNumberId or accessToken in integration config.");
        }

        final String phoneId = phoneNumberId;
        final String token = accessToken;

        Map<String, Object> req = Map.of(
            "messaging_product", "whatsapp",
            "to", recipientPhone,
            "type", "text",
            "text", Map.of("body", text)
        );

        com.airevenue.operator.util.RetryUtils.runWithRetry("WhatsAppSendMessage", () ->
            restClient.post()
                .uri("https://graph.facebook.com/v20.0/" + phoneId + "/messages")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .body(req)
                .retrieve()
                .toBodilessEntity()
        );

        log.info("Dispatched outbound WhatsApp message for tenant {} to {}", tenantId, recipientPhone);
    }

    private void handleIncomingWhatsAppMessage(UUID tenantId, String fromPhone, String senderName, String text) {
        Optional<Lead> existingLead = leadRepo.findByTenantIdAndPhone(tenantId, fromPhone);
        Lead lead;
        Conversation conversation;

        if (existingLead.isPresent()) {
            lead = existingLead.get();
            List<Conversation> convs = convRepo.findByLeadId(lead.getId());
            conversation = convs.isEmpty()
                ? convRepo.save(Conversation.builder().tenantId(tenantId).lead(lead).channel("WHATSAPP").status("OPEN").build())
                : convs.get(0);

            msgRepo.save(Message.builder()
                .tenantId(tenantId)
                .conversation(conversation)
                .type(MessageType.CUSTOMER)
                .content(text)
                .senderName(senderName)
                .isRead(false)
                .build());

            String aiReply = aiConversationService.processLeadMessage(lead, conversation, text);
            if (aiReply != null && !aiReply.isBlank()) {
                sendWhatsAppMessage(tenantId, fromPhone, aiReply);
            }
        } else {
            CreateLeadRequest req = new CreateLeadRequest();
            req.setFirstName(senderName);
            req.setPhone(fromPhone);
            req.setEmail(fromPhone + "@whatsapp.lead");
            req.setRequirement(text);
            req.setSource("WHATSAPP");
            lead = leadService.createLeadInternal(tenantId, req);

            conversation = convRepo.save(Conversation.builder()
                .tenantId(tenantId).lead(lead).channel("WHATSAPP").status("OPEN").build());

            msgRepo.save(Message.builder()
                .tenantId(tenantId)
                .conversation(conversation)
                .type(MessageType.CUSTOMER)
                .content(text)
                .senderName(senderName)
                .isRead(false)
                .build());

            String aiReply = aiConversationService.processNewLead(lead, conversation);
            if (aiReply != null && !aiReply.isBlank()) {
                sendWhatsAppMessage(tenantId, fromPhone, aiReply);
            }
        }
    }
}
