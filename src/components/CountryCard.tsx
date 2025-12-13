import React from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { CalendarIcon, ChevronRightIcon } from 'lucide-react';
import { Country, Election } from '../utils/types';
interface CountryCardProps {
  country: Country;
  election?: Election;
  onClick: () => void;
}
export function CountryCard({
  country,
  election,
  onClick
}: CountryCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  return <Card onClick={onClick} className="p-6 hover:shadow-2xl">
      <div className="flex items-start justify-between mb-4">
        <div className="text-6xl">{country.flag}</div>
        {election && <Badge variant="info">{election.type}</Badge>}
      </div>

      <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">
        {country.name}
      </h3>

      {election ? <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <CalendarIcon className="w-4 h-4" />
            <span className="text-sm">{formatDate(election.date)}</span>
          </div>
          <p className="text-sm text-gray-500 line-clamp-2">
            {election.description}
          </p>
        </div> : <p className="text-sm text-gray-500">No upcoming elections</p>}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-medium text-african-green">
          View Election
        </span>
        <ChevronRightIcon className="w-5 h-5 text-african-green" />
      </div>
    </Card>;
}