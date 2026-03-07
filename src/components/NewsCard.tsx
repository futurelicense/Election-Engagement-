import React from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { News } from '../utils/types';
import { formatDistanceToNow } from 'date-fns';
import { TrendingUpIcon, AlertCircleIcon, NewspaperIcon, HashIcon } from 'lucide-react';
interface NewsCardProps {
  news: News;
  index: number;
  onClick?: () => void;
}
export function NewsCard({
  news,
  index,
  onClick
}: NewsCardProps) {
  const priorityConfig = {
    breaking: {
      icon: <AlertCircleIcon className="w-4 h-4" />,
      variant: 'danger' as const,
      label: 'BREAKING'
    },
    important: {
      icon: <TrendingUpIcon className="w-4 h-4" />,
      variant: 'warning' as const,
      label: 'IMPORTANT'
    },
    general: {
      icon: <NewspaperIcon className="w-4 h-4" />,
      variant: 'info' as const,
      label: 'NEWS'
    }
  };
  const config = priorityConfig[news.priority];
  return <Card 
    className={`overflow-hidden animate-slide-up cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] ${onClick ? '' : ''}`}
    style={{
      animationDelay: `${index * 100}ms`
    }}
    onClick={onClick}
  >
      {news.image && <div className="relative h-48 overflow-hidden">
          <img src={news.image} alt={news.title} className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4">
            <Badge variant={config.variant} className="flex items-center gap-1">
              {config.icon}
              {config.label}
            </Badge>
          </div>
        </div>}

      <div className="p-6">
        {!news.image && <Badge variant={config.variant} className="flex items-center gap-1 mb-3 w-fit">
            {config.icon}
            {config.label}
          </Badge>}

        <h3 className="text-xl font-display font-bold text-gray-900 mb-2">
          {news.title}
        </h3>

        <div className="text-gray-600 mb-4 line-clamp-3 prose prose-sm max-w-none" dangerouslySetInnerHTML={{
        __html: news.content
      }} />
        
        {onClick && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-african-green font-medium hover:text-emerald-600 transition-colors">
              Read full article →
            </span>
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-2 flex-wrap">
            {news.tags.map(tag => <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
                #{tag}
              </span>)}
          </div>

          <span className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(news.timestamp), {
            addSuffix: true
          })}
          </span>
        </div>

        {news.hashtags && news.hashtags.length > 0 && <div className="flex gap-2 flex-wrap mt-3 pt-3 border-t border-gray-100">
            <HashIcon className="w-4 h-4 text-african-blue" />
            {news.hashtags.map(hashtag => <span key={hashtag} className="text-sm text-african-blue font-medium">
                #{hashtag}
              </span>)}
          </div>}
      </div>

      <style>{`
        .prose a {
          color: #10B981;
          text-decoration: underline;
        }
        .prose strong {
          font-weight: 600;
        }
        .prose ul {
          list-style: disc;
          margin-left: 1.5rem;
        }
      `}</style>
    </Card>;
}