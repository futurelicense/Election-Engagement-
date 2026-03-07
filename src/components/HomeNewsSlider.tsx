import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { News } from '../utils/types';
import { newsService } from '../services/newsService';
import { NewspaperIcon, ChevronRightIcon, FlameIcon, AlertCircleIcon, GlobeIcon } from 'lucide-react';

const FEED_LIMIT = 5; // articles per feed

const FEEDS = [
  {
    priority: 'breaking' as const,
    label: 'Breaking',
    icon: FlameIcon,
    badgeVariant: 'danger' as const,
    accentClass: 'text-red-600',
    headerBg: 'bg-red-50 border-red-100',
    dotColor: 'bg-red-500',
  },
  {
    priority: 'important' as const,
    label: 'Important',
    icon: AlertCircleIcon,
    badgeVariant: 'warning' as const,
    accentClass: 'text-amber-600',
    headerBg: 'bg-amber-50 border-amber-100',
    dotColor: 'bg-amber-500',
  },
  {
    priority: 'general' as const,
    label: 'General',
    icon: GlobeIcon,
    badgeVariant: 'info' as const,
    accentClass: 'text-african-blue',
    headerBg: 'bg-blue-50 border-blue-100',
    dotColor: 'bg-african-blue',
  },
];

function excerpt(text: string, max = 110): string {
  const plain = text.replace(/<[^>]+>/g, '').trim();
  return plain.length <= max ? plain : plain.slice(0, max).trimEnd() + '…';
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface FeedColumnProps {
  feed: typeof FEEDS[number];
  countryId: string | null;
  onArticleClick: (item: News) => void;
}

function FeedColumn({ feed, countryId, onArticleClick }: FeedColumnProps) {
  const [articles, setArticles] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    newsService
      .getAll({ priority: feed.priority })
      .then((data) => {
        const sorted = (data || [])
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, FEED_LIMIT);
        setArticles(sorted);
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [feed.priority]);

  const Icon = feed.icon;

  return (
    <div className="flex flex-col min-w-0">
      {/* Column header */}
      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border mb-3 ${feed.headerBg}`}>
        <span className={`w-2 h-2 rounded-full ${feed.dotColor} ${feed.priority === 'breaking' ? 'animate-pulse' : ''}`} />
        <Icon className={`w-4 h-4 ${feed.accentClass}`} />
        <span className={`text-sm font-bold ${feed.accentClass}`}>{feed.label}</span>
        {!loading && (
          <span className="ml-auto text-xs text-gray-400">{articles.length} articles</span>
        )}
      </div>

      {/* Articles */}
      <div className="flex flex-col gap-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-gray-100 animate-pulse h-24" />
          ))
        ) : articles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center">
            <NewspaperIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No {feed.label.toLowerCase()} news yet</p>
          </div>
        ) : (
          articles.map((item, idx) => (
            <Card
              key={item.id}
              onClick={() => onArticleClick(item)}
              className={`flex gap-3 p-3 cursor-pointer hover:shadow-md transition-shadow border border-gray-100 ${
                idx === 0 && feed.priority === 'breaking' ? 'ring-1 ring-red-200' : ''
              }`}
            >
              {/* Thumbnail or placeholder */}
              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {item.image ? (
                  <img src={item.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <NewspaperIcon className="w-6 h-6 text-gray-300" />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                {idx === 0 && (
                  <Badge variant={feed.badgeVariant} className="text-xs mb-1">
                    {feed.label}
                  </Badge>
                )}
                <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {excerpt(item.content)}
                </p>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(item.timestamp)}</p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

interface HomeNewsSliderProps {
  countryId: string | null;
}

export function HomeNewsSlider({ countryId }: HomeNewsSliderProps) {
  const navigate = useNavigate();
  const [selectedArticle, setSelectedArticle] = useState<News | null>(null);

  function handleArticleClick(item: News) {
    if (countryId) {
      navigate(`/election/${countryId}#news`);
    } else {
      setSelectedArticle(item);
    }
  }

  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8 sm:py-10">
      {/* Section header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-900 flex items-center gap-2">
          <NewspaperIcon className="w-6 h-6 text-african-blue" />
          Latest News
        </h2>
        {countryId && (
          <button
            onClick={() => navigate(`/election/${countryId}#news`)}
            className="flex items-center gap-1 text-sm font-medium text-african-green hover:text-emerald-700 transition-colors"
          >
            See all
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Three-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEEDS.map((feed) => (
          <FeedColumn
            key={feed.priority}
            feed={feed}
            countryId={countryId}
            onArticleClick={handleArticleClick}
          />
        ))}
      </div>

      {/* Inline article preview (when no countryId to navigate to) */}
      {selectedArticle && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="glass max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto rounded-2xl shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <Badge
              variant={FEEDS.find((f) => f.priority === selectedArticle.priority)?.badgeVariant ?? 'info'}
              className="mb-3"
            >
              {selectedArticle.priority}
            </Badge>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{selectedArticle.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{timeAgo(selectedArticle.timestamp)}</p>
            {selectedArticle.image && (
              <img
                src={selectedArticle.image}
                alt=""
                className="w-full rounded-xl mb-4 object-cover max-h-48"
              />
            )}
            <p className="text-sm text-gray-700 leading-relaxed">
              {selectedArticle.content.replace(/<[^>]+>/g, '')}
            </p>
            <button
              onClick={() => setSelectedArticle(null)}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
