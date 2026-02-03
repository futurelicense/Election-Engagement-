import React from 'react';
import { Badge } from './ui/Badge';
import { CalendarIcon, ChevronRightIcon } from 'lucide-react';
import { Country, Election } from '../utils/types';

interface CountryCardProps {
  country: Country;
  election?: Election;
  onClick: () => void;
  index?: number;
}

export function CountryCard({ country, election, onClick, index = 0 }: CountryCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full text-left rounded-2xl overflow-hidden bg-white border border-gray-200/80 shadow-sm hover:shadow-xl hover:border-african-green/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-african-green focus:ring-offset-2 active:scale-[0.99] animate-slide-up"
      style={{ animationDelay: `${Math.min(index * 80, 400)}ms` }}
    >
      {/* Top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-african-green to-emerald-500 opacity-90 group-hover:opacity-100 transition-opacity" />

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <span
            className="text-5xl sm:text-6xl rounded-xl bg-gray-100 p-2 select-none"
            role="img"
            aria-label={country.name}
          >
            {country.flag}
          </span>
          {election && (
            <Badge variant="info" className="shrink-0 text-xs font-semibold">
              {election.type}
            </Badge>
          )}
        </div>

        <h3 className="text-xl font-display font-bold text-gray-900 mb-2 sm:text-2xl">
          {country.name}
        </h3>

        {election ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <CalendarIcon className="w-4 h-4 shrink-0 text-african-green" />
              <span className="text-sm font-medium">{formatDate(election.date)}</span>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
              {election.description}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No upcoming elections</p>
        )}

        <div className="mt-5 flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-african-green group-hover:text-emerald-600 transition-colors">
            View election
          </span>
          <span className="flex items-center justify-center w-9 h-9 rounded-full bg-african-green/10 text-african-green group-hover:bg-african-green group-hover:text-white transition-all duration-200">
            <ChevronRightIcon className="w-5 h-5" />
          </span>
        </div>
      </div>
    </button>
  );
}
