package com.airevenue.operator.service.knowledge;

import com.airevenue.operator.domain.model.KnowledgeDocument;
import com.airevenue.operator.dto.request.CreateKnowledgeDocumentRequest;
import com.airevenue.operator.dto.response.KnowledgeDocumentResponse;
import com.airevenue.operator.repository.KnowledgeDocumentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class KnowledgeServiceTest {

    @Mock
    private KnowledgeDocumentRepository repo;

    @InjectMocks
    private KnowledgeService knowledgeService;

    private UUID tenantId;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Upload document parses file bytes and stores clean KnowledgeDocument")
    void testUploadDocument_ParsesAndSaves() {
        MockMultipartFile file = new MockMultipartFile(
            "file", "agency_pricing.md", "text/markdown",
            "# Pricing\nWebsites start at ₹1,00,000.\nSEO retainers at ₹50,000/mo.".getBytes(StandardCharsets.UTF_8)
        );

        when(repo.save(any(KnowledgeDocument.class))).thenAnswer(i -> {
            KnowledgeDocument d = i.getArgument(0);
            d.setId(UUID.randomUUID());
            return d;
        });

        KnowledgeDocumentResponse res = knowledgeService.uploadDocument(tenantId, "Agency Pricing 2026", "PRICING", file);

        assertThat(res).isNotNull();
        assertThat(res.getTitle()).isEqualTo("Agency Pricing 2026");
        assertThat(res.getCategory()).isEqualTo("PRICING");
        assertThat(res.getContent()).contains("Websites start at ₹1,00,000");
        verify(repo).save(any(KnowledgeDocument.class));
    }

    @Test
    @DisplayName("Build business context formats approved knowledge for strict AI grounding")
    void testBuildBusinessContext_FormatsKnowledgeCorrectly() {
        KnowledgeDocument d1 = KnowledgeDocument.builder()
            .id(UUID.randomUUID())
            .tenantId(tenantId)
            .title("Core Services")
            .category("SERVICES")
            .content("We provide Next.js and AI integrations.")
            .isActive(true)
            .build();

        KnowledgeDocument d2 = KnowledgeDocument.builder()
            .id(UUID.randomUUID())
            .tenantId(tenantId)
            .title("Refund Policy")
            .category("POLICIES")
            .content("14-day money-back guarantee.")
            .isActive(true)
            .build();

        when(repo.findByTenantIdAndIsActiveTrue(tenantId)).thenReturn(List.of(d1, d2));

        String context = knowledgeService.buildBusinessContext(tenantId);

        assertThat(context).contains("APPROVED BUSINESS KNOWLEDGE BASE");
        assertThat(context).contains("### [SERVICES] Core Services");
        assertThat(context).contains("### [POLICIES] Refund Policy");
        assertThat(context).contains("14-day money-back guarantee");
    }
}
