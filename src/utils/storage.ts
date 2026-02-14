import { User, Vote, Comment } from './types';
const STORAGE_KEYS = {
  USER: 'election_user',
  VOTES: 'election_votes',
  COMMENTS: 'election_comments',
  SAVED_COUNTRIES: 'election_saved_countries',
  FEATURED_ELECTION: 'election_featured',
  BANNER_ENABLED: 'election_banner_enabled'
};
export const storage = {
  // User
  getUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },
  setUser: (user: User) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  clearUser: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
  // Votes
  getVotes: (): Vote[] => {
    const data = localStorage.getItem(STORAGE_KEYS.VOTES);
    return data ? JSON.parse(data) : [];
  },
  addVote: (vote: Vote) => {
    const votes = storage.getVotes();
    votes.push(vote);
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(votes));
  },
  hasVoted: (userId: string, electionId: string): boolean => {
    const votes = storage.getVotes();
    return votes.some(v => v.userId === userId && v.electionId === electionId);
  },
  // Comments
  getComments: (electionId: string): Comment[] => {
    const data = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const allComments: Comment[] = data ? JSON.parse(data) : [];
    return allComments.filter(c => c.electionId === electionId);
  },
  addComment: (comment: Comment) => {
    const data = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const comments: Comment[] = data ? JSON.parse(data) : [];
    comments.push(comment);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  },
  // Saved Countries
  getSavedCountries: (userId: string): string[] => {
    const data = localStorage.getItem(`${STORAGE_KEYS.SAVED_COUNTRIES}_${userId}`);
    return data ? JSON.parse(data) : [];
  },
  toggleSavedCountry: (userId: string, countryId: string) => {
    const saved = storage.getSavedCountries(userId);
    const index = saved.indexOf(countryId);
    if (index > -1) {
      saved.splice(index, 1);
    } else {
      saved.push(countryId);
    }
    localStorage.setItem(`${STORAGE_KEYS.SAVED_COUNTRIES}_${userId}`, JSON.stringify(saved));
  },
  // Featured Election
  getFeaturedElectionId: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.FEATURED_ELECTION);
  },
  setFeaturedElectionId: (electionId: string | null) => {
    if (electionId) {
      localStorage.setItem(STORAGE_KEYS.FEATURED_ELECTION, electionId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.FEATURED_ELECTION);
    }
  },
  // Banner Enabled
  isBannerEnabled: (): boolean => {
    const data = localStorage.getItem(STORAGE_KEYS.BANNER_ENABLED);
    return data === null ? true : data === 'true'; // Default to enabled
  },
  setBannerEnabled: (enabled: boolean) => {
    localStorage.setItem(STORAGE_KEYS.BANNER_ENABLED, String(enabled));
  }
};