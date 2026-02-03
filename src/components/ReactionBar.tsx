import React from 'react';
import { EmojiPicker } from './EmojiPicker';
import { ThumbsUpIcon, MessageCircleIcon } from 'lucide-react';
interface ReactionBarProps {
  likes: number;
  reactions: Record<string, string[]>;
  replyCount: number;
  onLike: () => void;
  onReact: (emoji: string) => void;
  onReply: () => void;
  hasLiked: boolean;
  userReactions: string[];
}
export function ReactionBar({
  likes,
  reactions,
  replyCount,
  onLike,
  onReact,
  onReply,
  hasLiked,
  userReactions
}: ReactionBarProps) {
  const topReactions = Object.entries(reactions).map(([emoji, users]) => ({
    emoji,
    count: users.length
  })).sort((a, b) => b.count - a.count).slice(0, 3);
  return <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
      <button onClick={onLike} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${hasLiked ? 'bg-african-green/10 text-african-green' : 'hover:bg-gray-100 text-gray-600'}`}>
        <ThumbsUpIcon className="w-4 h-4" />
        <span className="text-sm font-medium">{likes}</span>
      </button>

      <div className="flex items-center gap-1">
        {topReactions.map(({
        emoji,
        count
      }) => <button key={emoji} onClick={() => onReact(emoji)} className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
            <span className="text-lg">{emoji}</span>
            <span className="text-xs text-gray-600">{count}</span>
          </button>)}
        <EmojiPicker onSelect={onReact} selectedEmojis={userReactions} />
      </div>

      <button onClick={onReply} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors ml-auto">
        <MessageCircleIcon className="w-4 h-4" />
        <span className="text-sm font-medium">{replyCount}</span>
      </button>
    </div>;
}