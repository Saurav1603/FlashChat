// src/pages/ChatsPage.jsx
import React from 'react';
import { ChatProvider, useChatContext } from '../contexts/ChatContext';
import ChatListSidebar from '../components/ChatListSidebar';
import ChatWindow from '../components/ChatWindow';
import OfflineBanner from '../components/OfflineBanner';

function ChatsLayout() {
  const { activeChatId } = useChatContext();

  return (
    <>
      <OfflineBanner />
      <div className={`app-layout ${activeChatId ? 'chat-open' : ''}`}>
        <ChatListSidebar />
        <ChatWindow />
      </div>
    </>
  );
}

function ChatsPage() {
  return (
    <ChatProvider>
      <ChatsLayout />
    </ChatProvider>
  );
}

export default ChatsPage;
