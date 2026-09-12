import { api } from './axios';
import { RegisterRequest, LoginRequest, AuthResponse } from '../types/auth.types';
import { useAuthStore } from '../stores/auth-store';

// Note: axios interceptor already returns response.data (the ApiResponse wrapper)
// Backend returns: { success: true, data: { accessToken, refreshToken, user, tenant }, message: "..." }
// So we access .data from the ApiResponse envelope

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res: { success: boolean; data: AuthResponse; message: string } = await api.post('/auth/register', data) as any;
    return res.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res: { success: boolean; data: AuthResponse; message: string } = await api.post('/auth/login', data) as any;
    return res.data;
  },

  logout: () => {
    useAuthStore.getState().clearAuth();
    if (typeof window !== 'undefined') window.location.href = '/login';
  },

  getCurrentUser: async () => {
    const res: any = await api.get('/auth/me');
    return res.data;
  },
};
