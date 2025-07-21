import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiError } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Try to refresh token
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem('access_token', response.access_token);
              
              // Retry original request
              if (error.config) {
                error.config.headers.Authorization = `Bearer ${response.access_token}`;
                return this.api.request(error.config);
              }
            } catch (refreshError) {
              // Refresh failed, redirect to login
              this.clearTokens();
              window.location.href = '/login';
            }
          } else {
            // No refresh token, redirect to login
            this.clearTokens();
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(refreshToken: string) {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refresh_token: refreshToken,
    });
    return response.data;
  }

  private clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // Generic methods
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.api.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.api.delete(url);
    return response.data;
  }

  // Error handling helper
  handleError(error: any): ApiError {
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      statusCode: 500,
      message: 'An unexpected error occurred',
      error: 'Internal Server Error',
    };
  }
}

export const apiService = new ApiService();
