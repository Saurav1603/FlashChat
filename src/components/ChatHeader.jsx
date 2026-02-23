// src/components/ChatHeader.jsx
import React, { useState } from 'react';
import { auth } from '../firebase';
import { useChatContext } from '../contexts/ChatContext';
import { usePresence } from '../hooks/usePresence';
import { getAvatarUrl } from '../utils/helpers';
import ChatInfoDrawer from './ChatInfoDrawer';

function ChatHeader() {
  const { activeChat, closeChat } = useChatContext();
  const currentUid = auth.currentUser?.uid;
  const [showInfo, setShowInfo] = useState(false);

  if (!activeChat) return null;

  const isGroup = activeChat.type === 'group';
  let chatName, chatAvatar, otherUid;

  if (isGroup) {
    chatName = activeChat.groupName || 'Group';
    chatAvatar = activeChat.groupPhotoURL || getAvatarUrl(null, chatName, activeChat.id);
  } else {
    otherUid = activeChat.memberUids?.find((uid) => uid !== currentUid);
    const other = activeChat.members?.[otherUid] || {};
    chatName = other.displayName || 'Unknown';
    chatAvatar = getAvatarUrl(other.photoURL, other.displayName, otherUid);
  }

  return (
    <>
      <div className="chat-header">
        <button className="back-btn" onClick={closeChat} aria-label="Back to chats">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>

        <div className="chat-header-info" onClick={() => setShowInfo(true)}>
          <img src={chatAvatar} alt={chatName} className="chat-header-avatar" />
          <div className="chat-header-text">
            <h3 className="chat-header-name">{chatName}</h3>
            <ChatHeaderSubtitle
              isGroup={isGroup}
              activeChat={activeChat}
              otherUid={otherUid}
            />
          </div>
        </div>

        <button className="info-btn" onClick={() => setShowInfo(true)} aria-label="Chat info">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        </button>
      </div>

      {showInfo && <ChatInfoDrawer onClose={() => setShowInfo(false)} />}
    </>
  );
}

function ChatHeaderSubtitle({ isGroup, activeChat, otherUid }) {
  const presence = usePresence(isGroup ? null : otherUid);

  if (isGroup) {
    const count = activeChat.memberUids?.length || 0;
    return <p className="chat-header-status">{count} members</p>;
  }

  if (presence.online) {
    return <p className="chat-header-status online-text">Online</p>;
  }

  if (presence.lastSeenAt?.toDate) {
    const time = presence.lastSeenAt.toDate().toLocaleString([], {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    return <p className="chat-header-status">Last seen {time}</p>;
  }

  return <p className="chat-header-status">Offline</p>;
}

export default ChatHeader;
