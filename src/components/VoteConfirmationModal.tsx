import React from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Candidate } from '../utils/types';
import { AlertCircleIcon } from 'lucide-react';
interface VoteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  candidate: Candidate | null;
}
export function VoteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  candidate
}: VoteConfirmationModalProps) {
  if (!candidate) return null;
  return <Modal isOpen={isOpen} onClose={onClose} title="Confirm Your Vote">
      <div className="space-y-6">
        <div className="flex items-start gap-4 p-4 bg-african-yellow/10 rounded-xl border-2 border-african-yellow/20">
          <AlertCircleIcon className="w-6 h-6 text-african-yellow flex-shrink-0 mt-1" />
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">Important Notice</p>
            <p>
              You can only vote once per election. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="text-center">
          <img src={candidate.image} alt={candidate.name} className="w-32 h-32 rounded-full object-cover mx-auto mb-4 shadow-lg" />
          <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">
            {candidate.name}
          </h3>
          <p className="text-african-blue font-medium mb-1">
            {candidate.party}
          </p>
          <p className="text-gray-600 text-sm">{candidate.bio}</p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm} className="flex-1">
            Confirm Vote
          </Button>
        </div>
      </div>
    </Modal>;
}