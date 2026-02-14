import { useChat } from '../../context/ChatContext';
import { ChatRoomList } from './ChatRoomList';
import { ChatRoom } from './ChatRoom';
import { XIcon, Minimize2Icon, Maximize2Icon } from 'lucide-react';

export function ChatWindow() {
  const {
    isOpen,
    isMinimized,
    closeChat,
    minimizeChat,
    maximizeChat,
    activeRoom
  } = useChat();

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-t-2xl shadow-2xl border-t-4 border-african-green">
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-african-green"></div>
            <span className="text-sm font-semibold text-gray-900">
              {activeRoom ? activeRoom.name : 'Chat'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={maximizeChat}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              aria-label="Maximize chat"
            >
              <Maximize2Icon className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={closeChat}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              aria-label="Close chat"
            >
              <XIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in" onClick={closeChat} />

      {/* Chat Window */}
      <div className="fixed bottom-0 right-0 lg:bottom-6 lg:right-6 z-50 w-full lg:w-96 h-[80vh] lg:h-[600px] bg-white rounded-t-2xl lg:rounded-2xl shadow-2xl flex flex-col animate-slide-up">
        {/* Header with controls */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-african-green"></div>
            <span className="text-sm font-semibold text-gray-900">
              {activeRoom ? activeRoom.name : 'Chat Rooms'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={minimizeChat}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              aria-label="Minimize chat"
            >
              <Minimize2Icon className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={closeChat}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <XIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-hidden">
          {activeRoom ? <ChatRoom /> : <ChatRoomList />}
        </div>
      </div>
    </>
  );
}