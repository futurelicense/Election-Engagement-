import { apiClient } from './apiClient';
import { Election, VoteStats } from '../utils/types';
import { transformElection } from '../utils/apiTransform';

export const electionService = {
  async getAll(): Promise<Election[]> {
    const data = await apiClient.get<any[]>('/elections');
    return data.map(transformElection);
  },

  async getById(id: string): Promise<Election> {
    const data = await apiClient.get<any>(`/elections/${id}`);
    return transformElection(data);
  },

  async create(data: Omit<Election, 'id'>): Promise<Election> {
    const payload = {
      country_id: data.countryId,
      type: data.type,
      date: data.date,
      status: data.status,
      description: data.description,
    };
    const result = await apiClient.post<any>('/elections', payload);
    return transformElection(result);
  },

  async update(id: string, data: Partial<Election>): Promise<Election> {
    const payload: any = {};
    if (data.countryId) payload.country_id = data.countryId;
    if (data.type) payload.type = data.type;
    if (data.date) payload.date = data.date;
    if (data.status) payload.status = data.status;
    if (data.description) payload.description = data.description;
    
    const result = await apiClient.put<any>(`/elections/${id}`, payload);
    return transformElection(result);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/elections/${id}`);
  },

  async getStats(electionId: string): Promise<VoteStats[]> {
    return apiClient.get<VoteStats[]>(`/elections/${electionId}/stats`);
  },
};

