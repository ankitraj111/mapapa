import { api } from './axios';

export const knowledgeApi = {
  getDocuments: (category?: string) => 
    api.get(category && category !== 'ALL' ? `/knowledge?category=${category}` : '/knowledge')
       .then((r: any) => r?.data?.data || r?.data || r || []),
  createDocument: (data: any) => api.post('/knowledge', data).then((r: any) => r?.data?.data || r?.data || r),
  uploadDocument: (formData: FormData) => 
    api.post('/knowledge/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
       .then((r: any) => r?.data?.data || r?.data || r),
  updateDocument: (id: string, data: any) => api.put(`/knowledge/${id}`, data).then((r: any) => r?.data?.data || r?.data || r),
  deleteDocument: (id: string) => api.delete(`/knowledge/${id}`).then((r: any) => r?.data?.data || r?.data || r),
  searchDocuments: (q: string) => api.get(`/knowledge/search?q=${encodeURIComponent(q)}`).then((r: any) => r?.data?.data || r?.data || r || []),
};
