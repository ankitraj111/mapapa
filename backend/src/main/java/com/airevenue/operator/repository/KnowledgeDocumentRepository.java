package com.airevenue.operator.repository;
import com.airevenue.operator.domain.model.KnowledgeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface KnowledgeDocumentRepository extends JpaRepository<KnowledgeDocument, UUID> {
    List<KnowledgeDocument> findByTenantIdAndIsActiveTrue(UUID tenantId);
    List<KnowledgeDocument> findByTenantIdAndCategory(UUID tenantId, String category);
    @Query("SELECT d FROM KnowledgeDocument d WHERE d.tenantId = :tid AND d.isActive = true AND (LOWER(d.title) LIKE %:q% OR LOWER(d.content) LIKE %:q%)")
    List<KnowledgeDocument> searchByTenantIdAndQuery(@Param("tid") UUID tenantId, @Param("q") String q);
}
