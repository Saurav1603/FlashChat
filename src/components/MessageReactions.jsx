import React from 'react';
import { auth } from '../firebase';

function MessageReactions({ reactions, onReaction }) {
  if (!reactions || Object.keys(reactions).length === 0) return null;

  const currentUid = auth.currentUser?.uid;

  return (
    <div className="message-reactions">
      {Object.entries(reactions).map(([emoji, users]) => {
        if (!users || users.length === 0) return null;
        const isActive = currentUid && users.includes(currentUid);
        return (
          <button
            key={emoji}
            className={`reaction-badge ${isActive ? 'reaction-active' : ''}`}
            onClick={() => onReaction(emoji)}
            title={`${users.length} reaction${users.length > 1 ? 's' : ''}`}
          >
            <span className="reaction-emoji">{emoji}</span>
            <span className="reaction-count">{users.length}</span>
          </button>
        );
      })}
    </div>
  );
}

export default MessageReactions;
