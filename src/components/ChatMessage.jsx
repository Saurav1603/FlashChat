import React, { useState, useRef, useEffect } from 'react';
import { auth, firestore } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import MessageReactions from './MessageReactions';

const REACTION_EMOJIS = ['❤️', '😂', '👍', '😮', '😢', '🔥'];

function ChatMessage({ message }) {
  const { text, uid, photoURL, displayName, createdAt, id, reactions } = message;
  const messageClass = uid === auth.currentUser?.uid ? 'sent' : 'received';
  const [showReactions, setShowReactions] = useState(false);
  const reactionsRef = useRef(null);

  const displayTime = createdAt?.toDate
    ? createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'sending...';

  const userInitial = displayName
    ? displayName.charAt(0).toUpperCase()
    : uid
    ? uid.charAt(0).toUpperCase()
    : 'U';

  // Close reaction picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (reactionsRef.current && !reactionsRef.current.contains(event.target)) {
        setShowReactions(false);
      }
    };
    if (showReactions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showReactions]);

  const handleReaction = async (emoji) => {
    if (!auth.currentUser) return;
    const currentUid = auth.currentUser.uid;
    const msgRef = doc(firestore, 'messages', id);

    // Toggle reaction: if user already reacted with this emoji, remove it
    const currentReactions = reactions || {};
    const emojiReactors = currentReactions[emoji] || [];

    let updatedReactors;
    if (emojiReactors.includes(currentUid)) {
      updatedReactors = emojiReactors.filter((u) => u !== currentUid);
    } else {
      updatedReactors = [...emojiReactors, currentUid];
    }

    const updatedReactions = { ...currentReactions, [emoji]: updatedReactors };

    // Clean up empty arrays
    if (updatedReactors.length === 0) {
      delete updatedReactions[emoji];
    }

    try {
      await updateDoc(msgRef, { reactions: updatedReactions });
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
    setShowReactions(false);
  };

  return (
    <div className={`message ${messageClass}`}>
      <img
        src={
          photoURL ||
          `https://ui-avatars.com/api/?name=${userInitial}&background=random&color=fff&size=40&font-size=0.5&bold=true`
        }
        alt="Avatar"
        className="avatar"
      />
      <div className="message-content-wrapper">
        <div
          className="message-bubble"
          onDoubleClick={() => setShowReactions(!showReactions)}
        >
          {messageClass === 'received' && (
            <p className="message-user">{displayName || 'Anonymous'}</p>
          )}
          <p className="message-text">{text}</p>
          <span className="message-time">{displayTime}</span>

          {/* Reaction picker */}
          {showReactions && (
            <div className="reaction-picker" ref={reactionsRef}>
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  className="reaction-picker-btn"
                  onClick={() => handleReaction(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Display existing reactions */}
        <MessageReactions reactions={reactions} onReaction={handleReaction} />
      </div>
    </div>
  );
}

export default ChatMessage;
