// src/components/Composer.jsx
import React, { useState, useRef } from 'react';
import { sendMessage, sendReplyMessage } from '../services/messageService';
import { uploadFile } from '../services/uploadService';
import { useChatContext } from '../contexts/ChatContext';
import { useTyping } from '../hooks/useTyping';
import EmojiPicker from './EmojiPicker';

function Composer({ replyTo, onClearReply }) {
  const { activeChatId } = useChatContext();
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef();
  const fileInputRef = useRef();
  const { broadcastTyping, clearTyping } = useTyping(activeChatId);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!activeChatId || (!text.trim() && !uploading)) return;

    const currentText = text;
    setText('');
    clearTyping();

    try {
      if (replyTo) {
        await sendReplyMessage(activeChatId, currentText, replyTo);
        onClearReply && onClearReply();
      } else {
        await sendMessage(activeChatId, currentText);
      }
    } catch (err) {
      console.error('Send error:', err);
      setText(currentText); // Restore on failure
    }
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
    broadcastTyping();
  };

  const handleEmojiSelect = (emoji) => {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeChatId) return;

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Max 10MB.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const { promise } = uploadFile(activeChatId, file, (progress) => {
        setUploadProgress(progress);
      });
      const attachment = await promise;
      await sendMessage(activeChatId, text, [attachment]);
      setText('');
      clearTyping();
    } catch (err) {
      console.error('Upload error:', err);
    }

    setUploading(false);
    setUploadProgress(0);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="composer-wrapper">
      {/* Reply bar */}
      {replyTo && (
        <div className="reply-bar">
          <div className="reply-bar-content">
            <span className="reply-bar-sender">{replyTo.senderName}</span>
            <span className="reply-bar-text">{replyTo.text || '📎 Attachment'}</span>
          </div>
          <button className="reply-bar-close" onClick={onClearReply}>✕</button>
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="upload-progress-bar">
          <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }}></div>
          <span className="upload-progress-text">{Math.round(uploadProgress)}%</span>
        </div>
      )}

      <form onSubmit={handleSend} className="message-form">
        <EmojiPicker onEmojiSelect={handleEmojiSelect} />

        <button
          type="button"
          className="attach-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Attach file"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="image/*,.pdf,.doc,.docx,.txt,.zip"
        />

        <input
          ref={inputRef}
          value={text}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          autoComplete="off"
          disabled={uploading}
        />

        <button
          type="submit"
          disabled={!text.trim() && !uploading}
          aria-label="Send message"
          className="send-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  );
}

export default Composer;
