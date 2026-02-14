import React from 'react';
interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  onClick?: () => void;
}
export function Card({
  children,
  className = '',
  glass = true,
  onClick
}: CardProps) {
  const baseStyles = 'rounded-2xl shadow-lg transition-all duration-300';
  const glassStyles = glass ? 'glass' : 'bg-white';
  const clickableStyles = onClick ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02]' : '';
  return <div className={`${baseStyles} ${glassStyles} ${clickableStyles} ${className}`} onClick={onClick}>
      {children}
    </div>;
}