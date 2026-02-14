import { apiClient } from './apiClient';
import { User } from '../utils/types';

export interface LoginCredentials {
  email: string;
  pin: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  pin: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },
};

