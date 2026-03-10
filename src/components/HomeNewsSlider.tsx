import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { News } from '../utils/types';
import { newsService } from '../services/newsService';
import { NewspaperIcon, ChevronRightIcon, FlameIcon, AlertCircleIcon, GlobeIcon, ChevronLeftIcon } from 'lucide-react';

const FEEDS = [
  { priority: 'breaking' as const, label: 'Breaking', icon: FlameIcon, badgeVariant: 'danger' as const },
  { priority: 'important' as const, label: 'Important', icon: AlertCircleIcon, badgeVariant: 'warning' as const },
  { priority: 'general' as const, label: 'General', icon: GlobeIcon, badgeVariant: 'info' as const },
];

function excerpt(text: string, max = 80): string {
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

function getFeedConfig(priority: News['priority']) {
  return FEEDS.find((f) => f.priority === priority) ?? FEEDS[2];
}

const CARD_WIDTH_MOBILE = 280;
const AUTO_SLIDE_MS = 5000;

interface HomeNewsSliderProps {
  countryId: string | null;
}

export function HomeNewsSlider({ countryId }: HomeNewsSliderProps) {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [allNews, setAllNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<News | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    newsService
      .getAll(countryId ? { countryId } : undefined)
      .then((data) => {
        const sorted = (data || []).sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setAllNews(sorted);
      })
      .catch(() => setAllNews([]))
      .finally(() => setLoading(false));
  }, [countryId]);

  // Auto-slide to next card
  useEffect(() => {
    if (allNews.length <= 1) return;
    autoSlideRef.current = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % allNews.length);
    }, AUTO_SLIDE_MS);
    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, [allNews.length]);

  // Scroll to current index when it changes (e.g. from auto-slide)
  useEffect(() => {
    if (!scrollRef.current || allNews.length === 0) return;
    const el = scrollRef.current;
    const cardWidth = Math.min(CARD_WIDTH_MOBILE + 16, el.clientWidth * 0.85);
    el.scrollTo({ left: currentIndex * cardWidth, behavior: 'smooth' });
  }, [currentIndex, allNews.length]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const cardWidth = Math.min(CARD_WIDTH_MOBILE + 16, el.clientWidth * 0.85);
    const index = Math.round(el.scrollLeft / cardWidth);
    setCurrentIndex(Math.min(index, allNews.length - 1));
    // Reset auto-slide timer on user scroll
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
      autoSlideRef.current = setInterval(() => {
        setCurrentIndex((i) => (i + 1) % allNews.length);
      }, AUTO_SLIDE_MS);
    }
  };

  function handleArticleClick(item: News) {
    if (countryId) {
      navigate(`/election/${countryId}#news`);
    } else {
      setSelectedArticle(item);
    }
  }

  const goToSlide = (index: number) => {
    const i = Math.max(0, Math.min(index, allNews.length - 1));
    setCurrentIndex(i);
    scrollRef.current?.scrollTo({ left: i * (CARD_WIDTH_MOBILE + 16), behavior: 'smooth' });
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8 sm:py-10">
      <div className="flex items-center justify-between gap-4 mb-4">
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

      {/* Sliding row: horizontal scroll, touch-friendly, scroll-snap */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[280px] rounded-xl bg-gray-100 animate-pulse h-32"
                style={{ scrollSnapAlign: 'start' }}
              />
            ))}
          </div>
        ) : allNews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
            <NewspaperIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No news yet. Check back soon.</p>
          </div>
        ) : (
          <>
            {/* Optional nav arrows for desktop */}
            {allNews.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous news"
                  onClick={() => goToSlide(currentIndex - 1)}
                  className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/90 shadow-md border border-gray-200 text-gray-600 hover:bg-white hover:text-african-green transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next news"
                  onClick={() => goToSlide(currentIndex + 1)}
                  className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/90 shadow-md border border-gray-200 text-gray-600 hover:bg-white hover:text-african-green transition-colors"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </>
            )}

            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex gap-4 overflow-x-auto overflow-y-hidden pb-2 snap-x snap-mandatory scroll-smooth touch-pan-x scrollbar-hide"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {allNews.map((item, idx) => {
                const feed = getFeedConfig(item.priority);
                const Icon = feed.icon;
                return (
                  <Card
                    key={item.id}
                    onClick={() => handleArticleClick(item)}
                    className="flex-shrink-0 w-[280px] sm:w-[300px] snap-start cursor-pointer hover:shadow-lg transition-shadow border border-gray-100"
                  >
                    <div className="flex gap-3 p-4">
                      <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Icon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Badge variant={feed.badgeVariant} className="text-xs mb-1">
                          {feed.label}
                        </Badge>
                        <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {excerpt(item.content)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{timeAgo(item.timestamp)}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Dots indicator for mobile */}
            {allNews.length > 1 && allNews.length <= 10 && (
              <div className="flex justify-center gap-1.5 mt-4 sm:mt-3">
                {allNews.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Go to slide ${idx + 1}`}
                    onClick={() => goToSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentIndex ? 'bg-african-green scale-125' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Article detail modal (when no countryId) */}
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
              variant={getFeedConfig(selectedArticle.priority).badgeVariant}
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
              className="mt-4 text-sm text-african-green font-medium hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
