import React, { useState } from 'react';
import { EMOJI_REACTIONS } from '../utils/constants';
interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  selectedEmojis?: string[];
}
export function EmojiPicker({
  onSelect,
  selectedEmojis = []
}: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  return <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Add reaction">
        <span className="text-xl">😊</span>
      </button>

      {isOpen && <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full left-0 mb-2 glass p-3 rounded-xl shadow-xl z-20 animate-scale-in">
            <div className="flex gap-2">
              {EMOJI_REACTIONS.map(emoji => <button key={emoji} onClick={() => {
            onSelect(emoji);
            setIsOpen(false);
          }} className={`text-2xl hover:scale-125 transition-transform ${selectedEmojis.includes(emoji) ? 'scale-125' : ''}`} style={{
            animation: selectedEmojis.includes(emoji) ? 'bounce 0.5s ease-out' : 'none'
          }}>
                  {emoji}
                </button>)}
            </div>
          </div>
        </>}
    </div>;
}