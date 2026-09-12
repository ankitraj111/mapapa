package com.airevenue.operator.service.integration;

import com.airevenue.operator.domain.enums.IntegrationType;
import com.airevenue.operator.domain.enums.MessageType;
import com.airevenue.operator.domain.model.Conversation;
import com.airevenue.operator.domain.model.Lead;
import com.airevenue.operator.domain.model.Message;
import com.airevenue.operator.dto.request.CreateLeadRequest;
import com.airevenue.operator.repository.ConversationRepository;
import com.airevenue.operator.repository.LeadRepository;
import com.airevenue.operator.repository.MessageRepository;
import com.airevenue.operator.service.ai.AIConversationService;
import com.airevenue.operator.service.lead.LeadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class GmailService {

    private final GoogleAuthService googleAuthService;
    private final LeadRepository leadRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final LeadService leadService;
    private final AIConversationService aiConversationService;
    private final RestClient restClient = RestClient.builder().build();

    public void sendEmailViaGmailApi(UUID tenantId, String toEmail, String subject, String body, String threadId) {
        String accessToken = googleAuthService.getValidAccessToken(tenantId, IntegrationType.GMAIL);

        String rawMime = "To: " + toEmail + "\r\n" +
            "Subject: " + subject + "\r\n" +
            "Content-Type: text/plain; charset=UTF-8\r\n\r\n" +
            body;

        String encodedRaw = Base64.getUrlEncoder().withoutPadding().encodeToString(rawMime.getBytes(StandardCharsets.UTF_8));
        Map<String, Object> payload = new HashMap<>();
        payload.put("raw", encodedRaw);
        if (threadId != null && !threadId.isBlank()) {
            payload.put("threadId", threadId);
        }

        com.airevenue.operator.util.RetryUtils.runWithRetry("GmailSendEmail", () -> 
            restClient.post()
                .uri("https://gmail.googleapis.com/gmail/v1/users/me/messages/send")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .toBodilessEntity()
        );

        log.info("Email successfully dispatched via Gmail API for tenant {} to {}", tenantId, toEmail);
    }

    public int syncInboundEmails(UUID tenantId) {
        String accessToken;
        try {
            accessToken = googleAuthService.getValidAccessToken(tenantId, IntegrationType.GMAIL);
        } catch (Exception e) {
            log.warn("Gmail not connected for tenant {}: {}", tenantId, e.getMessage());
            return 0;
        }

        Map<String, Object> listRes = com.airevenue.operator.util.RetryUtils.executeWithRetry("GmailSyncInbox", () ->
            restClient.get()
                .uri("https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=20")
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {})
        );

        if (listRes == null || !listRes.containsKey("messages")) {
            return 0;
        }

        @SuppressWarnings("unchecked")
        List<Map<String, String>> messages = (List<Map<String, String>>) listRes.get("messages");
        int processedCount = 0;

        for (Map<String, String> msgSummary : messages) {
            String msgId = msgSummary.get("id");
            try {
                processSingleGmailMessage(tenantId, accessToken, msgId);
                processedCount++;
            } catch (Exception ex) {
                log.error("Failed to process Gmail message {} for tenant {}: {}", msgId, tenantId, ex.getMessage());
            }
        }
        return processedCount;
    }

    private void processSingleGmailMessage(UUID tenantId, String accessToken, String msgId) {
        Map<String, Object> msg = restClient.get()
            .uri("https://gmail.googleapis.com/gmail/v1/users/me/messages/" + msgId + "?format=full")
            .header("Authorization", "Bearer " + accessToken)
            .retrieve()
            .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (msg == null) return;

        String snippet = (String) msg.getOrDefault("snippet", "");
        String threadId = (String) msg.get("threadId");

        @SuppressWarnings("unchecked")
        Map<String, Object> payload = (Map<String, Object>) msg.get("payload");
        if (payload == null) return;

        @SuppressWarnings("unchecked")
        List<Map<String, String>> headers = (List<Map<String, String>>) payload.get("headers");
        String fromHeader = "";
        String subjectHeader = "";

        if (headers != null) {
            for (Map<String, String> h : headers) {
                if ("From".equalsIgnoreCase(h.get("name"))) fromHeader = h.get("value");
                if ("Subject".equalsIgnoreCase(h.get("name"))) subjectHeader = h.get("value");
            }
        }

        String email = extractEmailAddress(fromHeader);
        String senderName = extractSenderName(fromHeader);

        if (email.isBlank()) return;

        // Check if lead already exists
        Optional<Lead> existingLead = leadRepository.findByTenantIdAndEmail(tenantId, email);
        Lead lead;
        Conversation conversation;

        if (existingLead.isPresent()) {
            lead = existingLead.get();
            List<Conversation> convs = conversationRepository.findByLeadId(lead.getId());
            conversation = convs.isEmpty()
                ? conversationRepository.save(Conversation.builder().tenantId(tenantId).lead(lead).channel("EMAIL").status("OPEN").build())
                : convs.get(0);

            messageRepository.save(Message.builder()
                .tenantId(tenantId)
                .conversation(conversation)
                .type(MessageType.CUSTOMER)
                .content(snippet)
                .senderName(senderName)
                .isRead(false)
                .build());

            // Autonomous AI interaction
            String aiReply = aiConversationService.processLeadMessage(lead, conversation, snippet);
            if (aiReply != null && !aiReply.isBlank()) {
                sendEmailViaGmailApi(tenantId, email, "Re: " + subjectHeader, aiReply, threadId);
            }
        } else {
            CreateLeadRequest req = new CreateLeadRequest();
            req.setFirstName(senderName.isBlank() ? "Prospect" : senderName);
            req.setEmail(email);
            req.setRequirement(snippet);
            req.setSource("EMAIL");
            lead = leadService.createLeadInternal(tenantId, req);

            conversation = conversationRepository.save(Conversation.builder()
                .tenantId(tenantId).lead(lead).channel("EMAIL").status("OPEN").build());

            messageRepository.save(Message.builder()
                .tenantId(tenantId).conversation(conversation)
                .type(MessageType.CUSTOMER).content(snippet)
                .senderName(senderName).isRead(false).build());

            String aiReply = aiConversationService.processNewLead(lead, conversation);
            if (aiReply != null && !aiReply.isBlank()) {
                sendEmailViaGmailApi(tenantId, email, "Re: " + subjectHeader, aiReply, threadId);
            }
        }

        // Mark email as read by removing UNREAD label
        restClient.post()
            .uri("https://gmail.googleapis.com/gmail/v1/users/me/messages/" + msgId + "/modify")
            .header("Authorization", "Bearer " + accessToken)
            .contentType(MediaType.APPLICATION_JSON)
            .body(Map.of("removeLabelIds", List.of("UNREAD")))
            .retrieve()
            .toBodilessEntity();
    }

    private String extractEmailAddress(String from) {
        if (from == null) return "";
        int start = from.indexOf("<");
        int end = from.indexOf(">");
        if (start != -1 && end != -1 && end > start) {
            return from.substring(start + 1, end).trim();
        }
        return from.trim();
    }

    private String extractSenderName(String from) {
        if (from == null) return "";
        int start = from.indexOf("<");
        if (start > 0) {
            return from.substring(0, start).replace("\"", "").trim();
        }
        return from.trim();
    }
}
