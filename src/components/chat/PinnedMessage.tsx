import React from 'react';
import { ChatMessage } from '../../utils/types';
import { PinIcon } from 'lucide-react';
interface PinnedMessageProps {
  message: ChatMessage;
}
export function PinnedMessage({
  message
}: PinnedMessageProps) {
  return <div className="px-4 py-2 bg-african-yellow/10 border-b border-african-yellow/20">
      <div className="flex items-start gap-2">
        <PinIcon className="w-4 h-4 text-african-yellow flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-african-yellow mb-1">
            Pinned by moderator
          </p>
          <p className="text-sm text-gray-900 line-clamp-2">
            {message.content}
          </p>
        </div>
      </div>
    </div>;
}