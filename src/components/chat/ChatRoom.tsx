import React from 'react';
import { useChat } from '../../context/ChatContext';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { PinnedMessage } from './PinnedMessage';
export function ChatRoom() {
  const {
    activeRoom,
    messages
  } = useChat();
  if (!activeRoom) return null;
  const pinnedMessage = messages.find(m => m.isPinned);
  return <div className="flex flex-col h-full">
      <ChatHeader />
      {pinnedMessage && <PinnedMessage message={pinnedMessage} />}
      <MessageList />
      <MessageInput />
    </div>;
}