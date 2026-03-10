import React, { useState } from 'react';
import { CommentForm } from './CommentForm';
import { Comment } from '../utils/types';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircleIcon, ThumbsUpIcon } from 'lucide-react';

interface CommentItemNairalandProps {
  comment: Comment;
  onLike: (commentId: string) => void;
  onReact: (commentId: string, emoji: string) => void;
  onReply: (commentId: string, content: string) => void;
  userId: string;
  depth?: number;
}

export function CommentItemNairaland({
  comment,
  onLike,
  onReact,
  onReply,
  userId,
  depth = 0,
}: CommentItemNairalandProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const hasLiked = comment.likedBy.includes(userId);
  const replyCount = comment.replies.length;

  const handleReply = (content: string) => {
    onReply(comment.id, content);
    setShowReplyForm(false);
  };

  return (
    <div
      className={`${depth > 0 ? 'ml-6 sm:ml-8 mt-3 pl-4 border-l-2 border-gray-200' : ''}`}
      style={{ animationDelay: `${depth * 30}ms` }}
    >
      {/* Forum post row: user + content */}
      <div className="py-3 border-b border-gray-100 last:border-b-0">
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
            {comment.userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-2 mb-1">
              <span className="font-bold text-gray-900">{comment.userName}</span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
              </span>
            </div>
            <p className="text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
            {/* Actions: Like, Reply (Nairaland-style text links) */}
            <div className="flex items-center gap-4 mt-2 text-xs">
              <button
                onClick={() => onLike(comment.id)}
                className={`flex items-center gap-1 font-medium ${hasLiked ? 'text-african-green' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <ThumbsUpIcon className="w-3.5 h-3.5" />
                {comment.likes > 0 && <span>{comment.likes}</span>}
              </button>
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 text-gray-500 hover:text-african-green font-medium"
              >
                <MessageCircleIcon className="w-3.5 h-3.5" />
                Reply
                {replyCount > 0 && <span>({replyCount})</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showReplyForm && (
        <div className="mt-3 ml-12">
          <CommentForm onSubmit={handleReply} placeholder="Write your reply..." buttonText="Reply" />
        </div>
      )}

      {replyCount > 0 && (
        <div className="mt-1">
          {showReplies &&
            comment.replies.map((reply) => (
              <CommentItemNairaland
                key={reply.id}
                comment={reply}
                onLike={onLike}
                onReact={onReact}
                onReply={onReply}
                userId={userId}
                depth={depth + 1}
              />
            ))}
        </div>
      )}
    </div>
  );
}
