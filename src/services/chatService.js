// src/services/chatService.js
import {
  firestore, auth,
  doc, getDoc, setDoc, updateDoc, deleteField,
  collection, query, where, orderBy,
  serverTimestamp, arrayUnion, arrayRemove, onSnapshot
} from '../firebase';
import { getDirectChatId } from '../utils/helpers';

/**
 * Subscribe to the current user's chat list, sorted by last message time.
 * Falls back to an unordered query if the composite index is not ready.
 */
export function subscribeToChats(uid, callback) {
  const chatsRef = collection(firestore, 'chats');

  function buildSnapshot(q) {
    return onSnapshot(
      q,
      (snapshot) => {
        const chats = [];
        snapshot.forEach((d) => {
          chats.push({ id: d.id, ...d.data() });
        });
        // Client-side sort as safety net
        chats.sort((a, b) => {
          const ta = a.lastMessageAt?.toMillis?.() || 0;
          const tb = b.lastMessageAt?.toMillis?.() || 0;
          return tb - ta;
        });
        callback(chats);
      },
      (error) => {
        console.error('subscribeToChats error:', error);
        // Fallback: query without orderBy (no composite index needed)
        const fallbackQ = query(
          chatsRef,
          where('memberUids', 'array-contains', uid)
        );
        unsub = buildSnapshot(fallbackQ);
      }
    );
  }

  // Try the indexed query first
  const orderedQ = query(
    chatsRef,
    where('memberUids', 'array-contains', uid),
    orderBy('lastMessageAt', 'desc')
  );
  let unsub = buildSnapshot(orderedQ);

  // Return a function that always unsubscribes the latest listener
  return () => unsub();
}

/**
 * Create or find an existing 1:1 direct chat.
 */
export async function createDirectChat(otherUser) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  const chatId = getDirectChatId(currentUser.uid, otherUser.uid);
  const chatRef = doc(firestore, 'chats', chatId);
  const existing = await getDoc(chatRef);

  if (existing.exists()) return chatId;

  await setDoc(chatRef, {
    type: 'direct',
    memberUids: [currentUser.uid, otherUser.uid],
    members: {
      [currentUser.uid]: {
        displayName: currentUser.displayName || 'Anonymous',
        photoURL: currentUser.photoURL || '',
      },
      [otherUser.uid]: {
        displayName: otherUser.displayName || 'Anonymous',
        photoURL: otherUser.photoURL || '',
      },
    },
    createdAt: serverTimestamp(),
    createdBy: currentUser.uid,
    lastMessageText: '',
    lastMessageAt: serverTimestamp(),
    lastMessageSenderUid: '',
  });

  return chatId;
}

/**
 * Create a new group chat.
 */
export async function createGroupChat(groupName, memberUsers) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  const allUids = [currentUser.uid, ...memberUsers.map((u) => u.uid)];
  const members = {};
  members[currentUser.uid] = {
    displayName: currentUser.displayName || 'Anonymous',
    photoURL: currentUser.photoURL || '',
    role: 'admin',
  };
  memberUsers.forEach((u) => {
    members[u.uid] = {
      displayName: u.displayName || 'Anonymous',
      photoURL: u.photoURL || '',
      role: 'member',
    };
  });

  const chatRef = doc(collection(firestore, 'chats'));
  await setDoc(chatRef, {
    type: 'group',
    groupName: groupName || 'New Group',
    groupPhotoURL: '',
    memberUids: allUids,
    members,
    createdAt: serverTimestamp(),
    createdBy: currentUser.uid,
    lastMessageText: '',
    lastMessageAt: serverTimestamp(),
    lastMessageSenderUid: '',
  });

  return chatRef.id;
}

/**
 * Get a single chat by ID.
 */
export async function getChat(chatId) {
  const chatRef = doc(firestore, 'chats', chatId);
  const snap = await getDoc(chatRef);
  if (snap.exists()) return { id: snap.id, ...snap.data() };
  return null;
}

/**
 * Subscribe to a single chat.
 */
export function subscribeToChat(chatId, callback) {
  const chatRef = doc(firestore, 'chats', chatId);
  return onSnapshot(chatRef, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    }
  });
}

/**
 * Add a member to a group chat.
 */
export async function addMemberToGroup(chatId, user) {
  const chatRef = doc(firestore, 'chats', chatId);
  await updateDoc(chatRef, {
    memberUids: arrayUnion(user.uid),
    [`members.${user.uid}`]: {
      displayName: user.displayName || 'Anonymous',
      photoURL: user.photoURL || '',
      role: 'member',
    },
  });
}

/**
 * Remove a member from a group chat.
 */
export async function removeMemberFromGroup(chatId, uid) {
  const chatRef = doc(firestore, 'chats', chatId);
  await updateDoc(chatRef, {
    memberUids: arrayRemove(uid),
    [`members.${uid}`]: deleteField(),
  });
}

/**
 * Leave a group chat.
 */
export async function leaveGroup(chatId) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  const chatRef = doc(firestore, 'chats', chatId);
  await updateDoc(chatRef, {
    memberUids: arrayRemove(uid),
  });
}

/**
 * Update group info (name).
 */
export async function updateGroupInfo(chatId, data) {
  const chatRef = doc(firestore, 'chats', chatId);
  await updateDoc(chatRef, data);
}
