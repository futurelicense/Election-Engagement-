import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { Avatar } from './ui/Avatar';
import { Comment, Election } from '../utils/types';
import { commentService } from '../services/commentService';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircleIcon, ChevronRightIcon, LogInIcon } from 'lucide-react';

const COMMENTS_LIMIT = 6;

interface HomeDiscussionProps {
  elections: Election[];
  countries: { id: string; name: string; flag: string }[];
}

export function HomeDiscussion({ elections, countries }: HomeDiscussionProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [electionId, setElectionId] = useState<string | null>(null);
  const [countryId, setCountryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const election = elections.find((e) => e.status === 'upcoming') || elections[0];
    if (!election) {
      setComments([]);
      setElectionId(null);
      setCountryId(null);
      setLoading(false);
      return;
    }
    setElectionId(election.id);
    setCountryId(election.countryId);
    commentService
      .getByElection(election.id, false)
      .then((data) => setComments((data || []).slice(0, COMMENTS_LIMIT)))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [elections]);

  const refreshComments = () => {
    if (!electionId) return;
    commentService
      .getByElection(electionId, false)
      .then((data) => setComments((data || []).slice(0, COMMENTS_LIMIT)))
      .catch(() => {});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !electionId || !user) return;
    setError(null);
    setPosting(true);
    try {
      await commentService.create({ electionId, content: content.trim() });
      setContent('');
      refreshComments();
    } catch (err: any) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const discussionLabel = countryId
    ? `Discussion · ${countries.find((c) => c.id === countryId)?.name || 'Election'}`
    : 'Recent discussion';

  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8 sm:py-10">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-900 flex items-center gap-2">
          <MessageCircleIcon className="w-6 h-6 text-amber-600" />
          {discussionLabel}
        </h2>
        {countryId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/election/${countryId}`)}
            className="shrink-0 text-african-green hover:text-emerald-700"
          >
            Join conversation
            <ChevronRightIcon className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Comment field: only for signed-in users */}
      <Card className="p-4 sm:p-5 border border-gray-200/80 mb-6">
        {isAuthenticated && user ? (
          <form onSubmit={handleSubmit}>
            <div className="flex gap-3">
              <div className="shrink-0">
                <Avatar
                  src={user.avatar}
                  alt={user.name || 'You'}
                  fallback={user.name?.charAt(0) || 'U'}
                  size="md"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts on the election..."
                  rows={3}
                  className="mb-3"
                  disabled={posting}
                />
                {error && (
                  <p className="text-sm text-red-600 mb-2">{error}</p>
                )}
                <div className="flex justify-end">
                  <Button type="submit" disabled={!content.trim() || posting} size="sm">
                    {posting ? 'Posting...' : 'Post comment'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-2">
            <p className="text-gray-600 text-sm flex-1">
              Sign in to join the discussion and post a comment.
            </p>
            <Link to="/login" className="inline-flex items-center gap-2 text-african-green font-medium hover:text-emerald-700 text-sm shrink-0">
              <LogInIcon className="w-4 h-4" />
              Sign in to comment
            </Link>
          </div>
        )}
      </Card>

      {/* Recent comments list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl bg-gray-50 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/4 bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-sm py-4">
          No comments yet. Be the first to join the conversation.
        </p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li
              key={c.id}
              className="flex gap-3 p-3 rounded-xl hover:bg-gray-50/80 transition-colors"
            >
              <div className="shrink-0">
              <Avatar
                src={c.userAvatar}
                alt={c.userName}
                fallback={c.userName?.charAt(0) || '?'}
                size="sm"
              />
            </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 font-medium">{c.userName}</p>
                <p className="text-sm text-gray-800 line-clamp-2 mt-0.5">
                  {c.content.replace(/<[^>]+>/g, '').trim()}
                </p>
                <span className="text-xs text-gray-400 mt-1 block">
                  {formatDistanceToNow(new Date(c.timestamp), { addSuffix: true })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
