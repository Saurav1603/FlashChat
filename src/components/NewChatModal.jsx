// src/components/NewChatModal.jsx
import React, { useState } from 'react';
import { searchUsers } from '../services/userService';
import { createDirectChat } from '../services/chatService';
import { useChatContext } from '../contexts/ChatContext';
import { getAvatarUrl } from '../utils/helpers';

function NewChatModal({ onClose }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const { openChat } = useChatContext();

  const handleSearch = async (term) => {
    setSearch(term);
    if (term.length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const users = await searchUsers(term);
      setResults(users);
    } catch (err) {
      console.error('Search error:', err);
    }
    setSearching(false);
  };

  const handleSelectUser = async (user) => {
    try {
      const chatId = await createDirectChat(user);
      openChat(chatId);
      onClose();
    } catch (err) {
      console.error('Error creating chat:', err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>New Chat</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <input
            type="text"
            className="modal-search"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />

          {searching && <p className="no-results">Searching...</p>}

          {results.length > 0 && (
            <div className="user-results">
              {results.map((u) => (
                <button
                  key={u.uid}
                  className="user-result-item"
                  onClick={() => handleSelectUser(u)}
                >
                  <img
                    src={getAvatarUrl(u.photoURL, u.displayName, u.uid)}
                    alt={u.displayName}
                    className="user-result-avatar"
                  />
                  <div className="user-result-info">
                    <span className="user-result-name">{u.displayName}</span>
                    <span className="user-result-email">{u.email}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {search.length >= 2 && !searching && results.length === 0 && (
            <p className="no-results">No users found. Try a different name.</p>
          )}

          {search.length < 2 && (
            <p className="no-results">Type at least 2 characters to search</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewChatModal;
