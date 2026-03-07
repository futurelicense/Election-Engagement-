import { ChatMessage } from './types';

// Harmful content keywords (basic filtering)
const HARMFUL_KEYWORDS = ['spam', 'scam', 'hate', 'violence', 'abuse'
// Add more keywords as needed
];

// Sentiment keywords
const POSITIVE_KEYWORDS = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'best', 'happy', 'support', 'hope', 'peace', 'unity', 'progress', 'change'];
const NEGATIVE_KEYWORDS = ['bad', 'terrible', 'awful', 'worst', 'hate', 'angry', 'sad', 'corrupt', 'fraud', 'rigged', 'unfair', 'disappointed'];
export const chatHelpers = {
  // Auto-filter harmful content
  containsHarmfulContent: (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    return HARMFUL_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
  },
  // Analyze sentiment
  analyzeSentiment: (message: string): 'positive' | 'negative' | 'neutral' => {
    const lowerMessage = message.toLowerCase();
    const positiveCount = POSITIVE_KEYWORDS.filter(keyword => lowerMessage.includes(keyword)).length;
    const negativeCount = NEGATIVE_KEYWORDS.filter(keyword => lowerMessage.includes(keyword)).length;
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  },
  // Calculate room sentiment
  calculateRoomSentiment: (messages: ChatMessage[]): {
    positive: number;
    negative: number;
    neutral: number;
  } => {
    const sentiments = messages.map(m => chatHelpers.analyzeSentiment(m.content));
    return {
      positive: sentiments.filter(s => s === 'positive').length,
      negative: sentiments.filter(s => s === 'negative').length,
      neutral: sentiments.filter(s => s === 'neutral').length
    };
  },
  // Format timestamp
  formatMessageTime: (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  },
  // Generate room ID
  generateRoomId: (type: string, entityId: string): string => {
    return `${type}_${entityId}`;
  }
};