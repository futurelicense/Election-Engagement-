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

  async checkVote(electionId: string): Promise<VoteCheckResponse> {
    return apiClient.get<VoteCheckResponse>(`/votes/check/${electionId}`);
  },

  async getUserVotes(): Promise<Vote[]> {
    return apiClient.get<Vote[]>('/votes/user');
  },
};

