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
  return <div className="bg-gradient-to-r from-african-red to-red-600 text-white py-3 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <div className="flex items-center gap-2 flex-shrink-0">
          <AlertCircleIcon className="w-5 h-5 animate-pulse" />
          <span className="font-bold text-sm uppercase tracking-wide">
            Breaking News
          </span>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="transition-transform duration-500 ease-in-out" style={{
          transform: `translateY(-${currentIndex * 100}%)`
        }}>
            {breakingNews.map((item, index) => <div key={item.id} className="h-6 flex items-center">
                <p className="text-sm font-medium truncate">{item.title}</p>
              </div>)}
          </div>
        </div>

        <div className="flex gap-1 flex-shrink-0">
          {breakingNews.map((_, index) => <button key={index} onClick={() => setCurrentIndex(index)} className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-white w-4' : 'bg-white/50'}`} aria-label={`Go to news ${index + 1}`} />)}
        </div>
      </div>
    </div>;
}