import React from 'react';
import { Card } from '../ui/Card';
import { BoxIcon } from 'lucide-react';
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: BoxIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}
export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = '#10B981'
}: StatsCardProps) {
  return <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl" style={{
        backgroundColor: `${color}20`
      }}>
          <Icon className="w-6 h-6" style={{
          color
        }} />
        </div>
        {trend && <span className={`text-sm font-medium ${trend.isPositive ? 'text-african-green' : 'text-african-red'}`}>
            {trend.isPositive ? '+' : ''}
            {trend.value}%
          </span>}
      </div>

      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-display font-bold text-gray-900">{value}</p>
      </div>
    </Card>;
}