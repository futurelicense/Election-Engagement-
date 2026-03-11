import { apiClient } from './apiClient';
import { Vote } from '../utils/types';

export interface CastVoteData {
  electionId: string;
  candidateId: string;
}

export interface VoteCheckResponse {
  hasVoted: boolean;
  vote: Vote | null;
}

export const voteService = {
  async castVote(data: CastVoteData): Promise<Vote> {
    return apiClient.post<Vote>('/votes', data);
  },

  async castVoteAsGuest(guestId: string, data: CastVoteData): Promise<{ id: string; candidateId: string; electionId: string; timestamp: string }> {
    return apiClient.post('/votes', { ...data, guestId });
  },

  async checkVote(electionId: string): Promise<VoteCheckResponse> {
    return apiClient.get<VoteCheckResponse>(`/votes/check/${electionId}`);
  },

  async checkGuestVote(guestId: string, electionId: string): Promise<VoteCheckResponse> {
    return apiClient.get<VoteCheckResponse>(`/votes/check/${electionId}?guestId=${encodeURIComponent(guestId)}`);
  },

  async claimGuestVotes(guestId: string): Promise<{ claimed: number }> {
    return apiClient.post<{ claimed: number }>('/votes/claim', { guestId });
  },

  async getUserVotes(): Promise<Vote[]> {
    return apiClient.get<Vote[]>('/votes/user');
  },
};

