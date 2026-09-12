import { api } from './axios';
import { Conversation, Message } from '../types/conversation.types';

export const conversationsApi = {
  getLeadConversations: (leadId: string) =>
    api.get<Conversation[]>(`/leads/${leadId}/conversations`).then(r => r.data),
  getConversation: (id: string) =>
    api.get<Conversation>(`/conversations/${id}`).then(r => r.data),
  getMessages: (conversationId: string) =>
    api.get<Message[]>(`/conversations/${conversationId}/messages`).then(r => r.data),
  sendMessage: (conversationId: string, content: string, type = 'HUMAN') =>
    api.post<Message>(`/conversations/${conversationId}/messages`, { content, type }).then(r => r.data),
  createConversation: (leadId: string, channel = 'WEBHOOK') =>
    api.post<Conversation>(`/leads/${leadId}/conversations`, { leadId, channel }).then(r => r.data),
};
