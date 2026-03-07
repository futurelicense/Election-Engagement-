import React from 'react';
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}
export function Badge({
  children,
  variant = 'info',
  className = ''
}: BadgeProps) {
  const variants = {
    success: 'bg-african-green/10 text-african-green border-african-green/20',
    warning: 'bg-african-yellow/10 text-african-yellow border-african-yellow/20',
    danger: 'bg-african-red/10 text-african-red border-african-red/20',
    info: 'bg-african-blue/10 text-african-blue border-african-blue/20'
  };
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>;
}