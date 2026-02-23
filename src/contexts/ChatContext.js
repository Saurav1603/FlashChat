// src/contexts/ChatContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { subscribeToChats } from '../services/chatService';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatsLoading, setChatsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setChats([]);
      setActiveChatId(null);
      setChatsLoading(false);
      return;
    }
    setChatsLoading(true);
    const unsub = subscribeToChats(user.uid, (chatList) => {
      setChats(chatList);
      setChatsLoading(false);
    });
    return unsub;
  }, [user]);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  const openChat = useCallback((chatId) => {
    setActiveChatId(chatId);
  }, []);

  const closeChat = useCallback(() => {
    setActiveChatId(null);
  }, []);

  return (
    <ChatContext.Provider value={{
      chats, chatsLoading,
      activeChatId, activeChat,
      openChat, closeChat,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  return useContext(ChatContext);
}
