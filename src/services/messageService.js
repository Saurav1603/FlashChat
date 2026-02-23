// src/services/messageService.js
import {
  firestore, auth,
  collection, addDoc, doc, updateDoc, getDoc, getDocs,
  query, orderBy, limit, startAfter,
  onSnapshot, serverTimestamp
} from '../firebase';

const PAGE_SIZE = 40;

/**
 * Subscribe to the latest messages in a chat (real-time).
 */
export function subscribeToMessages(chatId, callback, msgLimit = PAGE_SIZE) {
  const msgsRef = collection(firestore, 'chats', chatId, 'messages');
  const q = query(msgsRef, orderBy('createdAt', 'desc'), limit(msgLimit));

  return onSnapshot(q, (snapshot) => {
    const msgs = [];
    snapshot.forEach((d) => {
      msgs.push({ id: d.id, ...d.data() });
    });
    // Reverse to show oldest first
    callback(msgs.reverse());
  });
}

/**
 * Load older messages (pagination).
 */
export async function loadOlderMessages(chatId, oldestMessage) {
  const msgsRef = collection(firestore, 'chats', chatId, 'messages');
  const q = query(
    msgsRef,
    orderBy('createdAt', 'desc'),
    startAfter(oldestMessage.createdAt),
    limit(PAGE_SIZE)
  );
  const snap = await getDocs(q);
  const msgs = [];
  snap.forEach((d) => msgs.push({ id: d.id, ...d.data() }));
  return msgs.reverse();
}

/**
 * Send a text message.
 */
export async function sendMessage(chatId, text, attachments = []) {
  const user = auth.currentUser;
  if (!user || (!text.trim() && attachments.length === 0)) return;

  const msgsRef = collection(firestore, 'chats', chatId, 'messages');

  const messageData = {
    senderUid: user.uid,
    senderName: user.displayName || 'Anonymous',
    senderPhotoURL: user.photoURL || '',
    text: text.trim(),
    createdAt: serverTimestamp(),
    reactions: {},
    attachments: attachments,
    replyTo: null,
    editedAt: null,
    deletedFor: [],
  };

  await addDoc(msgsRef, messageData);

  // Update the chat's last message
  const chatRef = doc(firestore, 'chats', chatId);
  const previewText = text.trim() || (attachments.length > 0 ? '📎 Attachment' : '');
  await updateDoc(chatRef, {
    lastMessageText: previewText,
    lastMessageAt: serverTimestamp(),
    lastMessageSenderUid: user.uid,
  });
}

/**
 * Send a message that is a reply.
 */
export async function sendReplyMessage(chatId, text, replyTo, attachments = []) {
  const user = auth.currentUser;
  if (!user) return;

  const msgsRef = collection(firestore, 'chats', chatId, 'messages');
  await addDoc(msgsRef, {
    senderUid: user.uid,
    senderName: user.displayName || 'Anonymous',
    senderPhotoURL: user.photoURL || '',
    text: text.trim(),
    createdAt: serverTimestamp(),
    reactions: {},
    attachments,
    replyTo: {
      id: replyTo.id,
      text: replyTo.text || '',
      senderName: replyTo.senderName || 'Unknown',
    },
    editedAt: null,
    deletedFor: [],
  });

  const chatRef = doc(firestore, 'chats', chatId);
  await updateDoc(chatRef, {
    lastMessageText: text.trim() || '📎 Attachment',
    lastMessageAt: serverTimestamp(),
    lastMessageSenderUid: user.uid,
  });
}

/**
 * Edit a message (only own messages).
 */
export async function editMessage(chatId, messageId, newText) {
  const msgRef = doc(firestore, 'chats', chatId, 'messages', messageId);
  await updateDoc(msgRef, {
    text: newText,
    editedAt: serverTimestamp(),
  });
}

/**
 * Delete message for everyone (only sender).
 */
export async function deleteMessageForEveryone(chatId, messageId) {
  const msgRef = doc(firestore, 'chats', chatId, 'messages', messageId);
  await updateDoc(msgRef, {
    text: '',
    attachments: [],
    deletedForEveryone: true,
  });
}

/**
 * Delete message for self only.
 */
export async function deleteMessageForMe(chatId, messageId) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  const msgRef = doc(firestore, 'chats', chatId, 'messages', messageId);
  const snap = await getDoc(msgRef);
  if (!snap.exists()) return;
  const existing = snap.data().deletedFor || [];
  await updateDoc(msgRef, {
    deletedFor: [...existing, uid],
  });
}

/**
 * Toggle a reaction on a message.
 */
export async function toggleReaction(chatId, messageId, emoji) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const msgRef = doc(firestore, 'chats', chatId, 'messages', messageId);
  const snap = await getDoc(msgRef);
  if (!snap.exists()) return;

  const reactions = snap.data().reactions || {};
  const users = reactions[emoji] || [];

  let updated;
  if (users.includes(uid)) {
    updated = users.filter((u) => u !== uid);
  } else {
    updated = [...users, uid];
  }

  const newReactions = { ...reactions, [emoji]: updated };
  if (updated.length === 0) delete newReactions[emoji];

  await updateDoc(msgRef, { reactions: newReactions });
}

/**
 * Mark messages as seen by current user.
 */
export async function markChatAsSeen(chatId) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  const chatRef = doc(firestore, 'chats', chatId);
  await updateDoc(chatRef, {
    [`seenBy.${uid}`]: serverTimestamp(),
  }).catch(() => {});
}
