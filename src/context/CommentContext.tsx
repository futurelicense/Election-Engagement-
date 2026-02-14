import React, { useState, useEffect, createContext, useContext } from 'react';
import { Comment } from '../utils/types';
import { commentService } from '../services/commentService';
import { useAuth } from './AuthContext';

interface CommentContextType {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  getComments: (electionId: string) => Promise<Comment[]>;
  addComment: (electionId: string, content: string, parentCommentId?: string) => Promise<void>;
  addReply: (commentId: string, content: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
  reactToComment: (commentId: string, emoji: string) => Promise<void>;
  refreshComments: (electionId: string) => Promise<void>;
}

const CommentContext = createContext<CommentContextType | undefined>(undefined);

export function CommentProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentElectionId, setCurrentElectionId] = useState<string | null>(null);

  const getComments = async (electionId: string): Promise<Comment[]> => {
    try {
      setLoading(true);
      setError(null);
      setCurrentElectionId(electionId);
      
      const commentsData = await commentService.getByElection(electionId, true);
      setComments(commentsData);
      return commentsData;
    } catch (err: any) {
      console.error('Failed to load comments:', err);
      setError(err.message || 'Failed to load comments');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (
    electionId: string,
    content: string,
    parentCommentId?: string
  ) => {
    if (!user) {
      throw new Error('You must be logged in to comment');
    }

    try {
      await commentService.create({
        electionId,
        content,
        parentCommentId,
      });
      
      // Refresh comments
      if (currentElectionId === electionId) {
        await getComments(electionId);
      }
    } catch (err: any) {
      console.error('Failed to add comment:', err);
      throw err;
    }
  };

  const addReply = async (commentId: string, content: string) => {
    if (!user || !currentElectionId) {
      throw new Error('You must be logged in to reply');
    }

    try {
      await commentService.create({
        electionId: currentElectionId,
        content,
        parentCommentId: commentId,
      });
      
      // Refresh comments
      await getComments(currentElectionId);
    } catch (err: any) {
      console.error('Failed to add reply:', err);
      throw err;
    }
  };

  const likeComment = async (commentId: string) => {
    if (!user) {
      throw new Error('You must be logged in to like comments');
    }

    try {
      await commentService.like(commentId);
      
      // Update local state
      const updateCommentLikes = (commentList: Comment[]): Comment[] => {
        return commentList.map(comment => {
          if (comment.id === commentId) {
            const isLiked = comment.likedBy.includes(user.id);
            return {
              ...comment,
              likes: isLiked ? comment.likes - 1 : comment.likes + 1,
              likedBy: isLiked
                ? comment.likedBy.filter(id => id !== user.id)
                : [...comment.likedBy, user.id],
            };
          }
          if (comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentLikes(comment.replies),
            };
          }
          return comment;
        });
      };
      
      setComments(prev => updateCommentLikes(prev));
    } catch (err: any) {
      console.error('Failed to like comment:', err);
      throw err;
    }
  };

  const reactToComment = async (commentId: string, emoji: string) => {
    if (!user) {
      throw new Error('You must be logged in to react');
    }

    try {
      await commentService.addReaction(commentId, { emoji });
      
      // Update local state
      const updateCommentReactions = (commentList: Comment[]): Comment[] => {
        return commentList.map(comment => {
          if (comment.id === commentId) {
            const reactions = { ...comment.reactions };
            if (!reactions[emoji]) {
              reactions[emoji] = [];
            }
            const userIndex = reactions[emoji].indexOf(user.id);
            if (userIndex > -1) {
              reactions[emoji].splice(userIndex, 1);
              if (reactions[emoji].length === 0) {
                delete reactions[emoji];
              }
            } else {
              reactions[emoji].push(user.id);
            }
            return { ...comment, reactions };
          }
          if (comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentReactions(comment.replies),
            };
          }
          return comment;
        });
      };
      
      setComments(prev => updateCommentReactions(prev));
    } catch (err: any) {
      console.error('Failed to react to comment:', err);
      throw err;
    }
  };

  const refreshComments = async (electionId: string) => {
    await getComments(electionId);
  };

  return (
    <CommentContext.Provider
      value={{
        comments,
        loading,
        error,
        getComments,
        addComment,
        addReply,
        likeComment,
        reactToComment,
        refreshComments,
      }}
    >
      {children}
    </CommentContext.Provider>
  );
}

export function useComments() {
  const context = useContext(CommentContext);
  if (!context) throw new Error('useComments must be used within CommentProvider');
  return context;
}
