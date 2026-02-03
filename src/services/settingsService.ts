import { apiClient } from './apiClient';

export interface PlatformSettings {
  [key: string]: string;
}

export const settingsService = {
  async getAll(): Promise<PlatformSettings> {
    return apiClient.get<PlatformSettings>('/settings');
  },

  async getByKey(key: string): Promise<{ key: string; value: string }> {
    return apiClient.get<{ key: string; value: string }>(`/settings/${key}`);
  },

  async update(key: string, value: string): Promise<{ key: string; value: string }> {
    return apiClient.put<{ key: string; value: string }>(`/settings/${key}`, { value });
  },

  async delete(key: string): Promise<void> {
    return apiClient.delete(`/settings/${key}`);
  },
};

