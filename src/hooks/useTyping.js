// src/hooks/useTyping.js
import { useEffect, useState, useCallback } from 'react';
import { auth, firestore, doc, setDoc, onSnapshot } from '../firebase';

/**
 * Per-chat typing indicator hook.
 * Broadcasts typing status and listens for others typing.
 */
export function useTyping(chatId) {
  const [typingUsers, setTypingUsers] = useState([]);

  // Listen for typing in this chat
  useEffect(() => {
    if (!chatId) return;
    const typingRef = doc(firestore, 'typing', chatId);
    const unsub = onSnapshot(typingRef, (snap) => {
      if (!snap.exists()) { setTypingUsers([]); return; }
      const data = snap.data();
      const currentUid = auth.currentUser?.uid;
      const now = Date.now();

      const active = Object.entries(data)
        .filter(([uid, info]) => uid !== currentUid && now - (info?.timestamp || 0) < 5000)
        .map(([, info]) => info.displayName || 'Someone');

      setTypingUsers(active);
    });
    return unsub;
  }, [chatId]);

  // Broadcast typing
  const broadcastTyping = useCallback(() => {
    if (!chatId || !auth.currentUser) return;
    const { uid, displayName } = auth.currentUser;
    const typingRef = doc(firestore, 'typing', chatId);
    setDoc(typingRef, {
      [uid]: { displayName: displayName || 'Anonymous', timestamp: Date.now() },
    }, { merge: true }).catch(() => {});
  }, [chatId]);

  const clearTyping = useCallback(() => {
    if (!chatId || !auth.currentUser) return;
    const { uid } = auth.currentUser;
    const typingRef = doc(firestore, 'typing', chatId);
    setDoc(typingRef, {
      [uid]: { displayName: '', timestamp: 0 },
    }, { merge: true }).catch(() => {});
  }, [chatId]);

  return { typingUsers, broadcastTyping, clearTyping };
}
