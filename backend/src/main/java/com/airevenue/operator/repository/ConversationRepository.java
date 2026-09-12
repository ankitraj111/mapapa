package com.airevenue.operator.repository;

import com.airevenue.operator.domain.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    List<Conversation> findByLeadId(UUID leadId);
    List<Conversation> findByTenantId(UUID tenantId);
}
