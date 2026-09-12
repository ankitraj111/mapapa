import { api } from './axios';

export const tasksApi = {
  getTasks: (status?: string) => api.get(`/tasks${status ? `?status=${status}` : ''}`).then(r => r.data?.data || []),
  createTask: (data: any) => api.post('/tasks', data).then(r => r.data?.data),
  completeTask: (id: string) => api.patch(`/tasks/${id}/complete`).then(r => r.data?.data),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`).then(r => r.data),
};
