import { apiClient } from './apiClient';
import { ChatRoom, ChatMessage } from '../utils/types';
import { transformChatRoom, transformChatMessage } from '../utils/apiTransform';

export interface CreateChatRoomData {
  type: 'country' | 'election' | 'candidate';
  entityId: string;
  name: string;
  description?: string;
  moderators?: string[];
}

export interface CreateMessageData {
  content: string;
}

export const chatService = {
  // Chat Rooms
  async getRooms(type?: string, entityId?: string): Promise<ChatRoom[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (entityId) params.append('entityId', entityId);
    
    const queryString = params.toString();
    const data = await apiClient.get<any[]>(`/chat/rooms${queryString ? `?${queryString}` : ''}`);
    return data.map(transformChatRoom);
  },

  async getRoomById(id: string): Promise<ChatRoom> {
    const data = await apiClient.get<any>(`/chat/rooms/${id}`);
    return transformChatRoom(data);
  },

  async createRoom(data: CreateChatRoomData): Promise<ChatRoom> {
    const payload = {
      type: data.type,
      entity_id: data.entityId,
      name: data.name,
      description: data.description,
      moderators: data.moderators,
    };
    const result = await apiClient.post<any>('/chat/rooms', payload);
    return transformChatRoom(result);
  },

  async updateRoom(id: string, data: Partial<ChatRoom>): Promise<ChatRoom> {
    const payload: any = {};
    if (data.name) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.moderators) payload.moderators = data.moderators;
    
    const result = await apiClient.put<any>(`/chat/rooms/${id}`, payload);
    return transformChatRoom(result);
  },

  async deleteRoom(id: string): Promise<void> {
    return apiClient.delete(`/chat/rooms/${id}`);
  },

  // Messages
  async getMessages(roomId: string, limit = 50): Promise<ChatMessage[]> {
    const data = await apiClient.get<any[]>(`/chat/rooms/${roomId}/messages?limit=${limit}`);
    return data.map(transformChatMessage);
  },

  async sendMessage(roomId: string, data: CreateMessageData): Promise<ChatMessage> {
    const result = await apiClient.post<any>(`/chat/rooms/${roomId}/messages`, data);
    return transformChatMessage(result);
  },

  async updateMessage(id: string, data: Partial<ChatMessage>): Promise<ChatMessage> {
    const payload: any = {};
    if (data.content) payload.content = data.content;
    if (data.flagged !== undefined) payload.flagged = data.flagged;
    if (data.deleted !== undefined) payload.deleted = data.deleted;
    if (data.isPinned !== undefined) payload.is_pinned = data.isPinned;
    
    const result = await apiClient.put<any>(`/chat/messages/${id}`, payload);
    return transformChatMessage(result);
  },

  async deleteMessage(id: string): Promise<void> {
    return apiClient.delete(`/chat/messages/${id}`);
  },

  async getFlaggedMessages(): Promise<ChatMessage[]> {
    const data = await apiClient.get<any[]>('/chat/messages/flagged');
    return data.map(transformChatMessage);
  },
};

