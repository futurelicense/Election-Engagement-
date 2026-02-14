import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { News } from '../utils/types';
import { newsService } from '../services/newsService';
import { NewspaperIcon, ChevronRightIcon } from 'lucide-react';

const NEWS_LIMIT = 5;
const CARDS_VISIBLE = 4;
const CARD_GAP = 20;
const CARD_WIDTH = 260; // so 4 fit in viewport: 260*4 + 20*3 = 1100
const SLIDE_INTERVAL_MS = 5000;

const priorityConfig = {
  breaking: { variant: 'danger' as const, label: 'Breaking' },
  important: { variant: 'warning' as const, label: 'Important' },
  general: { variant: 'info' as const, label: 'News' },
};

function excerpt(html: string, maxLength = 120): string {
  const text = html.replace(/<[^>]+>/g, '').trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
}

interface HomeNewsSliderProps {
  countryId: string | null;
}

export function HomeNewsSlider({ countryId }: HomeNewsSliderProps) {
  const navigate = useNavigate();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    newsService
      .getAll()
      .then((data) => {
        const sorted = (data || [])
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, NEWS_LIMIT);
        setNews(sorted);
      })
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, []);

  const maxSlideIndex = Math.max(0, news.length - CARDS_VISIBLE);

  useEffect(() => {
    if (news.length <= CARDS_VISIBLE) return;
    const t = setInterval(() => {
      setSlideIndex((i) => (i >= maxSlideIndex ? 0 : i + 1));
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(t);
  }, [news.length, maxSlideIndex]);

  if (loading) {
    return (
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8 sm:py-10">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-900 mb-6 flex items-center gap-2">
          <NewspaperIcon className="w-6 h-6 text-african-blue" />
          Latest news
        </h2>
        <div
          className="flex gap-5 overflow-hidden mx-auto"
          style={{ maxWidth: CARDS_VISIBLE * CARD_WIDTH + (CARDS_VISIBLE - 1) * CARD_GAP }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100 animate-pulse"
              style={{ width: CARD_WIDTH }}
            >
              <div className="h-44 bg-gray-200" />
              <div className="h-36 bg-gray-50 p-4" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (news.length === 0) {
    return (
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8 sm:py-10">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-900 mb-6 flex items-center gap-2">
          <NewspaperIcon className="w-6 h-6 text-african-blue" />
          Latest news
        </h2>
        <p className="text-gray-500">No news yet. Check back soon.</p>
      </section>
    );
  }

  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8 sm:py-10">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-900 flex items-center gap-2">
          <NewspaperIcon className="w-6 h-6 text-african-blue" />
          Latest news
        </h2>
        {countryId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/election/${countryId}`)}
            className="shrink-0 text-african-green hover:text-emerald-700"
          >
            See more
            <ChevronRightIcon className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Thumbnail slider: show 4 cards, auto-advance */}
      <div
        className="overflow-hidden mx-auto"
        style={{ maxWidth: CARDS_VISIBLE * CARD_WIDTH + (CARDS_VISIBLE - 1) * CARD_GAP }}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            gap: CARD_GAP,
            transform: `translateX(-${slideIndex * (CARD_WIDTH + CARD_GAP)}px)`,
          }}
        >
          {news.map((item) => {
            const config = priorityConfig[item.priority];
            const goToNews = () => countryId && navigate(`/election/${countryId}`);
            return (
              <Card
                key={item.id}
                className="flex-shrink-0 overflow-hidden border border-gray-200/80 bg-white transition-shadow hover:shadow-xl cursor-pointer flex flex-col"
                style={{ width: CARD_WIDTH }}
                onClick={goToNews}
              >
                {/* Top: image */}
                {item.image ? (
                  <div className="relative h-44 overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    <Badge variant={config.variant} className="absolute top-3 left-3 text-xs">
                      {config.label}
                    </Badge>
                  </div>
                ) : (
                  <div className="relative h-44 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
                    <NewspaperIcon className="w-12 h-12 text-gray-300" />
                    <Badge variant={config.variant} className="absolute top-3 left-3 text-xs">
                      {config.label}
                    </Badge>
                  </div>
                )}
                {/* Bottom: content area (light background) */}
                <div className="flex-1 flex flex-col p-5 bg-stone-50/80">
                  <h3 className="font-bold text-gray-900 text-base line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                    {excerpt(item.content, 140)}
                  </p>
                  <div className="mt-4">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1d4ed8] transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToNews();
                      }}
                    >
                      Find out more
                      <ChevronRightIcon className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Dot indicators when we have more than 4 items */}
      {maxSlideIndex > 0 && (
        <div className="flex justify-center gap-2 mt-5" aria-label="Slider position">
          {Array.from({ length: maxSlideIndex + 1 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSlideIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === slideIndex
                  ? 'w-6 bg-african-blue'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === slideIndex ? 'true' : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
