import React from 'react';
import { CheckCircleIcon } from 'lucide-react';
export function VoteBadge() {
  return <div className="glass p-8 rounded-2xl text-center animate-bounce-in">
      <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-african-green to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
        <CheckCircleIcon className="w-12 h-12 text-white" />
      </div>
      <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">
        Your Vote Has Been Counted!
      </h3>
      <p className="text-gray-600">
        Thank you for participating in this election
      </p>
    </div>;
}