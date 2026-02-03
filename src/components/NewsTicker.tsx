import React, { useEffect, useState } from 'react';
import { News } from '../utils/types';
import { AlertCircleIcon } from 'lucide-react';
interface NewsTickerProps {
  news: News[];
}
export function NewsTicker({
  news
}: NewsTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const breakingNews = news.filter(n => n.priority === 'breaking');
  useEffect(() => {
    if (breakingNews.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % breakingNews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [breakingNews.length]);
  if (breakingNews.length === 0) return null;
  return (
    <div className="bg-gradient-to-r from-african-red to-red-600 text-white py-3 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 flex-shrink-0">
          <AlertCircleIcon className="w-5 h-5 animate-pulse shrink-0" />
          <span className="font-bold text-xs sm:text-sm uppercase tracking-wide whitespace-nowrap">
            Breaking
          </span>
        </div>

        <div className="flex-1 min-w-0 overflow-hidden">
          <div
            className="transition-transform duration-500 ease-in-out"
            style={{ transform: `translateY(-${currentIndex * 100}%)` }}
          >
            {breakingNews.map((item) => (
              <div key={item.id} className="h-6 sm:h-7 flex items-center">
                <p className="text-sm font-medium truncate">{item.title}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-1.5 flex-shrink-0">
          {breakingNews.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 sm:w-2 rounded-full transition-all min-w-[8px] min-h-[8px] p-1 -m-1 ${index === currentIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
              aria-label={`Go to news ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}