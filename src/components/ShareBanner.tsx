import React from 'react';
import { Card } from './ui/Card';
import { Candidate, Country } from '../utils/types';
interface ShareBannerProps {
  candidate: Candidate;
  country: Country;
}
export function ShareBanner({
  candidate,
  country
}: ShareBannerProps) {
  return <Card className="relative overflow-hidden p-0 animate-scale-in">
      <div className="absolute inset-0 opacity-20" style={{
      background: `linear-gradient(135deg, ${candidate.color} 0%, ${candidate.color}88 100%)`
    }} />

      <div className="relative p-8">
        <div className="flex items-center gap-6 mb-6">
          <div className="text-6xl">{country.flag}</div>
          <div>
            <h3 className="text-3xl font-display font-bold text-gray-900 mb-1">
              I Voted!
            </h3>
            <p className="text-lg text-gray-600">
              {country.name} Election 2025
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 p-6 bg-white/80 backdrop-blur-sm rounded-2xl">
          <img src={candidate.image} alt={candidate.name} className="w-24 h-24 rounded-xl object-cover shadow-lg" />

          <div>
            <p className="text-sm text-gray-600 mb-1">I voted for</p>
            <h4 className="text-2xl font-display font-bold text-gray-900 mb-1">
              {candidate.name}
            </h4>
            <p className="text-african-blue font-medium">{candidate.party}</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Join me in making your voice heard! 🗳️
          </p>
        </div>
      </div>
    </Card>;
}