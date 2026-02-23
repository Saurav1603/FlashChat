import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  auth,
  firestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from '../firebase';
import ChatMessage from './ChatMessage';
import EmojiPicker from './EmojiPicker';
import TypingIndicator, { useTypingBroadcast } from './TypingIndicator';

function ChatRoom() {
  const messagesQuery = useMemo(() => {
    const ref = collection(firestore, 'messages');
    return query(ref, orderBy('createdAt', 'asc'), limit(100));
  }, []);

  const [messages, setMessages] = useState([]);
  const [formValue, setFormValue] = useState('');
  const dummy = useRef();
  const inputRef = useRef();
  const { broadcastTyping, clearTyping } = useTypingBroadcast();

  useEffect(() => {
    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const msgs = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ ...doc.data(), id: doc.id });
      });
      setMessages(msgs);
      // Small delay to ensure DOM is updated before scrolling
      setTimeout(() => {
        dummy.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return unsubscribe;
  }, [messagesQuery]);

  const handleInputChange = (e) => {
    setFormValue(e.target.value);
    broadcastTyping();
  };

  const handleEmojiSelect = (emoji) => {
    setFormValue((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!auth.currentUser || !formValue.trim()) return;

    const { uid, photoURL, displayName } = auth.currentUser;
    const messagesCollectionRef = collection(firestore, 'messages');

    try {
      await addDoc(messagesCollectionRef, {
        text: formValue,
        createdAt: serverTimestamp(),
        uid,
        photoURL,
        displayName: displayName || 'Anonymous User',
        reactions: {},
      });
      setFormValue('');
      clearTyping();
      dummy.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };

  // Group messages by date
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <>
      <main className="chat-messages">
        {groupedMessages.map((group, gIdx) => (
          <React.Fragment key={gIdx}>
            <div className="date-divider">
              <span>{group.date}</span>
            </div>
            {group.messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </React.Fragment>
        ))}
        <TypingIndicator />
        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage} className="message-form">
        <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        <input
          ref={inputRef}
          value={formValue}
          onChange={handleInputChange}
          placeholder="Type a message..."
          autoComplete="off"
        />
        <button type="submit" disabled={!formValue.trim()} aria-label="Send message">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </>
  );
}

function groupMessagesByDate(messages) {
  const groups = [];
  let currentDate = '';

  messages.forEach((msg) => {
    const msgDate = msg.createdAt?.toDate
      ? formatDate(msg.createdAt.toDate())
      : 'Today';

    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groups.push({ date: msgDate, messages: [msg] });
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  });

  return groups;
}

function formatDate(date) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export default ChatRoom;
