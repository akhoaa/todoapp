import { apiService } from './api';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  ChangePasswordRequest,
  UpdateProfileRequest,
} from '../types';

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', credentials);
    
    // Store tokens
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    
    return response;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/register', userData);
    
    // Store tokens
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    
    return response;
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      // Even if logout fails on server, clear local tokens
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  async getProfile(): Promise<User> {
    return apiService.get<User>('/users/profile');
  }

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    return apiService.put<User>('/users/profile', data);
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    return apiService.put<{ message: string }>('/users/change-password', data);
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiService.post<AuthResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });

    // Update tokens
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);

    return response;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}

export const authService = new AuthService();
