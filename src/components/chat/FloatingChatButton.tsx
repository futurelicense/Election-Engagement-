import React from 'react';
import { MessageCircleIcon } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
export function FloatingChatButton() {
  const {
    openChat,
    unreadCount
  } = useChat();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const handleClick = () => {
    if (!isAuthenticated) {
      alert('Please log in to use chat.');
      navigate('/login');
      return;
    }
    openChat();
  };
  return <button onClick={handleClick} className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-gradient-to-br from-african-green to-emerald-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center animate-bounce-in" aria-label="Open chat">
      <MessageCircleIcon className="w-7 h-7" />
      {unreadCount > 0 && <div className="absolute -top-1 -right-1">
          <Badge variant="danger" className="px-2 py-1 text-xs font-bold animate-pulse">
            {unreadCount}
          </Badge>
        </div>}
    </button>;
}