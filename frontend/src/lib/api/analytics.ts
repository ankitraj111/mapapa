import { api } from './axios';
import { DashboardStats, LeadTrendPoint, StatusDistributionPoint, AiActivityPoint, SourceStat, PipelineStat } from '../types/analytics.types';

export const analyticsApi = {
  getDashboardStats: (): Promise<DashboardStats> =>
    api.get('/analytics/dashboard').then((r: any) => r?.data || r),
  getLeadTrend: (days = 7): Promise<LeadTrendPoint[]> =>
    api.get(`/analytics/lead-trend?days=${days}`).then((r: any) => r?.data || r || []),
  getSourceStats: (days = 30): Promise<SourceStat[]> =>
    api.get(`/analytics/sources?days=${days}`).then((r: any) => r?.data || r || []),
  getPipelineStats: (): Promise<PipelineStat[]> =>
    api.get('/analytics/pipeline').then((r: any) => r?.data || r || []),
  getStatusDistribution: (): Promise<StatusDistributionPoint[]> =>
    api.get('/analytics/status-distribution').then((r: any) => r?.data || r || []),
  getDailySummary: (): Promise<{ summary: string }> =>
    api.get('/analytics/daily-summary').then((r: any) => r?.data || r || { summary: '' }),
  getAiActivity: (): Promise<AiActivityPoint[]> =>
    api.get('/analytics/ai-activity').then((r: any) => r?.data || r || []),
};
