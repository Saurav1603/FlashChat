// src/services/userService.js
import {
  firestore, auth,
  doc, getDoc, getDocs, setDoc, updateDoc,
  collection, query, where, limit,
  serverTimestamp, onSnapshot
} from '../firebase';

/**
 * Create or update user profile in Firestore on sign-in.
 */
export async function createOrUpdateUser(user) {
  const userRef = doc(firestore, 'users', user.uid);
  const snap = await getDoc(userRef);

  const displayName = user.displayName || 'Anonymous';
  const userData = {
    displayName,
    displayNameLower: displayName.toLowerCase(),
    email: user.email || '',
    photoURL: user.photoURL || '',
    lastSeenAt: serverTimestamp(),
    online: true,
  };

  if (!snap.exists()) {
    // New user
    userData.createdAt = serverTimestamp();
    userData.statusMessage = '';
    await setDoc(userRef, userData);
  } else {
    // Existing user — update last seen + photo
    await updateDoc(userRef, userData);
  }
}

/**
 * Update user's online presence.
 */
export async function updatePresence(online = true) {
  if (!auth.currentUser) return;
  const userRef = doc(firestore, 'users', auth.currentUser.uid);
  await updateDoc(userRef, {
    lastSeenAt: serverTimestamp(),
    online: online,
  }).catch(() => {});
}

/**
 * Search users by displayName (case-insensitive) or email prefix.
 * Falls back to case-sensitive displayName search for users not yet migrated.
 */
export async function searchUsers(searchTerm) {
  if (!searchTerm || searchTerm.length < 2) return [];

  const usersRef = collection(firestore, 'users');
  const lowerTerm = searchTerm.toLowerCase();
  const lowerEnd = lowerTerm.slice(0, -1) + String.fromCharCode(lowerTerm.charCodeAt(lowerTerm.length - 1) + 1);

  // Search by displayNameLower prefix (case-insensitive — works for migrated users)
  const nameLowerQuery = query(
    usersRef,
    where('displayNameLower', '>=', lowerTerm),
    where('displayNameLower', '<', lowerEnd),
    limit(20)
  );

  // Fallback: search by original displayName prefix (for users not yet migrated)
  const capTerm = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1).toLowerCase();
  const capEnd = capTerm.slice(0, -1) + String.fromCharCode(capTerm.charCodeAt(capTerm.length - 1) + 1);
  const nameOrigQuery = query(
    usersRef,
    where('displayName', '>=', capTerm),
    where('displayName', '<', capEnd),
    limit(20)
  );

  // Search by email prefix (emails are always lowercase)
  const emailLower = searchTerm.toLowerCase();
  const emailEnd = emailLower.slice(0, -1) + String.fromCharCode(emailLower.charCodeAt(emailLower.length - 1) + 1);
  const emailQuery = query(
    usersRef,
    where('email', '>=', emailLower),
    where('email', '<', emailEnd),
    limit(20)
  );

  const [nameLowerSnap, nameOrigSnap, emailSnap] = await Promise.all([
    getDocs(nameLowerQuery).catch(() => ({ forEach: () => {} })),
    getDocs(nameOrigQuery).catch(() => ({ forEach: () => {} })),
    getDocs(emailQuery).catch(() => ({ forEach: () => {} })),
  ]);

  const resultMap = {};
  const addResults = (snap) => {
    snap.forEach((d) => {
      if (d.id !== auth.currentUser?.uid) {
        resultMap[d.id] = { uid: d.id, ...d.data() };
      }
    });
  };

  addResults(nameLowerSnap);
  addResults(nameOrigSnap);
  addResults(emailSnap);

  return Object.values(resultMap);
}

/**
 * Get a single user's profile.
 */
export async function getUserProfile(uid) {
  const userRef = doc(firestore, 'users', uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) return { uid: snap.id, ...snap.data() };
  return null;
}

/**
 * Listen to a user's online/presence status.
 */
export function subscribeToUserPresence(uid, callback) {
  const userRef = doc(firestore, 'users', uid);
  return onSnapshot(userRef, (snap) => {
    if (snap.exists()) {
      callback({ uid: snap.id, ...snap.data() });
    }
  });
}
