// src/utils/helpers.js

/**
 * Generate a deterministic chat ID for 1:1 direct messages.
 * Sorts UIDs alphabetically so both users get the same ID.
 */
export function getDirectChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

/**
 * Format a Firestore timestamp to a short time string.
 */
export function formatTime(timestamp) {
  if (!timestamp?.toDate) return '';
  return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Format a Firestore timestamp for the chat list (relative).
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp?.toDate) return '';
  const date = timestamp.toDate();
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format a date for message date dividers.
 */
export function formatDateDivider(date) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

/**
 * Group messages by date for rendering with dividers.
 */
export function groupMessagesByDate(messages) {
  const groups = [];
  let currentDate = '';

  messages.forEach((msg) => {
    const msgDate = msg.createdAt?.toDate
      ? formatDateDivider(msg.createdAt.toDate())
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

/**
 * Get user initial for avatar fallback.
 */
export function getUserInitial(name, uid) {
  if (name) return name.charAt(0).toUpperCase();
  if (uid) return uid.charAt(0).toUpperCase();
  return 'U';
}

/**
 * Build fallback avatar URL.
 */
export function getAvatarUrl(photoURL, name, uid) {
  if (photoURL) return photoURL;
  const initial = getUserInitial(name, uid);
  return `https://ui-avatars.com/api/?name=${initial}&background=random&color=fff&size=80&font-size=0.45&bold=true`;
}

/**
 * Truncate text for chat list previews.
 */
export function truncate(text, maxLen = 40) {
  if (!text) return '';
  return text.length > maxLen ? text.substring(0, maxLen) + '…' : text;
}

/**
 * Format file size to human-readable string.
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}
