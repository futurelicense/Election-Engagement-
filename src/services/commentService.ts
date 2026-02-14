import { apiClient } from './apiClient';
import { Comment } from '../utils/types';
import { transformComment } from '../utils/apiTransform';

export interface CreateCommentData {
  electionId?: string;
  newsId?: string;
  parentCommentId?: string;
  content: string;
}

export interface CommentReactionData {
  emoji: string;
}

export const commentService = {
  async getByElection(electionId: string, includeReplies = true): Promise<Comment[]> {
    const data = await apiClient.get<any[]>(
      `/comments/election/${electionId}?includeReplies=${includeReplies}`
    );
    return data.map(transformComment);
  },

  async getByNews(newsId: string, includeReplies = true): Promise<Comment[]> {
    const data = await apiClient.get<any[]>(
      `/comments/news/${newsId}?includeReplies=${includeReplies}`
    );
    return data.map(transformComment);
  },

  async create(data: CreateCommentData): Promise<Comment> {
    // Validate required fields
    if (!data.electionId && !data.newsId) {
      throw new Error('Either Election ID or News ID is required');
    }
    if (!data.content || !data.content.trim()) {
      throw new Error('Content is required');
    }
    
    const payload: any = {
      content: data.content.trim(),
    };
    
    if (data.electionId) payload.electionId = data.electionId;
    if (data.newsId) payload.newsId = data.newsId;
    if (data.parentCommentId) payload.parentCommentId = data.parentCommentId;
    
    console.log('Creating comment with payload:', { ...payload, content: payload.content.substring(0, 50) + '...' });
    
    const result = await apiClient.post<any>('/comments', payload);
    return transformComment(result);
  },

  async like(commentId: string): Promise<void> {
    return apiClient.post(`/comments/${commentId}/like`, {});
  },

  async addReaction(commentId: string, data: CommentReactionData): Promise<void> {
    return apiClient.post(`/comments/${commentId}/reaction`, data);
  },

  async update(commentId: string, data: Partial<Comment>): Promise<Comment> {
    const payload: any = {};
    if (data.content) payload.content = data.content;
    if (data.approved !== undefined) payload.approved = data.approved;
    if (data.flagged !== undefined) payload.flagged = data.flagged;
    
    const result = await apiClient.put<any>(`/comments/${commentId}`, payload);
    return transformComment(result);
  },

  async delete(commentId: string): Promise<void> {
    return apiClient.delete(`/comments/${commentId}`);
  },

  async getAllForModeration(filter?: 'all' | 'pending' | 'approved' | 'flagged'): Promise<Comment[]> {
    const query = filter ? `?filter=${filter}` : '';
    const data = await apiClient.get<any[]>(`/comments/admin/all${query}`);
    return data.map(transformComment);
  },
};

