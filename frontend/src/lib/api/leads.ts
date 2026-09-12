import { api } from './axios';
import { Lead, LeadFilters, LeadStatus, PipelineData } from '../types/lead.types';

export const leadsApi = {
  getLeads: async (filters?: LeadFilters): Promise<any> => {
    const response: any = await api.get('/leads', { params: filters });
    return response?.data || response;
  },

  getHotLeads: async (minScore = 70): Promise<Lead[]> => {
    const response: any = await api.get('/leads/hot', { params: { minScore } });
    return response?.data || response || [];
  },
  
  getLead: async (id: string): Promise<Lead> => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  createLead: async (data: Partial<Lead>): Promise<Lead> => {
    const response = await api.post('/leads', data);
    return response.data;
  },

  updateLead: async (id: string, data: Partial<Lead>): Promise<Lead> => {
    const response = await api.put(`/leads/${id}`, data);
    return response.data;
  },

  updateLeadStatus: async (id: string, status: LeadStatus): Promise<Lead> => {
    const response = await api.patch(`/leads/${id}/status`, { status });
    return response.data;
  },

  getPipeline: async (): Promise<PipelineData> => {
    const response = await api.get('/leads/pipeline');
    return response.data;
  },

  processWithAI: async (id: string): Promise<any> => {
    const response = await api.post(`/leads/${id}/process`);
    return response.data;
  }
};
