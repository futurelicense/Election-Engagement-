import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { ChatMessage } from '../../utils/types';
import { chatHelpers } from '../../utils/chatHelpers';
import { MoreVerticalIcon, FlagIcon, PinIcon, TrashIcon } from 'lucide-react';
interface MessageItemProps {
  message: ChatMessage;
  index: number;
}
export function MessageItem({
  message,
  index
}: MessageItemProps) {
  const {
    user
  } = useAuth();
  const {
    reactToMessage,
    flagMessage,
    pinMessage,
    deleteMessage
  } = useChat();
  const [showMenu, setShowMenu] = useState(false);
  const isOwnMessage = user?.id === message.userId;
  const reactionEmojis = ['👍', '❤️', '😂', '🔥', '👏'];
  return <div className={`flex gap-3 animate-slide-up ${isOwnMessage ? 'flex-row-reverse' : ''}`} style={{
    animationDelay: `${index * 50}ms`
  }}>
      {!isOwnMessage && <Avatar src={message.userAvatar} alt={message.userName} fallback={message.userName.charAt(0)} size="sm" />}

      <div className={`flex-1 max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isOwnMessage && <span className="text-xs font-medium text-gray-700 mb-1">
            {message.userName}
          </span>}

        <div className="relative group">
          <div className={`px-4 py-2 rounded-2xl ${isOwnMessage ? 'bg-gradient-to-br from-african-green to-emerald-600 text-white' : 'bg-white text-gray-900 border border-gray-200'} ${message.flagged ? 'border-2 border-african-red' : ''}`}>
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>

            {message.flagged && <div className="flex items-center gap-1 mt-2 text-xs text-african-red">
                <FlagIcon className="w-3 h-3" />
                <span>Flagged for review</span>
              </div>}
          </div>

          {/* Reactions */}
          {Object.keys(message.reactions).length > 0 && <div className="flex gap-1 mt-1 flex-wrap">
              {Object.entries(message.reactions).map(([emoji, users]) => <button key={emoji} onClick={() => reactToMessage(message.id, emoji)} className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 transition-all ${users.includes(user?.id || '') ? 'bg-african-blue/20 border border-african-blue' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  <span>{emoji}</span>
                  <span className="text-gray-700">{users.length}</span>
                </button>)}
            </div>}

          {/* Quick reactions */}
          <div className="absolute -bottom-8 left-0 hidden group-hover:flex gap-1 bg-white rounded-full shadow-lg p-1 border border-gray-200 animate-scale-in">
            {reactionEmojis.map(emoji => <button key={emoji} onClick={() => reactToMessage(message.id, emoji)} className="w-8 h-8 hover:scale-125 transition-transform rounded-full hover:bg-gray-100">
                {emoji}
              </button>)}
          </div>

          {/* Message menu */}
          <button onClick={() => setShowMenu(!showMenu)} className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100">
            <MoreVerticalIcon className="w-4 h-4" />
          </button>

          {showMenu && <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute top-6 right-0 z-20 bg-white rounded-xl shadow-xl border border-gray-200 py-2 min-w-[150px] animate-scale-in">
                {user?.isAdmin && <>
                    <button onClick={() => {
                pinMessage(message.id);
                setShowMenu(false);
              }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2">
                      <PinIcon className="w-4 h-4" />
                      {message.isPinned ? 'Unpin' : 'Pin'} Message
                    </button>
                    <button onClick={() => {
                deleteMessage(message.id);
                setShowMenu(false);
              }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-african-red">
                      <TrashIcon className="w-4 h-4" />
                      Delete Message
                    </button>
                  </>}
                {!isOwnMessage && <button onClick={() => {
              flagMessage(message.id);
              setShowMenu(false);
            }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2">
                    <FlagIcon className="w-4 h-4" />
                    Report Message
                  </button>}
              </div>
            </>}
        </div>

        <span className="text-xs text-gray-500 mt-1">
          {chatHelpers.formatMessageTime(message.timestamp)}
        </span>
      </div>
    </div>;
}