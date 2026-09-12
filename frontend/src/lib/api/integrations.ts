import { api } from './axios';

export const integrationsApi = {
  getIntegrations: () => api.get('/integrations').then((r: any) => r?.data?.data || r?.data || r || []),
  getGoogleAuthUrl: (type: 'GMAIL' | 'GOOGLE_CALENDAR') => 
    api.get(`/integrations/google/auth-url?type=${type}`).then((r: any) => r?.data?.data || r?.data || r),
  handleGoogleCallback: (code: string, type: 'GMAIL' | 'GOOGLE_CALENDAR', redirectUri?: string) =>
    api.post('/integrations/google/callback', { code, type, redirectUri }).then((r: any) => r?.data?.data || r?.data || r),
  saveWhatsAppConfig: (phoneNumberId: string, accessToken: string) =>
    api.post('/integrations/whatsapp/config', { phoneNumberId, accessToken }).then((r: any) => r?.data?.data || r?.data || r),
  getWebhookUrl: () => api.get('/integrations/webhook-url').then((r: any) => r?.data?.data || r?.data || r),
  getHealth: () => api.get('/integrations/health').then((r: any) => r?.data?.data || r?.data || r),
  syncGmail: () => api.post('/integrations/gmail/sync').then((r: any) => r?.data?.data || r?.data || r),
  deleteIntegration: (id: string) => api.delete(`/integrations/${id}`).then((r: any) => r?.data?.data || r?.data || r),
};
