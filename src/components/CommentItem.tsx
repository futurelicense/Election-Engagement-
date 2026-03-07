import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Avatar } from './ui/Avatar';
import { ReactionBar } from './ReactionBar';
import { CommentForm } from './CommentForm';
import { Comment } from '../utils/types';
import { formatDistanceToNow } from 'date-fns';
interface CommentItemProps {
  comment: Comment;
  onLike: (commentId: string) => void;
  onReact: (commentId: string, emoji: string) => void;
  onReply: (commentId: string, content: string) => void;
  userId: string;
  depth?: number;
}
export function CommentItem({
  comment,
  onLike,
  onReact,
  onReply,
  userId,
  depth = 0
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const hasLiked = comment.likedBy.includes(userId);
  const userReactions = Object.entries(comment.reactions).filter(([_, users]) => users.includes(userId)).map(([emoji]) => emoji);
  const handleReply = (content: string) => {
    onReply(comment.id, content);
    setShowReplyForm(false);
  };
  return <div className={`${depth > 0 ? 'ml-12 mt-4' : ''} animate-slide-up`} style={{
    animationDelay: `${depth * 50}ms`
  }}>
      <Card className="p-4" glass={depth === 0}>
        <div className="flex gap-3">
          <Avatar src={comment.userAvatar} alt={comment.userName} fallback={comment.userName.charAt(0)} size="md" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900">
                {comment.userName}
              </span>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(comment.timestamp), {
                addSuffix: true
              })}
              </span>
            </div>

            <p className="text-gray-700 mb-3 whitespace-pre-wrap">
              {comment.content}
            </p>

            <ReactionBar likes={comment.likes} reactions={comment.reactions} replyCount={comment.replies.length} onLike={() => onLike(comment.id)} onReact={emoji => onReact(comment.id, emoji)} onReply={() => setShowReplyForm(!showReplyForm)} hasLiked={hasLiked} userReactions={userReactions} />
          </div>
        </div>
      </Card>

      {showReplyForm && <div className="ml-12 mt-4">
          <CommentForm onSubmit={handleReply} placeholder="Write a reply..." buttonText="Reply" />
        </div>}

      {comment.replies.length > 0 && <div className="mt-4">
          {showReplies && <>
              {comment.replies.map(reply => <CommentItem key={reply.id} comment={reply} onLike={onLike} onReact={onReact} onReply={onReply} userId={userId} depth={depth + 1} />)}
            </>}
        </div>}
    </div>;
}