// src/components/ChatInfoDrawer.jsx
import React, { useState } from 'react';
import { auth } from '../firebase';
import { useChatContext } from '../contexts/ChatContext';
import { leaveGroup, updateGroupInfo, addMemberToGroup } from '../services/chatService';
import { searchUsers } from '../services/userService';
import { getAvatarUrl } from '../utils/helpers';

function ChatInfoDrawer({ onClose }) {
  const { activeChat, closeChat } = useChatContext();
  const currentUid = auth.currentUser?.uid;
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(activeChat?.groupName || '');
  const [showAddMember, setShowAddMember] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);

  if (!activeChat) return null;

  const isGroup = activeChat.type === 'group';
  const isAdmin = activeChat.members?.[currentUid]?.role === 'admin' || activeChat.createdBy === currentUid;
  const members = activeChat.members || {};

  const handleRename = async () => {
    if (newName.trim() && newName !== activeChat.groupName) {
      await updateGroupInfo(activeChat.id, { groupName: newName.trim() });
    }
    setEditingName(false);
  };

  const handleLeave = async () => {
    if (window.confirm('Leave this group?')) {
      await leaveGroup(activeChat.id);
      closeChat();
      onClose();
    }
  };

  const handleSearchMember = async (term) => {
    setSearch(term);
    if (term.length < 2) { setResults([]); return; }
    const users = await searchUsers(term);
    const existing = activeChat.memberUids || [];
    setResults(users.filter((u) => !existing.includes(u.uid)));
  };

  const handleAddMember = async (user) => {
    await addMemberToGroup(activeChat.id, user);
    setSearch('');
    setResults([]);
    setShowAddMember(false);
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3>Chat Info</h3>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>

        <div className="drawer-body">
          {/* Group name (editable) */}
          {isGroup && (
            <div className="drawer-section">
              {editingName ? (
                <div className="inline-edit">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                    autoFocus
                  />
                  <button onClick={handleRename}>✓</button>
                  <button onClick={() => setEditingName(false)}>✕</button>
                </div>
              ) : (
                <div className="drawer-group-name">
                  <h4>{activeChat.groupName}</h4>
                  {isAdmin && (
                    <button className="edit-name-btn" onClick={() => setEditingName(true)}>✏️</button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Members */}
          {isGroup && (
            <div className="drawer-section">
              <h4 className="drawer-section-title">
                Members ({Object.keys(members).length})
              </h4>
              <div className="members-list">
                {Object.entries(members).map(([uid, member]) => (
                  <div key={uid} className="member-item">
                    <img
                      src={getAvatarUrl(member.photoURL, member.displayName, uid)}
                      alt=""
                      className="member-avatar"
                    />
                    <div className="member-info">
                      <span className="member-name">
                        {member.displayName}
                        {uid === currentUid && ' (You)'}
                      </span>
                      {(member.role === 'admin' || activeChat.createdBy === uid) && (
                        <span className="admin-badge">Admin</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {isAdmin && (
                <div className="drawer-action-section">
                  {showAddMember ? (
                    <div className="add-member-search">
                      <input
                        placeholder="Search user to add..."
                        value={search}
                        onChange={(e) => handleSearchMember(e.target.value)}
                        autoFocus
                      />
                      {results.map((u) => (
                        <button key={u.uid} className="user-result-item" onClick={() => handleAddMember(u)}>
                          <img src={getAvatarUrl(u.photoURL, u.displayName, u.uid)} alt="" className="user-result-avatar" />
                          <span>{u.displayName}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button className="drawer-btn" onClick={() => setShowAddMember(true)}>
                      ➕ Add Member
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="drawer-section">
            {isGroup && (
              <button className="drawer-btn danger" onClick={handleLeave}>
                🚪 Leave Group
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInfoDrawer;
