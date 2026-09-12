import { api } from './axios';

export const followUpsApi = {
  getSequences: () => api.get('/follow-ups/sequences').then(r => r.data?.data || []),
  createSequence: (data: any) => api.post('/follow-ups/sequences', data).then(r => r.data?.data),
  updateSequence: (id: string, data: any) => api.put(`/follow-ups/sequences/${id}`, data).then(r => r.data?.data),
  enrollLead: (leadId: string, sequenceId: string) => api.post(`/leads/${leadId}/follow-ups/enroll`, { sequenceId }).then(r => r.data?.data),
  getLeadFollowUps: (leadId: string) => api.get(`/leads/${leadId}/follow-ups`).then(r => r.data?.data || []),
};
