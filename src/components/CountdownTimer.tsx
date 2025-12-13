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
      // Handle date format: could be "2025-02-15" or ISO string
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
    // Calculate immediately
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.isExpired) {
    return (
      <div className="glass p-6 rounded-2xl border-2 border-african-red">
        <div className="flex items-center gap-2 mb-4">
          <ClockIcon className="w-5 h-5 text-african-red" />
          <h3 className="font-display font-bold text-gray-900">
            Election Status
          </h3>
        </div>
        <div className="text-center py-4">
          <p className="text-xl font-display font-bold text-african-red">
            Election has concluded
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Results are being processed
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-6 rounded-2xl border-2 border-african-green animate-pulse">
      <div className="flex items-center gap-2 mb-4">
        <ClockIcon className="w-5 h-5 text-african-blue animate-spin" />
        <h3 className="font-display font-bold text-gray-900">
          Time Until Election
        </h3>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-3xl font-display font-bold text-african-green">
            {timeLeft.days.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-600 uppercase mt-1">Days</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-display font-bold text-african-green">
            {timeLeft.hours.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-600 uppercase mt-1">Hours</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-display font-bold text-african-green">
            {timeLeft.minutes.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-600 uppercase mt-1">Minutes</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-display font-bold text-african-green">
            {timeLeft.seconds.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-600 uppercase mt-1">Seconds</div>
        </div>
      </div>
    </div>
  );
}