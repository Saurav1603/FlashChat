import React, { useState } from 'react';
import { auth, signOut } from '../firebase';

function UserProfile() {
  const [isOpen, setIsOpen] = useState(false);
  const user = auth.currentUser;

  if (!user) return null;

  const { displayName, email, photoURL } = user;
  const initial = displayName ? displayName.charAt(0).toUpperCase() : 'U';

  return (
    <div className="user-profile-container">
      <button
        className="profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Your profile"
      >
        <img
          src={photoURL || `https://ui-avatars.com/api/?name=${initial}&background=random&color=fff&size=36&bold=true`}
          alt="Profile"
          className="profile-avatar-small"
        />
        <span className="online-dot"></span>
      </button>

      {isOpen && (
        <div className="profile-dropdown">
          <div className="profile-dropdown-header">
            <img
              src={photoURL || `https://ui-avatars.com/api/?name=${initial}&background=random&color=fff&size=80&bold=true`}
              alt="Profile"
              className="profile-avatar-large"
            />
            <div className="profile-info">
              <h3>{displayName || 'Anonymous'}</h3>
              <p>{email}</p>
              <span className="status-badge online">🟢 Online</span>
            </div>
          </div>
          <div className="profile-dropdown-actions">
            <button
              className="profile-action-btn sign-out-action"
              onClick={() => signOut(auth)}
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;
