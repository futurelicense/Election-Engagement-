export interface Country {
  id: string;
  name: string;
  flag: string;
  code: string;
}
export interface Election {
  id: string;
  countryId: string;
  type: 'Presidential' | 'Parliamentary' | 'Local Government';
  date: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  description: string;
}
export interface Candidate {
  id: string;
  electionId: string;
  name: string;
  party: string;
  image: string;
  bio: string;
  color: string;
}
export interface Vote {
  id: string;
  userId: string;
  electionId: string;
  candidateId: string;
  timestamp: string;
}
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  savedCountries: string[];
  isAdmin: boolean;
}
export interface Comment {
  id: string;
  electionId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  likedBy: string[];
  reactions: Record<string, string[]>;
  replies: Comment[];
  flagged: boolean;
  approved: boolean;
}
export interface News {
  id: string;
  countryId: string;
  electionId?: string;
  title: string;
  content: string; // Now supports HTML
  image?: string;
  tags: string[];
  hashtags: string[]; // New field for hashtags
  priority: 'breaking' | 'important' | 'general';
  timestamp: string;
}
export interface VoteStats {
  candidateId: string;
  candidateName: string;
  votes: number;
  percentage: number;
  color: string;
}

// Chat Types
export type ChatRoomType = 'country' | 'election' | 'candidate';
export interface ChatRoom {
  id: string;
  type: ChatRoomType;
  entityId: string;
  name: string;
  description: string;
  moderators: string[];
  pinnedMessages: string[];
  createdAt: string;
  activeUsers: number;
}
export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  reactions: Record<string, string[]>;
  flagged: boolean;
  deleted: boolean;
  isPinned: boolean;
}
export interface ChatUser {
  userId: string;
  userName: string;
  activeRooms: string[];
  badges: string[];
  isModerator: boolean;
  isBanned: boolean;
  lastSeen: string;
}
export interface ChatAnalytics {
  roomId: string;
  messageCount: number;
  activeUsers: number;
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  peakHours: Record<string, number>;
}