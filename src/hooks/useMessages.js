// src/hooks/useMessages.js
import { useState, useEffect, useCallback } from 'react';
import { subscribeToMessages, loadOlderMessages } from '../services/messageService';

/**
 * Hook to subscribe to messages in a chat with pagination support.
 */
export function useMessages(chatId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToMessages(chatId, (msgs) => {
      setMessages(msgs);
      setLoading(false);
    });
    return unsub;
  }, [chatId]);

  const fetchOlder = useCallback(async () => {
    if (!chatId || !messages.length || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const older = await loadOlderMessages(chatId, messages[0]);
      if (older.length === 0) {
        setHasMore(false);
      } else {
        setMessages((prev) => [...older, ...prev]);
      }
    } catch (err) {
      console.error('Error loading older messages:', err);
    }
    setLoadingMore(false);
  }, [chatId, messages, loadingMore, hasMore]);

  return { messages, loading, hasMore, loadingMore, fetchOlder };
}
