import React from 'react';
import { Card } from './ui/Card';
import { VoteStats } from '../utils/types';
import { BarChart3Icon } from 'lucide-react';
interface VoteChartProps {
  stats: VoteStats[];
}
export function VoteChart({
  stats
}: VoteChartProps) {
  const maxVotes = Math.max(...stats.map(s => s.votes), 1);
  return <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3Icon className="w-5 h-5 text-african-blue" />
        <h3 className="font-display font-bold text-gray-900">Live Results</h3>
      </div>

      <div className="space-y-4">
        {stats.map(stat => <div key={stat.candidateId} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900">
                {stat.candidateName}
              </span>
              <span className="text-gray-600">
                {stat.votes} votes ({stat.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full rounded-full transition-all duration-500" style={{
            width: `${stat.votes / maxVotes * 100}%`,
            backgroundColor: stat.color
          }} />
            </div>
          </div>)}
      </div>

      {stats.every(s => s.votes === 0) && <p className="text-center text-gray-500 text-sm mt-4">
          No votes cast yet. Be the first to vote!
        </p>}
    </Card>;
}