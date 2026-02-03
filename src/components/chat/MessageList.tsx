import React, { useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { MessageItem } from './MessageItem';
export function MessageList() {
  const {
    messages
  } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);
  return <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {messages.length === 0 ? <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-500 text-sm">No messages yet</p>
            <p className="text-gray-400 text-xs mt-1">
              Be the first to start the conversation!
            </p>
          </div>
        </div> : <>
          {messages.map((message, index) => <MessageItem key={message.id} message={message} index={index} />)}
          <div ref={messagesEndRef} />
        </>}
    </div>;
}