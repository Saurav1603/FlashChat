// src/components/ChatListItem.jsx
import React from 'react';
import { auth } from '../firebase';
import { useChatContext } from '../contexts/ChatContext';
import { getAvatarUrl, formatRelativeTime, truncate } from '../utils/helpers';

function ChatListItem({ chat }) {
  const { activeChatId, openChat } = useChatContext();
  const currentUid = auth.currentUser?.uid;
  const isActive = activeChatId === chat.id;

  // Determine display name and avatar
  let chatName, chatAvatar;
  if (chat.type === 'group') {
    chatName = chat.groupName || 'Group';
    chatAvatar = chat.groupPhotoURL || getAvatarUrl(null, chat.groupName, chat.id);
  } else {
    const otherUid = chat.memberUids?.find((uid) => uid !== currentUid);
    const otherMember = chat.members?.[otherUid] || {};
    chatName = otherMember.displayName || 'Unknown';
    chatAvatar = getAvatarUrl(otherMember.photoURL, otherMember.displayName, otherUid);
  }

  const lastMsg = chat.lastMessageText || '';
  const lastTime = formatRelativeTime(chat.lastMessageAt);
  const lastSenderIsMe = chat.lastMessageSenderUid === currentUid;

  return (
    <button
      className={`chat-list-item ${isActive ? 'active' : ''}`}
      onClick={() => openChat(chat.id)}
    >
      <img src={chatAvatar} alt={chatName} className="chat-item-avatar" />

      <div className="chat-item-info">
        <div className="chat-item-top">
          <span className="chat-item-name">{chatName}</span>
          <span className="chat-item-time">{lastTime}</span>
        </div>
        <p className="chat-item-preview">
          {lastSenderIsMe && lastMsg ? 'You: ' : ''}
          {truncate(lastMsg, 35) || 'No messages yet'}
        </p>
      </div>
    </button>
  );
}

export default ChatListItem;
