export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFYING' | 'QUALIFIED' | 'HOT' | 'WARM' | 'COLD' | 'MEETING_REQUESTED' | 'MEETING_BOOKED' | 'NO_RESPONSE' | 'NURTURE' | 'HUMAN_REVIEW' | 'WON' | 'LOST';
export type LeadSource = 'WEBSITE_FORM' | 'EMAIL' | 'WHATSAPP' | 'LINKEDIN' | 'REFERRAL' | 'OTHER';

export interface Lead {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  source: LeadSource;
  sourceCampaign?: string;
  location?: string;
  requirement?: string;
  estimatedBudget?: number;
  timeline?: string;
  intent?: string;
  score: number;
  status: LeadStatus;
  ownerId?: string;
  qualificationStatus?: string;
  conversationSummary?: string;
  aiSummary?: string;
  humanNotes?: string;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadFilters {
  status?: LeadStatus;
  source?: LeadSource;
  minScore?: number;
  search?: string;
  page?: number;
  size?: number;
}

export interface PipelineData {
  [key: string]: Lead[];
}
