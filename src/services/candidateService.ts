import { apiClient } from './apiClient';
import { Candidate } from '../utils/types';
import { transformCandidate } from '../utils/apiTransform';

export const candidateService = {
  async getAll(electionId?: string): Promise<Candidate[]> {
    const query = electionId ? `?electionId=${electionId}` : '';
    const data = await apiClient.get<any[]>(`/candidates${query}`);
    return data.map(transformCandidate);
  },

  async getById(id: string): Promise<Candidate> {
    const data = await apiClient.get<any>(`/candidates/${id}`);
    return transformCandidate(data);
  },

  async create(data: Omit<Candidate, 'id'>): Promise<Candidate> {
    const payload = {
      electionId: data.electionId,
      name: data.name,
      party: data.party,
      image: data.image,
      bio: data.bio,
      color: data.color,
    };
    const result = await apiClient.post<any>('/candidates', payload);
    return transformCandidate(result);
  },

  async update(id: string, data: Partial<Candidate>): Promise<Candidate> {
    // Send only fields that are explicitly provided
    const payload: any = {};
    
    // Include all fields that are provided
    if (data.electionId !== undefined) payload.electionId = data.electionId;
    if (data.name !== undefined) payload.name = data.name;
    if (data.party !== undefined) payload.party = data.party;
    // Only include image if it's explicitly provided (not undefined)
    // This way, if image hasn't changed, we don't send it and backend keeps existing
    if (data.image !== undefined) {
      payload.image = data.image; // Can be null, empty string, or new URL
    }
    if (data.bio !== undefined) payload.bio = data.bio;
    if (data.color !== undefined) payload.color = data.color;
    
    console.log('Updating candidate with payload:', { 
      ...payload, 
      image: payload.image !== undefined 
        ? (payload.image ? `${String(payload.image).substring(0, 50)}... (${String(payload.image).length} chars)` : 'null/empty')
        : 'not provided (will keep existing)'
    });
    
    const result = await apiClient.put<any>(`/candidates/${id}`, payload);
    return transformCandidate(result);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/candidates/${id}`);
  },
};

