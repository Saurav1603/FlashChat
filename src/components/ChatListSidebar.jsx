// src/components/ChatListSidebar.jsx
import React, { useState } from 'react';
import { useChatContext } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import ChatListItem from './ChatListItem';
import NewChatModal from './NewChatModal';
import NewGroupModal from './NewGroupModal';
import ThemeToggle from './ThemeToggle';
import UserProfile from './UserProfile';

function ChatListSidebar() {
  const { user } = useAuth();
  const { chats, chatsLoading } = useChatContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);

  const filteredChats = chats.filter((chat) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    // Search by group name or other member's name
    if (chat.type === 'group') {
      return chat.groupName?.toLowerCase().includes(term);
    }
    // Direct chat: search other member's name
    const otherUid = chat.memberUids?.find((uid) => uid !== user?.uid);
    const otherName = chat.members?.[otherUid]?.displayName || '';
    return otherName.toLowerCase().includes(term);
  });

  return (
    <aside className="sidebar">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <h2 className="sidebar-title">💬 FlashChat</h2>
        <div className="sidebar-header-right">
          <ThemeToggle />
          <UserProfile />
        </div>
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <input
          type="text"
          placeholder="Search chats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Action Buttons */}
      <div className="sidebar-actions">
        <button className="new-chat-btn" onClick={() => setShowNewChat(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          New Chat
        </button>
        <button className="new-group-btn" onClick={() => setShowNewGroup(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          New Group
        </button>
      </div>

      {/* Chat List */}
      <div className="chat-list">
        {chatsLoading ? (
          <div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton-item">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-lines">
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="chat-list-empty">
            <span>💬</span>
            <p>{searchTerm ? 'No chats found' : 'No conversations yet'}</p>
            <p>Start a new chat to begin messaging</p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <ChatListItem key={chat.id} chat={chat} />
          ))
        )}
      </div>

      {/* Modals */}
      {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} />}
      {showNewGroup && <NewGroupModal onClose={() => setShowNewGroup(false)} />}
    </aside>
  );
}

export default ChatListSidebar;
