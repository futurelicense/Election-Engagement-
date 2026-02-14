import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Candidate } from '../utils/types';
import { CheckCircleIcon } from 'lucide-react';
interface CandidateCardProps {
  candidate: Candidate;
  onVote: () => void;
  hasVoted: boolean;
  isVotedFor: boolean;
  disabled?: boolean;
}
export function CandidateCard({
  candidate,
  onVote,
  hasVoted,
  isVotedFor,
  disabled
}: CandidateCardProps) {
  return <Card className="p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-2 h-full" style={{
      backgroundColor: candidate.color
    }} />

      <div className="flex flex-col sm:flex-row gap-6">
        <img src={candidate.image} alt={candidate.name} className="w-32 h-32 rounded-xl object-cover shadow-lg" />

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-2xl font-display font-bold text-gray-900">
                {candidate.name}
              </h3>
              <p className="text-african-blue font-medium">{candidate.party}</p>
            </div>
            {isVotedFor && <div className="flex items-center gap-2 text-african-green">
                <CheckCircleIcon className="w-6 h-6" />
                <span className="text-sm font-medium">Your Vote</span>
              </div>}
          </div>

          <p className="text-gray-600 mb-4">{candidate.bio}</p>

          <Button onClick={onVote} disabled={disabled || hasVoted} variant={isVotedFor ? 'secondary' : 'primary'} size="md" className="w-full sm:w-auto">
            {hasVoted ? isVotedFor ? 'You Voted' : 'Already Voted' : 'Vote for Candidate'}
          </Button>
        </div>
      </div>
    </Card>;
}