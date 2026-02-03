import React, { useEffect, useState } from 'react';
import { ClockIcon } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  function calculateTimeLeft() {
    try {
      const target = new Date(targetDate);
      const now = new Date();
      const difference = target.getTime() - now.getTime();

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isExpired: false,
      };
    } catch (error) {
      console.error('Error calculating time left:', error);
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
      };
    }
  }

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.isExpired) {
    return (
      <div className="rounded-2xl border-2 border-african-red bg-red-50/50 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <ClockIcon className="w-5 h-5 text-african-red shrink-0" />
          <h3 className="font-display font-bold text-gray-900 text-base sm:text-lg">
            Election Status
          </h3>
        </div>
        <div className="text-center py-3 sm:py-4">
          <p className="text-lg sm:text-xl font-display font-bold text-african-red">
            Election has concluded
          </p>
          <p className="text-sm text-gray-600 mt-2">Results are being processed</p>
        </div>
      </div>
    );
  }

  const blocks = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Mins' },
    { value: timeLeft.seconds, label: 'Secs' },
  ];

  return (
    <div className="rounded-2xl border-2 border-african-green/30 bg-white/80 shadow-sm p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <ClockIcon className="w-5 h-5 text-african-green shrink-0" />
        <h3 className="font-display font-bold text-gray-900 text-base sm:text-lg">
          Time Until Election
        </h3>
      </div>
      {/* 2x2 on very small, 4 col on sm+ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {blocks.map(({ value, label }) => (
          <div
            key={label}
            className="text-center rounded-xl bg-african-green/10 py-3 sm:py-4 px-2"
          >
            <div className="text-2xl sm:text-3xl font-display font-bold text-african-green tabular-nums">
              {value.toString().padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-600 uppercase mt-1 font-medium tracking-wide">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
