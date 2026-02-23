// src/hooks/usePresence.js
import { useEffect, useState } from 'react';
import { subscribeToUserPresence } from '../services/userService';

/**
 * Hook to track a user's online/last-seen status in real-time.
 */
export function usePresence(uid) {
  const [presence, setPresence] = useState({ online: false, lastSeenAt: null });

  useEffect(() => {
    if (!uid) return;
    const unsub = subscribeToUserPresence(uid, (userData) => {
      setPresence({
        online: userData.online || false,
        lastSeenAt: userData.lastSeenAt || null,
      });
    });
    return unsub;
  }, [uid]);

  return presence;
}
