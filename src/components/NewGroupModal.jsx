// src/components/NewGroupModal.jsx
import React, { useState } from 'react';
import { searchUsers } from '../services/userService';
import { createGroupChat } from '../services/chatService';
import { useChatContext } from '../contexts/ChatContext';
import { getAvatarUrl } from '../utils/helpers';

function NewGroupModal({ onClose }) {
  const [step, setStep] = useState(1); // 1: select members, 2: name the group
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [creating, setCreating] = useState(false);
  const { openChat } = useChatContext();

  const handleSearch = async (term) => {
    setSearch(term);
    if (term.length < 2) { setResults([]); return; }
    try {
      const users = await searchUsers(term);
      // Filter out already selected
      const filtered = users.filter(
        (u) => !selectedUsers.find((s) => s.uid === u.uid)
      );
      setResults(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const addUser = (user) => {
    setSelectedUsers((prev) => [...prev, user]);
    setResults((prev) => prev.filter((u) => u.uid !== user.uid));
    setSearch('');
  };

  const removeUser = (uid) => {
    setSelectedUsers((prev) => prev.filter((u) => u.uid !== uid));
  };

  const handleCreate = async () => {
    if (selectedUsers.length === 0) return;
    setCreating(true);
    try {
      const chatId = await createGroupChat(
        groupName || `Group (${selectedUsers.length + 1})`,
        selectedUsers
      );
      openChat(chatId);
      onClose();
    } catch (err) {
      console.error(err);
    }
    setCreating(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{step === 1 ? 'Select Members' : 'Name Your Group'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {step === 1 ? (
            <>
              {/* Selected chips */}
              {selectedUsers.length > 0 && (
                <div className="selected-chips">
                  {selectedUsers.map((u) => (
                    <span key={u.uid} className="user-chip">
                      {u.displayName}
                      <button onClick={() => removeUser(u.uid)}>✕</button>
                    </span>
                  ))}
                </div>
              )}

              <input
                type="text"
                className="modal-search"
                placeholder="Search users to add..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
              />

              <div className="user-results">
                {results.map((u) => (
                  <button key={u.uid} className="user-result-item" onClick={() => addUser(u)}>
                    <img src={getAvatarUrl(u.photoURL, u.displayName, u.uid)} alt="" className="user-result-avatar" />
                    <div className="user-result-info">
                      <span className="user-result-name">{u.displayName}</span>
                      <span className="user-result-email">{u.email}</span>
                    </div>
                  </button>
                ))}
              </div>

              <button
                className="modal-btn primary"
                disabled={selectedUsers.length === 0}
                onClick={() => setStep(2)}
              >
                Next — {selectedUsers.length} selected
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                className="group-name-input"
                placeholder="Group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                autoFocus
              />
              <p className="no-results">
                {selectedUsers.length + 1} members (including you)
              </p>
              <div className="modal-footer">
                <button className="modal-btn" onClick={() => setStep(1)}>Back</button>
                <button className="modal-btn primary" onClick={handleCreate} disabled={creating}>
                  {creating ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewGroupModal;
