package com.airevenue.operator.service.integration;

import com.airevenue.operator.domain.model.Conversation;
import com.airevenue.operator.domain.model.Lead;
import com.airevenue.operator.domain.model.Message;
import com.airevenue.operator.dto.request.CreateLeadRequest;
import com.airevenue.operator.repository.ConversationRepository;
import com.airevenue.operator.repository.IntegrationRepository;
import com.airevenue.operator.repository.LeadRepository;
import com.airevenue.operator.repository.MessageRepository;
import com.airevenue.operator.service.ai.AIConversationService;
import com.airevenue.operator.service.lead.LeadService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WhatsAppServiceTest {

    @Mock
    private IntegrationRepository integrationRepo;
    @Mock
    private LeadRepository leadRepo;
    @Mock
    private ConversationRepository convRepo;
    @Mock
    private MessageRepository msgRepo;
    @Mock
    private LeadService leadService;
    @Mock
    private AIConversationService aiConversationService;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private WhatsAppService whatsAppService;

    private UUID tenantId;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Verify webhook verification token match")
    void testVerifyWebhookToken() {
        boolean valid = whatsAppService.verifyWebhookToken("my_secret_token", "my_secret_token");
        boolean invalid = whatsAppService.verifyWebhookToken("wrong_token", "my_secret_token");

        assertThat(valid).isTrue();
        assertThat(invalid).isFalse();
    }

    @Test
    @DisplayName("Inbound WhatsApp message creates new lead and triggers autonomous AI response")
    void testProcessInboundWhatsAppPayload_CreatesLeadAndReplies() {
        Map<String, Object> payload = Map.of(
            "entry", List.of(
                Map.of("changes", List.of(
                    Map.of("value", Map.of(
                        "contacts", List.of(Map.of("profile", Map.of("name", "Vikram Seth"))),
                        "messages", List.of(Map.of(
                            "from", "+919876543210",
                            "type", "text",
                            "text", Map.of("body", "I need pricing for 5 AI agents.")
                        ))
                    ))
                ))
            )
        );

        Lead createdLead = Lead.builder()
            .id(UUID.randomUUID())
            .tenantId(tenantId)
            .firstName("Vikram Seth")
            .phone("+919876543210")
            .requirement("I need pricing for 5 AI agents.")
            .build();

        Conversation conversation = Conversation.builder()
            .id(UUID.randomUUID())
            .tenantId(tenantId)
            .lead(createdLead)
            .channel("WHATSAPP")
            .build();

        when(leadRepo.findByTenantIdAndPhone(eq(tenantId), eq("+919876543210"))).thenReturn(Optional.empty());
        when(leadService.createLeadInternal(eq(tenantId), any(CreateLeadRequest.class))).thenReturn(createdLead);
        when(convRepo.save(any(Conversation.class))).thenReturn(conversation);
        when(aiConversationService.processNewLead(any(Lead.class), any(Conversation.class))).thenReturn("Hi Vikram, our pricing starts at $499/mo.");

        whatsAppService.processInboundWhatsAppPayload(tenantId, payload);

        verify(leadService).createLeadInternal(eq(tenantId), any(CreateLeadRequest.class));
        verify(msgRepo).save(any(Message.class));
        verify(aiConversationService).processNewLead(eq(createdLead), eq(conversation));
    }
}
