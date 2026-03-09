import React, { useEffect, useState, useCallback } from 'react';
import { News } from '../utils/types';
import { newsService } from '../services/newsService';
import { FlameIcon, ChevronLeftIcon, ChevronRightIcon, XIcon } from 'lucide-react';

interface NewsTickerProps {
  /** Optional override: pass news directly (e.g. from ElectionDashboard which already has them).
   *  If omitted the ticker fetches its own breaking news so it always stays synced. */
  news?: News[];
  onArticleClick?: (item: News) => void;
}

export function NewsTicker({ news: newsProp, onArticleClick }: NewsTickerProps) {
  const [allNews, setAllNews] = useState<News[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  // Fetch own breaking news if none supplied
  useEffect(() => {
    if (newsProp) {
      setAllNews(newsProp.filter((n) => n.priority === 'breaking'));
      return;
    }
    newsService
      .getAll({ priority: 'breaking' })
      .then((data) => {
        const sorted = (data || []).sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setAllNews(sorted);
      })
      .catch(() => setAllNews([]));
  }, [newsProp]);

  const goTo = useCallback(
    (index: number) => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex(index);
        setVisible(true);
      }, 250);
    },
    []
  );

  const next = useCallback(() => {
    goTo((currentIndex + 1) % allNews.length);
  }, [currentIndex, allNews.length, goTo]);

  const prev = useCallback(() => {
    goTo((currentIndex - 1 + allNews.length) % allNews.length);
  }, [currentIndex, allNews.length, goTo]);

  // Auto-advance every 6 seconds
  useEffect(() => {
    if (allNews.length <= 1) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [allNews.length, next]);

  if (allNews.length === 0 || dismissed) return null;

  const current = allNews[currentIndex];

  return (
    <div
      role="marquee"
      aria-live="polite"
      aria-label="Breaking news"
      className="relative bg-gradient-to-r from-red-600 to-rose-600 text-white"
    >
      {/* Main bar */}
      <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2.5 sm:py-3 min-h-[44px]">

        {/* Label badge — compact on mobile */}
        <div className="flex items-center gap-1.5 flex-shrink-0 bg-white/20 rounded-full px-2.5 py-1 sm:px-3">
          <FlameIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" aria-hidden />
          <span className="font-black text-[10px] sm:text-xs uppercase tracking-widest whitespace-nowrap">
            Breaking
          </span>
          {allNews.length > 1 && (
            <span className="hidden sm:inline text-white/70 text-xs font-normal">
              {currentIndex + 1}/{allNews.length}
            </span>
          )}
        </div>

        {/* Headline — clickable, fades between items */}
        <button
          className={`flex-1 min-w-0 text-left transition-opacity duration-250 ${
            visible ? 'opacity-100' : 'opacity-0'
          } ${onArticleClick ? 'cursor-pointer hover:underline' : 'cursor-default'}`}
          onClick={() => onArticleClick && onArticleClick(current)}
          disabled={!onArticleClick}
          aria-label={current?.title}
        >
          <p className="text-xs sm:text-sm font-semibold truncate leading-tight">
            {current?.title}
          </p>
          {current?.content && (
            <p className="hidden sm:block text-white/75 text-xs mt-0.5 truncate">
              {current.content.replace(/<[^>]+>/g, '').slice(0, 100)}
            </p>
          )}
        </button>

        {/* Nav controls — only shown when multiple items */}
        {allNews.length > 1 && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={prev}
              className="p-1.5 rounded-full bg-white/15 hover:bg-white/30 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
              aria-label="Previous breaking news"
            >
              <ChevronLeftIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={next}
              className="p-1.5 rounded-full bg-white/15 hover:bg-white/30 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
              aria-label="Next breaking news"
            >
              <ChevronRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        )}

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-full bg-white/15 hover:bg-white/30 transition-colors flex-shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center"
          aria-label="Dismiss breaking news"
        >
          <XIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Dot strip below (mobile-friendly larger tap targets) */}
      {allNews.length > 1 && (
        <div className="flex justify-center gap-2 pb-2 px-4" aria-label="Breaking news items">
          {allNews.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Breaking news ${i + 1}`}
              aria-current={i === currentIndex ? 'true' : undefined}
              className={`rounded-full transition-all min-w-[28px] min-h-[14px] p-1 -m-1 flex items-center justify-center`}
            >
              <span
                className={`block rounded-full transition-all ${
                  i === currentIndex
                    ? 'w-5 h-1.5 bg-white'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            </button>
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-white/30 w-full">
        <div
          key={currentIndex}
          className="h-full bg-white origin-left"
          style={{ animation: 'ticker-progress 6s linear forwards' }}
        />
      </div>

      <style>{`
        @keyframes ticker-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
