import { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Badge } from './ui/Badge';
import { News, Comment } from '../utils/types';
import { formatDistanceToNow } from 'date-fns';
import { TrendingUpIcon, AlertCircleIcon, NewspaperIcon, HashIcon, XIcon, Share2Icon, MessageSquareIcon } from 'lucide-react';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';
import { ShareButton } from './ShareButton';
import { useAuth } from '../context/AuthContext';
import { commentService } from '../services/commentService';

interface NewsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  news: News | null;
}

export function NewsDetailModal({ isOpen, onClose, news }: NewsDetailModalProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (isOpen && news) {
      loadComments();
    }
  }, [isOpen, news]);

  const loadComments = async () => {
    if (!news) return;
    try {
      setLoadingComments(true);
      const commentsData = await commentService.getByNews(news.id, true);
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (content: string) => {
    if (!user || !news) return;
    try {
      await commentService.create({
        newsId: news.id,
        content,
      });
      await loadComments();
    } catch (error: any) {
      console.error('Failed to add comment:', error);
      alert(error.message || 'Failed to add comment');
    }
  };

  const handleReply = async (commentId: string, content: string) => {
    if (!user || !news) return;
    try {
      await commentService.create({
        newsId: news.id,
        parentCommentId: commentId,
        content,
      });
      await loadComments();
    } catch (error: any) {
      console.error('Failed to add reply:', error);
      alert(error.message || 'Failed to add reply');
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      alert('Please log in to like comments');
      return;
    }
    try {
      await commentService.like(commentId);
      await loadComments();
    } catch (error: any) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleReactToComment = async (commentId: string, emoji: string) => {
    if (!user) {
      alert('Please log in to react to comments');
      return;
    }
    try {
      await commentService.addReaction(commentId, { emoji });
      await loadComments();
    } catch (error: any) {
      console.error('Failed to react to comment:', error);
    }
  };

  if (!news) return null;

  const priorityConfig = {
    breaking: {
      icon: <AlertCircleIcon className="w-5 h-5" />,
      variant: 'danger' as const,
      label: 'BREAKING'
    },
    important: {
      icon: <TrendingUpIcon className="w-5 h-5" />,
      variant: 'warning' as const,
      label: 'IMPORTANT'
    },
    general: {
      icon: <NewspaperIcon className="w-5 h-5" />,
      variant: 'info' as const,
      label: 'NEWS'
    }
  };

  const config = priorityConfig[news.priority];

  const handleShare = async () => {
    const shareText = news.content.replace(/<[^>]*>/g, '').substring(0, 200);
    const shareUrl = `${window.location.origin}/election/${news.countryId}?news=${news.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: news.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err: any) {
        // User cancelled or error occurred
        if (err.name !== 'AbortError') {
          // Fallback: copy to clipboard
          try {
            await navigator.clipboard.writeText(shareUrl);
            alert('Link copied to clipboard!');
          } catch {
            alert('Unable to share. Please copy the link manually.');
          }
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      } catch {
        // Final fallback: show URL
        prompt('Copy this link:', shareUrl);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="xl" className="max-w-4xl">
      <div className="relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          aria-label="Close"
        >
          <XIcon className="w-5 h-5 text-gray-600" />
        </button>

        {/* Featured Image */}
        {news.image && (
          <div className="relative h-64 md:h-80 mb-6 rounded-xl overflow-hidden">
            <img
              src={news.image}
              alt={news.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <Badge variant={config.variant} className="flex items-center gap-2 text-sm px-3 py-1.5">
                {config.icon}
                {config.label}
              </Badge>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          {!news.image && (
            <Badge variant={config.variant} className="flex items-center gap-2 w-fit mb-4">
              {config.icon}
              {config.label}
            </Badge>
          )}

          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4 leading-tight">
            {news.title}
          </h1>

          <div className="flex items-center justify-between flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>
                {formatDistanceToNow(new Date(news.timestamp), { addSuffix: true })}
              </span>
              {news.tags && news.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">•</span>
                  <div className="flex gap-2 flex-wrap">
                    {news.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-african-green text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                <Share2Icon className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          className="prose prose-lg max-w-none mb-6 text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />

        {/* Hashtags */}
        {news.hashtags && news.hashtags.length > 0 && (
          <div className="flex items-center gap-3 pt-6 mt-6 border-t border-gray-200">
            <HashIcon className="w-5 h-5 text-african-blue flex-shrink-0" />
            <div className="flex gap-3 flex-wrap">
              {news.hashtags.map(hashtag => (
                <span
                  key={hashtag}
                  className="text-african-blue font-medium hover:text-emerald-600 transition-colors cursor-pointer"
                >
                  #{hashtag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Share on Social Media */}
        <div className="pt-6 mt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Share on Social Media
          </h3>
          <ShareButton
            text={`${news.title} - ${news.content.replace(/<[^>]*>/g, '').substring(0, 100)}...`}
            url={`${window.location.origin}/election/${news.countryId}?news=${news.id}`}
          />
        </div>

        {/* Comments Section */}
        <div className="pt-6 mt-6 border-t border-gray-200">
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-african-green transition-colors mb-4"
          >
            <MessageSquareIcon className="w-5 h-5" />
            Comments ({comments.length})
          </button>

          {showComments && (
            <div className="space-y-6">
              {user ? (
                <CommentForm onSubmit={handleAddComment} />
              ) : (
                <p className="text-gray-600 text-sm">Please log in to comment.</p>
              )}

              {loadingComments ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading comments...</p>
                </div>
              ) : comments.length === 0 ? (
                <p className="text-gray-600 text-sm">No comments yet. Be the first to comment!</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      onLike={handleLikeComment}
                      onReact={handleReactToComment}
                      onReply={handleReply}
                      userId={user?.id || ''}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Styles for prose content */}
        <style>{`
          .prose h1, .prose h2, .prose h3 {
            font-weight: 700;
            color: #111827;
            margin-top: 1.5em;
            margin-bottom: 0.75em;
          }
          .prose h1 { font-size: 2em; }
          .prose h2 { font-size: 1.5em; }
          .prose h3 { font-size: 1.25em; }
          .prose p {
            margin-bottom: 1.25em;
            line-height: 1.75;
          }
          .prose a {
            color: #10B981;
            text-decoration: underline;
            font-weight: 500;
          }
          .prose a:hover {
            color: #059669;
          }
          .prose strong {
            font-weight: 600;
            color: #111827;
          }
          .prose ul, .prose ol {
            margin-left: 1.5rem;
            margin-bottom: 1.25em;
          }
          .prose ul {
            list-style: disc;
          }
          .prose ol {
            list-style: decimal;
          }
          .prose li {
            margin-bottom: 0.5em;
          }
          .prose img {
            border-radius: 0.5rem;
            margin: 1.5em 0;
            max-width: 100%;
            height: auto;
          }
          .prose blockquote {
            border-left: 4px solid #10B981;
            padding-left: 1em;
            margin: 1.5em 0;
            font-style: italic;
            color: #6B7280;
          }
          .prose code {
            background-color: #F3F4F6;
            padding: 0.2em 0.4em;
            border-radius: 0.25rem;
            font-size: 0.9em;
            color: #111827;
          }
          .prose pre {
            background-color: #1F2937;
            color: #F9FAFB;
            padding: 1em;
            border-radius: 0.5rem;
            overflow-x: auto;
            margin: 1.5em 0;
          }
          .prose pre code {
            background-color: transparent;
            padding: 0;
            color: inherit;
          }
        `}</style>
      </div>
    </Modal>
  );
}

