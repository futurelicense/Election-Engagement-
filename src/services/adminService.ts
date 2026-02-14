import { apiClient } from './apiClient';

export interface AdminStats {
  totalVotes: number;
  totalComments: number;
  pendingComments: number;
}

export interface ActivityItem {
  type: 'vote' | 'comment' | 'news';
  id: string;
  timestamp: string;
  message: string;
  user?: string;
  content?: string;
}

export const adminService = {
  async getStats(): Promise<AdminStats> {
    try {
      const [votesRes, commentsRes] = await Promise.all([
        apiClient.get<{ totalVotes: number }>('/votes/stats/total'),
        apiClient.get<{ totalComments: number; pendingComments: number }>('/comments/admin/stats'),
      ]);

      return {
        totalVotes: votesRes.totalVotes || 0,
        totalComments: commentsRes.totalComments || 0,
        pendingComments: commentsRes.pendingComments || 0,
      };
    } catch (error: any) {
      console.error('Failed to fetch admin stats:', error);
      return {
        totalVotes: 0,
        totalComments: 0,
        pendingComments: 0,
      };
    }
  },

  async getRecentActivity(limit = 10): Promise<ActivityItem[]> {
    try {
      return await apiClient.get<ActivityItem[]>(`/comments/admin/activity?limit=${limit}`);
    } catch (error: any) {
      console.error('Failed to fetch recent activity:', error);
      return [];
    }
  },
};

