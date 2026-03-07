import { ChatRoom, ChatMessage, ChatUser } from './types';
const STORAGE_KEYS = {
  CHAT_ROOMS: 'chat_rooms',
  CHAT_MESSAGES: 'chat_messages',
  CHAT_USERS: 'chat_users',
  ACTIVE_ROOM: 'chat_active_room'
};
export const chatStorage = {
  // Rooms
  getRooms: (): ChatRoom[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_ROOMS);
    return data ? JSON.parse(data) : [];
  },
  addRoom: (room: ChatRoom) => {
    const rooms = chatStorage.getRooms();
    rooms.push(room);
    localStorage.setItem(STORAGE_KEYS.CHAT_ROOMS, JSON.stringify(rooms));
  },
  updateRoom: (roomId: string, updates: Partial<ChatRoom>) => {
    const rooms = chatStorage.getRooms();
    const index = rooms.findIndex(r => r.id === roomId);
    if (index > -1) {
      rooms[index] = {
        ...rooms[index],
        ...updates
      };
      localStorage.setItem(STORAGE_KEYS.CHAT_ROOMS, JSON.stringify(rooms));
    }
  },
  deleteRoom: (roomId: string) => {
    const rooms = chatStorage.getRooms().filter(r => r.id !== roomId);
    localStorage.setItem(STORAGE_KEYS.CHAT_ROOMS, JSON.stringify(rooms));

    // Also delete all messages in this room
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    const messages: ChatMessage[] = data ? JSON.parse(data) : [];
    const filteredMessages = messages.filter(m => m.roomId !== roomId);
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(filteredMessages));
  },
  assignModerators: (roomId: string, moderators: string[]) => {
    chatStorage.updateRoom(roomId, {
      moderators
    });
  },
  toggleRoomEnabled: (roomId: string, enabled: boolean) => {
    // Store enabled state in room metadata
    const rooms = chatStorage.getRooms();
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      chatStorage.updateRoom(roomId, {
        ...room,
        activeUsers: enabled ? room.activeUsers : 0
      });
    }
  },
  // Messages
  getMessages: (roomId: string): ChatMessage[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    const allMessages: ChatMessage[] = data ? JSON.parse(data) : [];
    return allMessages.filter(m => m.roomId === roomId && !m.deleted);
  },
  addMessage: (message: ChatMessage) => {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    const messages: ChatMessage[] = data ? JSON.parse(data) : [];
    messages.push(message);
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messages));
  },
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    const messages: ChatMessage[] = data ? JSON.parse(data) : [];
    const index = messages.findIndex(m => m.id === messageId);
    if (index > -1) {
      messages[index] = {
        ...messages[index],
        ...updates
      };
      localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messages));
    }
  },
  deleteMessage: (messageId: string) => {
    chatStorage.updateMessage(messageId, {
      deleted: true
    });
  },
  getFlaggedMessages: (): ChatMessage[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    const messages: ChatMessage[] = data ? JSON.parse(data) : [];
    return messages.filter(m => m.flagged && !m.deleted);
  },
  // Users
  getChatUser: (userId: string): ChatUser | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_USERS);
    const users: ChatUser[] = data ? JSON.parse(data) : [];
    return users.find(u => u.userId === userId) || null;
  },
  updateChatUser: (userId: string, updates: Partial<ChatUser>) => {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_USERS);
    const users: ChatUser[] = data ? JSON.parse(data) : [];
    const index = users.findIndex(u => u.userId === userId);
    if (index > -1) {
      users[index] = {
        ...users[index],
        ...updates
      };
    } else {
      users.push({
        userId,
        userName: updates.userName || 'User',
        activeRooms: updates.activeRooms || [],
        badges: updates.badges || [],
        isModerator: updates.isModerator || false,
        isBanned: updates.isBanned || false,
        lastSeen: new Date().toISOString()
      });
    }
    localStorage.setItem(STORAGE_KEYS.CHAT_USERS, JSON.stringify(users));
  },
  // Active Room
  getActiveRoom: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_ROOM);
  },
  setActiveRoom: (roomId: string | null) => {
    if (roomId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ROOM, roomId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ROOM);
    }
  }
};