import React, { useEffect, useState, createContext, useContext } from 'react';
import { ChatRoom, ChatMessage } from '../utils/types';
import { chatService } from '../services/chatService';
import { useAuth } from './AuthContext';

interface ChatContextType {
  rooms: ChatRoom[];
  activeRoom: ChatRoom | null;
  messages: ChatMessage[];
  isOpen: boolean;
  isMinimized: boolean;
  unreadCount: number;
  loading: boolean;
  error: string | null;
  openChat: (roomId?: string) => void;
  closeChat: () => void;
  minimizeChat: () => void;
  maximizeChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  reactToMessage: (messageId: string, emoji: string) => void;
  flagMessage: (messageId: string) => void;
  pinMessage: (messageId: string) => void;
  deleteMessage: (messageId: string) => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: () => void;
  createRoom: (room: Partial<ChatRoom>) => Promise<void>;
  updateRoom: (roomId: string, updates: Partial<ChatRoom>) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;
  assignModerators: (roomId: string, moderators: string[]) => Promise<void>;
  refreshRooms: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (activeRoom) {
      loadMessages(activeRoom.id);
    }
  }, [activeRoom]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const roomsData = await chatService.getRooms();
      setRooms(roomsData || []);
    } catch (err: any) {
      console.error('Failed to load rooms:', err);
      setError(err.message || 'Failed to load chat rooms');
      // Set empty array as fallback
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      setLoading(true);
      setError(null);
      const messagesData = await chatService.getMessages(roomId, 50);
      setMessages((messagesData || []).reverse()); // Reverse to show oldest first
    } catch (err: any) {
      console.error('Failed to load messages:', err);
      setError(err.message || 'Failed to load messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshRooms = async () => {
    await loadRooms();
  };

  const openChat = (roomId?: string) => {
    setIsOpen(true);
    if (roomId) {
      joinRoom(roomId);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const maximizeChat = () => {
    setIsMinimized(false);
  };

  const sendMessage = async (content: string) => {
    if (!user || !activeRoom || !content.trim()) {
      throw new Error('You must be logged in and in a room to send messages');
    }

    try {
      const newMessage = await chatService.sendMessage(activeRoom.id, { content });
      setMessages(prev => [...prev, newMessage]);
      // Reload messages to get the latest from server
      await loadMessages(activeRoom.id);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Failed to send message');
      throw err;
    }
  };

  const reactToMessage = (messageId: string, emoji: string) => {
    // Reactions would need a separate API endpoint
    // For now, just update local state
    setMessages(prev =>
      prev.map(m => {
        if (m.id === messageId) {
          const reactions = { ...m.reactions };
          if (!reactions[emoji]) {
            reactions[emoji] = [];
          }
          const userId = user?.id || '';
          const userIndex = reactions[emoji].indexOf(userId);
          if (userIndex > -1) {
            reactions[emoji].splice(userIndex, 1);
            if (reactions[emoji].length === 0) {
              delete reactions[emoji];
            }
          } else {
            reactions[emoji].push(userId);
          }
          return { ...m, reactions };
        }
        return m;
      })
    );
  };

  const flagMessage = async (messageId: string) => {
    if (!user) return;

    try {
      await chatService.updateMessage(messageId, { flagged: true });
      setMessages(prev =>
        prev.map(m => (m.id === messageId ? { ...m, flagged: true } : m))
      );
    } catch (err: any) {
      console.error('Failed to flag message:', err);
    }
  };

  const pinMessage = async (messageId: string) => {
    if (!user || !activeRoom) return;

    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      const isPinned = !message.isPinned;
      await chatService.updateMessage(messageId, { isPinned });
      
      setMessages(prev =>
        prev.map(m => (m.id === messageId ? { ...m, isPinned } : m))
      );
    } catch (err: any) {
      console.error('Failed to pin message:', err);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!user) return;

    try {
      await chatService.deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (err: any) {
      console.error('Failed to delete message:', err);
      throw err;
    }
  };

  const joinRoom = async (roomId: string) => {
    try {
      const room = await chatService.getRoomById(roomId);
      setActiveRoom(room);
      await loadMessages(roomId);
    } catch (err: any) {
      console.error('Failed to join room:', err);
      setError(err.message || 'Failed to join room');
    }
  };

  const leaveRoom = () => {
    setActiveRoom(null);
    setMessages([]);
  };

  const createRoom = async (room: Partial<ChatRoom>) => {
    if (!user) {
      throw new Error('You must be logged in to create rooms');
    }

    try {
      const newRoom = await chatService.createRoom({
        type: room.type || 'country',
        entityId: room.entityId || '',
        name: room.name || 'New Room',
        description: room.description,
        moderators: room.moderators,
      });
      setRooms(prev => [...prev, newRoom]);
    } catch (err: any) {
      console.error('Failed to create room:', err);
      throw err;
    }
  };

  const updateRoom = async (roomId: string, updates: Partial<ChatRoom>) => {
    if (!user) {
      throw new Error('You must be logged in to update rooms');
    }

    try {
      const updatedRoom = await chatService.updateRoom(roomId, updates);
      setRooms(prev =>
        prev.map(r => (r.id === roomId ? updatedRoom : r))
      );
      if (activeRoom?.id === roomId) {
        setActiveRoom(updatedRoom);
      }
    } catch (err: any) {
      console.error('Failed to update room:', err);
      throw err;
    }
  };

  const deleteRoom = async (roomId: string) => {
    if (!user) {
      throw new Error('You must be logged in to delete rooms');
    }

    try {
      await chatService.deleteRoom(roomId);
      setRooms(prev => prev.filter(r => r.id !== roomId));
      if (activeRoom?.id === roomId) {
        setActiveRoom(null);
        setMessages([]);
      }
    } catch (err: any) {
      console.error('Failed to delete room:', err);
      throw err;
    }
  };

  const assignModerators = async (roomId: string, moderators: string[]) => {
    if (!user) {
      throw new Error('You must be logged in to assign moderators');
    }

    try {
      await chatService.updateRoom(roomId, { moderators });
      await refreshRooms();
    } catch (err: any) {
      console.error('Failed to assign moderators:', err);
      throw err;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        rooms,
        activeRoom,
        messages,
        isOpen,
        isMinimized,
        unreadCount,
        loading,
        error,
        openChat,
        closeChat,
        minimizeChat,
        maximizeChat,
        sendMessage,
        reactToMessage,
        flagMessage,
        pinMessage,
        deleteMessage,
        joinRoom,
        leaveRoom,
        createRoom,
        updateRoom,
        deleteRoom,
        assignModerators,
        refreshRooms,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
}
