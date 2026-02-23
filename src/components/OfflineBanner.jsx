// src/components/OfflineBanner.jsx
import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="offline-banner">
      <span>⚠️ You are offline. Messages will be sent when you reconnect.</span>
    </div>
  );
}

export default OfflineBanner;
