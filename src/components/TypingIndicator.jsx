import React, { useEffect, useState, useCallback } from 'react';
import { auth, firestore } from '../firebase';
import { doc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';

function TypingIndicator() {
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    // Listen to 'typing' collection
    const typingRef = doc(firestore, 'typing', 'status');
    const unsubscribe = onSnapshot(typingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const currentUid = auth.currentUser?.uid;
        const now = Date.now();

        // Filter: show users typing within last 5 seconds, exclude self
        const activeTypers = Object.entries(data)
          .filter(([uid, info]) => uid !== currentUid && now - info.timestamp < 5000)
          .map(([, info]) => info.displayName || 'Someone');

        setTypingUsers(activeTypers);
      } else {
        setTypingUsers([]);
      }
    });

    return unsubscribe;
  }, []);

  if (typingUsers.length === 0) return null;

  const text =
    typingUsers.length === 1
      ? `${typingUsers[0]} is typing`
      : typingUsers.length === 2
      ? `${typingUsers[0]} and ${typingUsers[1]} are typing`
      : `${typingUsers[0]} and ${typingUsers.length - 1} others are typing`;

  return (
    <div className="typing-indicator">
      <div className="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <span className="typing-text">{text}</span>
    </div>
  );
}

// Hook for broadcasting typing status
export function useTypingBroadcast() {
  const broadcastTyping = useCallback(() => {
    if (!auth.currentUser) return;
    const { uid, displayName } = auth.currentUser;
    const typingRef = doc(firestore, 'typing', 'status');

    setDoc(
      typingRef,
      {
        [uid]: {
          displayName: displayName || 'Anonymous',
          timestamp: Date.now(),
        },
      },
      { merge: true }
    ).catch(() => {});
  }, []);

  const clearTyping = useCallback(() => {
    if (!auth.currentUser) return;
    const { uid } = auth.currentUser;
    const typingRef = doc(firestore, 'typing', 'status');

    setDoc(
      typingRef,
      {
        [uid]: {
          displayName: '',
          timestamp: 0,
        },
      },
      { merge: true }
    ).catch(() => {});
  }, []);

  return { broadcastTyping, clearTyping };
}

export default TypingIndicator;
