import { apiClient } from './apiClient';
import { Country, Election } from '../utils/types';
import { transformElection } from '../utils/apiTransform';

export const countryService = {
  async getAll(): Promise<Country[]> {
    const data = await apiClient.get<Country[]>('/countries');
    return data;
  },

  async getById(id: string): Promise<Country> {
    return apiClient.get<Country>(`/countries/${id}`);
  },

  async create(data: Omit<Country, 'id'>): Promise<Country> {
    return apiClient.post<Country>('/countries', data);
  },

  async update(id: string, data: Partial<Country>): Promise<Country> {
    // Always send all fields - backend will handle retaining existing values if needed
    const payload: any = {};
    
    // Include all fields that are provided
    if (data.name !== undefined) payload.name = data.name;
    if (data.flag !== undefined) payload.flag = data.flag;
    if (data.code !== undefined) payload.code = data.code;
    
    console.log('Updating country with payload:', payload);
    console.log('Country ID:', id);
    
    return apiClient.put<Country>(`/countries/${id}`, payload);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/countries/${id}`);
  },

  async getElections(countryId: string): Promise<Election[]> {
    const data = await apiClient.get<any[]>(`/countries/${countryId}/elections`);
    return data.map(transformElection);
  },
};

