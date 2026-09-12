export interface DashboardStats {
  leadsToday: number;
  qualifiedToday: number;
  hotLeads: number;
  meetingsBooked: number;
  followUpsPending: number;
  aiActionsToday: number;
  humanReviewCount: number;
  estimatedPipeline: number;
}

export interface LeadTrendPoint {
  date: string;
  day: string;
  leads: number;
  qualified: number;
}

export interface StatusDistributionPoint {
  status: string;
  count: number;
}

export interface SourceStat {
  source: string;
  count: number;
}

export interface PipelineStat {
  status: string;
  count: number;
}

export interface AiActivityPoint {
  id: string;
  type: string;
  status: string;
  latencyMs: number;
  createdAt: string;
  leadId?: string;
}
