import React from 'react';
import { useChat } from '../../context/ChatContext';
import { ArrowLeftIcon, UsersIcon, MoreVerticalIcon } from 'lucide-react';
import { Badge } from '../ui/Badge';
export function ChatHeader() {
  const {
    activeRoom,
    leaveRoom
  } = useChat();
  if (!activeRoom) return null;
  return <div className="p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button onClick={leaveRoom} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Back to rooms">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-gray-900 truncate">
              {activeRoom.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <UsersIcon className="w-3 h-3" />
              <span>{activeRoom.activeUsers || 0} active</span>
              {activeRoom.type && <Badge variant="info" className="text-xs">
                  {activeRoom.type}
                </Badge>}
            </div>
          </div>
        </div>

        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Room options">
          <MoreVerticalIcon className="w-5 h-5" />
        </button>
      </div>
    </div>;
}