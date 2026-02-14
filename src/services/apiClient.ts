// Use /api so Vite proxy (dev) or Vercel serverless (prod) handles it. No CORS when same-origin.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
const REQUEST_TIMEOUT_MS = 15_000;

export interface ApiError {
  error: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const signal = options.signal ?? controller.signal;

    try {
      const token = localStorage.getItem('token');

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const text = await response.text();
        let error: ApiError;
        try {
          error = text ? JSON.parse(text) : {};
        } catch {
          error = {};
        }
        const message =
          error.error ||
          error.message ||
          (response.status === 404 && this.baseURL === '/api'
            ? 'API not found. Is the backend running? Start it with: npm run dev:backend'
            : `HTTP ${response.status}: ${response.statusText}`);
        throw new Error(message);
      }

      // Handle empty responses
      const text = await response.text();
      if (!text) {
        return {} as T;
      }

      return JSON.parse(text);
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request took too long. Please check your connection and try again.');
        }
        const msg = (error.message || '').toLowerCase();
        const isNetworkError =
          error.name === 'TypeError' && (msg.includes('fetch') || msg.includes('failed') || msg.includes('network'));
        const isRefused = msg.includes('econnrefused') || (error as { code?: string }).code === 'ECONNREFUSED';
        if (isNetworkError || isRefused) {
          throw new Error(
            this.baseURL === '/api'
              ? 'Backend not reachable. Start it with: npm run dev:backend (or npm run dev:all)'
              : 'Unable to connect to server. Check the backend is running.'
          );
        }
      }
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

