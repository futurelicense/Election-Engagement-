import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { EmojiPicker } from '../EmojiPicker';
import { SendIcon } from 'lucide-react';
export function MessageInput() {
  const {
    sendMessage
  } = useChat();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      alert('Please log in to send messages.');
      navigate('/login');
      return;
    }
    if (message.trim()) {
      try {
        await sendMessage(message);
        setMessage('');
      } catch (error: any) {
        console.error('Failed to send message:', error);
        alert(error.message || 'Failed to send message. Please try again.');
      }
    }
  };
  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };
  return <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }} placeholder="Type a message..." rows={1} className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-african-blue focus:ring-2 focus:ring-african-blue/20 outline-none transition-all resize-none" style={{
          maxHeight: '120px'
        }} />
          <div className="absolute right-2 bottom-2">
            <EmojiPicker onSelect={handleEmojiSelect} />
          </div>
        </div>

        <button type="submit" disabled={!message.trim()} className="p-3 bg-gradient-to-br from-african-green to-emerald-600 text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </form>;
}