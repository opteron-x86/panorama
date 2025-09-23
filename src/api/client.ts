import axios, { AxiosError, AxiosInstance } from 'axios';
import { ApiError } from './errors';
import { AuthManager } from './auth';

const API_URL = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = AuthManager.getIdToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(this.handleError(error))
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => Promise.reject(this.handleError(error))
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;
      const message = data?.error || data?.message || error.message;

      if (status === 401) {
        AuthManager.clearTokens();
        window.location.href = '/login';
      }

      return new ApiError(status, message, data);
    }

    if (error.request) {
      return new ApiError(0, 'No response from server');
    }

    return new ApiError(0, error.message || 'Request failed');
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const response = await this.client.get<T>(endpoint, { params });
    return response.data;
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(endpoint, data);
    return response.data;
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(endpoint, data);
    return response.data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.client.delete<T>(endpoint);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export const apiGet = apiClient.get.bind(apiClient);
export const apiPost = apiClient.post.bind(apiClient);
export const apiPut = apiClient.put.bind(apiClient);
export const apiDelete = apiClient.delete.bind(apiClient);