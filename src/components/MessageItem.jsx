// src/components/MessageItem.jsx
import React, { useState, useRef } from 'react';
import { auth } from '../firebase';
import { toggleReaction, editMessage, deleteMessageForEveryone, deleteMessageForMe } from '../services/messageService';
import { useChatContext } from '../contexts/ChatContext';
import { formatTime, getAvatarUrl, formatFileSize } from '../utils/helpers';
import { isImage } from '../services/uploadService';

const REACTION_EMOJIS = ['❤️', '😂', '👍', '😮', '😢', '🔥'];

function MessageItem({ message, onReply, onImageClick }) {
  const { activeChatId } = useChatContext();
  const currentUid = auth.currentUser?.uid;
  const isMine = message.senderUid === currentUid;
  const messageClass = isMine ? 'sent' : 'received';

  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const actionsRef = useRef(null);

  // Check if deleted
  if (message.deletedForEveryone) {
    return (
      <div className={`message ${messageClass}`}>
        <div className="message-content-wrapper">
          <div className="message-bubble deleted-bubble">
            <p className="message-text deleted-text">🚫 This message was deleted</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if deleted for me
  if (message.deletedFor?.includes(currentUid)) return null;

  const handleReaction = async (emoji) => {
    await toggleReaction(activeChatId, message.id, emoji);
    setShowReactions(false);
  };

  const handleEdit = async () => {
    if (editText.trim() && editText !== message.text) {
      await editMessage(activeChatId, message.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleDeleteForEveryone = async () => {
    await deleteMessageForEveryone(activeChatId, message.id);
    setShowActions(false);
  };

  const handleDeleteForMe = async () => {
    await deleteMessageForMe(activeChatId, message.id);
    setShowActions(false);
  };

  const displayTime = formatTime(message.createdAt);
  const avatarUrl = getAvatarUrl(message.senderPhotoURL, message.senderName, message.senderUid);

  return (
    <div className={`message ${messageClass}`}>
      {!isMine && (
        <img src={avatarUrl} alt="" className="avatar" />
      )}
      <div className="message-content-wrapper">
        {/* Reply preview */}
        {message.replyTo && (
          <div className="reply-preview">
            <span className="reply-sender">{message.replyTo.senderName}</span>
            <span className="reply-text">{message.replyTo.text || '📎 Attachment'}</span>
          </div>
        )}

        <div
          className="message-bubble"
          onContextMenu={(e) => { e.preventDefault(); setShowActions(!showActions); }}
          onDoubleClick={() => setShowReactions(!showReactions)}
        >
          {!isMine && (
            <p className="message-user">{message.senderName || 'Anonymous'}</p>
          )}

          {/* Attachments */}
          {message.attachments?.length > 0 && (
            <div className="message-attachments">
              {message.attachments.map((att, i) =>
                isImage(att.type) ? (
                  <img
                    key={i}
                    src={att.url}
                    alt={att.name}
                    className="msg-image"
                    onClick={() => onImageClick && onImageClick(att.url)}
                  />
                ) : (
                  <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="msg-file-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span>{att.name} ({formatFileSize(att.size)})</span>
                  </a>
                )
              )}
            </div>
          )}

          {/* Message text */}
          {isEditing ? (
            <div className="edit-input-wrapper">
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(); if (e.key === 'Escape') setIsEditing(false); }}
                autoFocus
                className="edit-input"
              />
              <button className="edit-save-btn" onClick={handleEdit}>✓</button>
              <button className="edit-cancel-btn" onClick={() => setIsEditing(false)}>✕</button>
            </div>
          ) : (
            message.text && <p className="message-text">{message.text}</p>
          )}

          <div className="message-meta">
            <span className="message-time">{displayTime}</span>
            {message.editedAt && <span className="edited-tag">edited</span>}
          </div>

          {/* Reaction picker */}
          {showReactions && (
            <div className="reaction-picker">
              {REACTION_EMOJIS.map((emoji) => (
                <button key={emoji} className="reaction-picker-btn" onClick={() => handleReaction(emoji)}>{emoji}</button>
              ))}
            </div>
          )}
        </div>

        {/* Reactions */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="message-reactions">
            {Object.entries(message.reactions).map(([emoji, users]) => {
              if (!users || users.length === 0) return null;
              const active = users.includes(currentUid);
              return (
                <button key={emoji} className={`reaction-badge ${active ? 'reaction-active' : ''}`} onClick={() => handleReaction(emoji)}>
                  <span className="reaction-emoji">{emoji}</span>
                  <span className="reaction-count">{users.length}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Context menu actions */}
        {showActions && (
          <div className="message-actions-menu" ref={actionsRef}>
            <button onClick={() => { onReply && onReply(message); setShowActions(false); }}>↩️ Reply</button>
            {isMine && <button onClick={() => { setIsEditing(true); setShowActions(false); }}>✏️ Edit</button>}
            {isMine && <button onClick={handleDeleteForEveryone}>🗑️ Delete for everyone</button>}
            <button onClick={handleDeleteForMe}>🗑️ Delete for me</button>
            <button onClick={() => setShowActions(false)}>Cancel</button>
          </div>
        )}
      </div>
      {isMine && (
        <img src={avatarUrl} alt="" className="avatar" />
      )}
    </div>
  );
}

export default MessageItem;
