import { api } from './axios';

export const appointmentsApi = {
  getAppointments: () => api.get('/appointments').then((r: any) => r?.data || r || []),
  getLeadAppointments: (leadId: string) => api.get(`/appointments/lead/${leadId}`).then((r: any) => r?.data || r || []),
  createAppointment: (data: any) => api.post('/appointments', data).then((r: any) => r?.data || r),
  updateStatus: (id: string, status: string) => api.patch(`/appointments/${id}/status`, { status }).then((r: any) => r?.data || r),
};
