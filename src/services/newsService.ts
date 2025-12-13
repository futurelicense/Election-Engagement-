import { apiClient } from './apiClient';
import { News } from '../utils/types';
import { transformNews } from '../utils/apiTransform';

export interface NewsQuery {
  countryId?: string;
  priority?: 'breaking' | 'important' | 'general';
}

export const newsService = {
  async getAll(query?: NewsQuery): Promise<News[]> {
    const params = new URLSearchParams();
    if (query?.countryId) params.append('countryId', query.countryId);
    if (query?.priority) params.append('priority', query.priority);
    
    const queryString = params.toString();
    const data = await apiClient.get<any[]>(`/news${queryString ? `?${queryString}` : ''}`);
    return data.map(transformNews);
  },

  async getById(id: string): Promise<News> {
    const data = await apiClient.get<any>(`/news/${id}`);
    return transformNews(data);
  },

  async create(data: Omit<News, 'id' | 'timestamp'>): Promise<News> {
    // Validate required fields
    if (!data.countryId) {
      throw new Error('Country ID is required');
    }
    if (!data.title || !data.title.trim()) {
      throw new Error('Title is required');
    }
    if (!data.content || !data.content.trim()) {
      throw new Error('Content is required');
    }
    
    const payload = {
      countryId: data.countryId,
      electionId: data.electionId,
      title: data.title.trim(),
      content: data.content.trim(),
      image: data.image,
      priority: data.priority,
      tags: data.tags || [],
      hashtags: data.hashtags || [],
    };
    
    console.log('Creating news with payload:', { ...payload, content: payload.content.substring(0, 50) + '...' });
    
    const result = await apiClient.post<any>('/news', payload);
    return transformNews(result);
  },

  async update(id: string, data: Partial<News>): Promise<News> {
    const payload: any = {};
    if (data.countryId) payload.countryId = data.countryId;
    if (data.electionId !== undefined) payload.electionId = data.electionId;
    if (data.title) payload.title = data.title;
    if (data.content) payload.content = data.content;
    if (data.image !== undefined) payload.image = data.image;
    if (data.priority) payload.priority = data.priority;
    if (data.tags) payload.tags = data.tags;
    if (data.hashtags) payload.hashtags = data.hashtags;
    
    const result = await apiClient.put<any>(`/news/${id}`, payload);
    return transformNews(result);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/news/${id}`);
  },
};

