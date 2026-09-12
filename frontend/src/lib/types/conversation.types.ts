export type MessageType = 'AI' | 'HUMAN' | 'CUSTOMER' | 'SYSTEM' | 'NOTE';

export interface Conversation {
  id: string;
  tenantId: string;
  leadId: string;
  channel: string;
  status: string;
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  type: MessageType;
  content: string;
  senderName?: string;
  isRead: boolean;
  createdAt: string;
}
