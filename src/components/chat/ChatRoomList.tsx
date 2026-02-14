import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { SearchIcon, UsersIcon, TrendingUpIcon } from 'lucide-react';
export function ChatRoomList() {
  const {
    rooms,
    joinRoom,
    loading
  } = useChat();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const filteredRooms = rooms.filter(room => room.name.toLowerCase().includes(search.toLowerCase()));
  const roomsByType = {
    country: filteredRooms.filter(r => r.type === 'country'),
    election: filteredRooms.filter(r => r.type === 'election'),
    candidate: filteredRooms.filter(r => r.type === 'candidate')
  };
  return <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-african-green to-emerald-600 rounded-full flex items-center justify-center">
            <UsersIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-gray-900">
              Group Chats
            </h2>
            <p className="text-xs text-gray-600">
              {rooms.length} rooms available
            </p>
          </div>
        </div>

        <Input placeholder="Search rooms..." value={search} onChange={e => setSearch(e.target.value)} className="text-sm" />
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-african-green mb-4"></div>
              <p className="text-gray-500 text-sm">Loading chat rooms...</p>
            </div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">No chat rooms available</p>
              <p className="text-gray-400 text-xs mt-1">
                Chat rooms will appear here when created by admins
              </p>
            </div>
          </div>
        ) : (
          Object.entries(roomsByType).map(([type, typeRooms]) => {
        if (typeRooms.length === 0) return null;
        return <div key={type} className="p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {type === 'country' && '🌍 Countries'}
                {type === 'election' && '🗳️ Elections'}
                {type === 'candidate' && '👤 Candidates'}
              </h3>

              <div className="space-y-2">
                {typeRooms.map((room, index) => <button key={room.id} onClick={() => {
              if (!isAuthenticated) {
                alert('Please log in to join chat rooms.');
                navigate('/login');
                return;
              }
              joinRoom(room.id);
            }} className="w-full p-3 rounded-xl hover:bg-gray-50 transition-all text-left animate-slide-up" style={{
              animationDelay: `${index * 50}ms`
            }}>
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {room.name}
                      </h4>
                      {room.activeUsers > 0 && <Badge variant="success" className="text-xs">
                          <TrendingUpIcon className="w-3 h-3 mr-1" />
                          {room.activeUsers}
                        </Badge>}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-1">
                      {room.description}
                    </p>
                  </button>)}
              </div>
            </div>;
      }))}
      </div>
    </div>;
}