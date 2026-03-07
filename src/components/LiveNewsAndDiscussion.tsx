import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Avatar } from './ui/Avatar';
import { News, Comment, Election } from '../utils/types';
import { newsService } from '../services/newsService';
import { commentService } from '../services/commentService';
import { formatDistanceToNow } from 'date-fns';
import {
  NewspaperIcon,
  MessageCircleIcon,
  ChevronRightIcon,
  RadioIcon,
} from 'lucide-react';

const NEWS_LIMIT = 4;
const COMMENTS_LIMIT = 5;

const priorityConfig = {
  breaking: { variant: 'danger' as const, label: 'Breaking' },
  important: { variant: 'warning' as const, label: 'Important' },
  general: { variant: 'info' as const, label: 'News' },
};

interface LiveNewsAndDiscussionProps {
  elections: Election[];
  countries: { id: string; name: string; flag: string }[];
}

export function LiveNewsAndDiscussion({
  elections,
  countries,
}: LiveNewsAndDiscussionProps) {
  const navigate = useNavigate();
  const [news, setNews] = useState<News[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsElectionId, setCommentsElectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [newsData] = await Promise.all([
          newsService.getAll().catch(() => []),
        ]);
        const sorted = (newsData || [])
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, NEWS_LIMIT);
        setNews(sorted);

        const election = elections.find((e) => e.status === 'upcoming') || elections[0];
        if (election) {
          const commentsData = await commentService.getByElection(election.id, false).catch(() => []);
          setComments((commentsData || []).slice(0, COMMENTS_LIMIT));
          setCommentsElectionId(election.id);
        } else {
          setComments([]);
          setCommentsElectionId(null);
        }
      } catch {
        setNews([]);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [elections]);

  const countryId = commentsElectionId
    ? elections.find((e) => e.id === commentsElectionId)?.countryId
    : null;
  const discussionLabel = countryId
    ? `Discussion · ${countries.find((c) => c.id === countryId)?.name || 'Election'}`
    : 'Recent discussion';

  if (loading && news.length === 0 && comments.length === 0) {
    return (
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-8 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-8 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8 sm:py-10">
      <div className="flex items-center gap-2 mb-6">
        <span className="flex items-center gap-2 rounded-full bg-african-red/10 text-african-red px-3 py-1 text-xs font-semibold uppercase tracking-wide">
          <RadioIcon className="w-3.5 h-3.5 animate-pulse" />
          Live
        </span>
        <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-900">
          News & discussion
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Latest news */}
        <Card className="p-5 sm:p-6 border border-gray-200/80 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <NewspaperIcon className="w-5 h-5 text-african-blue" />
              Latest news
            </h3>
          </div>
          {news.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No news yet. Check back soon.</p>
          ) : (
            <ul className="space-y-3">
              {news.map((item) => {
                const config = priorityConfig[item.priority];
                return (
                  <li
                    key={item.id}
                    className="group flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-xl hover:bg-gray-50/80 transition-colors -mx-1"
                  >
                    <Badge variant={config.variant} className="w-fit text-xs shrink-0">
                      {config.label}
                    </Badge>
                    <span className="text-gray-900 font-medium text-sm sm:text-base line-clamp-2 group-hover:text-african-green transition-colors flex-1 min-w-0">
                      {item.title}
                    </span>
                    <span className="text-gray-400 text-xs shrink-0">
                      {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          {countryId && (
            <Button
              variant="secondary"
              size="sm"
              className="mt-4 w-full sm:w-auto shrink-0"
              onClick={() => navigate(`/election/${countryId}`)}
            >
              See more news
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Button>
          )}
        </Card>

        {/* Recent discussion */}
        <Card className="p-5 sm:p-6 border border-gray-200/80 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MessageCircleIcon className="w-5 h-5 text-amber-600" />
              {discussionLabel}
            </h3>
          </div>
          {comments.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 flex-1">
              No comments yet. Be the first to join the conversation.
            </p>
          ) : (
            <ul className="space-y-3 flex-1 min-h-0">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="flex gap-3 p-3 rounded-xl hover:bg-gray-50/80 transition-colors -mx-1"
                >
                  <Avatar
                    src={c.userAvatar}
                    name={c.userName}
                    size="sm"
                    className="shrink-0"
                  />
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
          {countryId && (
            <Button
              variant="secondary"
              size="sm"
              className="mt-4 w-full sm:w-auto shrink-0"
              onClick={() => navigate(`/election/${countryId}`)}
            >
              Join the conversation
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Button>
          )}
        </Card>
      </div>
    </section>
  );
}
