import React from 'react';
interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  fallback?: string;
}
export function Avatar({
  src,
  alt = 'Avatar',
  size = 'md',
  fallback
}: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  };
  if (!src) {
    return <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-african-green to-african-blue flex items-center justify-center text-white font-bold`}>
        {fallback || alt.charAt(0).toUpperCase()}
      </div>;
  }
  return <img src={src} alt={alt} className={`${sizes[size]} rounded-full object-cover border-2 border-white shadow-md`} />;
}