// src/components/ChatWindow.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useChatContext } from '../contexts/ChatContext';
import { useMessages } from '../hooks/useMessages';
import { useTyping } from '../hooks/useTyping';
import { markChatAsSeen } from '../services/messageService';
import { groupMessagesByDate } from '../utils/helpers';
import ChatHeader from './ChatHeader';
import MessageItem from './MessageItem';
import Composer from './Composer';
import ImageViewer from './ImageViewer';

function ChatWindow() {
  const { activeChatId } = useChatContext();
  const { messages, loading, hasMore, loadingMore, fetchOlder } = useMessages(activeChatId);
  const { typingUsers } = useTyping(activeChatId);
  const [replyTo, setReplyTo] = useState(null);
  const [viewImage, setViewImage] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const prevMessageCount = useRef(0);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > prevMessageCount.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    prevMessageCount.current = messages.length;
  }, [messages.length]);

  // Mark chat as seen when opened
  useEffect(() => {
    if (activeChatId) {
      markChatAsSeen(activeChatId);
    }
  }, [activeChatId]);

  // Infinite scroll — load older messages
  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el || loadingMore || !hasMore) return;
    if (el.scrollTop < 80) {
      fetchOlder();
    }
  }, [fetchOlder, loadingMore, hasMore]);

  if (!activeChatId) {
    return (
      <div className="chat-window empty-chat-window">
        <div className="empty-chat-state">
          <span className="empty-chat-icon">💬</span>
          <h3>Welcome to FlashChat</h3>
          <p>Select a conversation or start a new one</p>
        </div>
      </div>
    );
  }

  const grouped = groupMessagesByDate(messages);

  return (
    <div className="chat-window">
      <ChatHeader />

      <main
        className="chat-messages"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {loadingMore && (
          <div className="loading-more">
            <div className="spinner-sm"></div>
          </div>
        )}

        {loading ? (
          <div className="messages-loading">
            <div className="spinner"></div>
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-messages">
            <p>No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          grouped.map((group, gIdx) => (
            <React.Fragment key={gIdx}>
              <div className="date-divider">
                <span>{group.date}</span>
              </div>
              {group.messages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  onReply={(m) => setReplyTo(m)}
                  onImageClick={(url) => setViewImage(url)}
                />
              ))}
            </React.Fragment>
          ))
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            <div className="typing-dots"><span></span><span></span><span></span></div>
            <span className="typing-text">
              {typingUsers.length === 1
                ? `${typingUsers[0]} is typing`
                : `${typingUsers[0]} and ${typingUsers.length - 1} other(s) are typing`}
            </span>
          </div>
        )}

        <span ref={messagesEndRef}></span>
      </main>

      <Composer replyTo={replyTo} onClearReply={() => setReplyTo(null)} />

      {/* Image lightbox */}
      {viewImage && <ImageViewer url={viewImage} onClose={() => setViewImage(null)} />}
    </div>
  );
}

export default ChatWindow;
