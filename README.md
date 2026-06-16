# 💬 FlashChat — Real-Time Messaging App

Live link- https://web-chat-app-77bfb.web.app/

A full-featured, WhatsApp/Messenger-style real-time chat application built with **React 19** and **Firebase 11**.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-11-orange?logo=firebase)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### Core Messaging
- **1:1 Direct Chats** — Start private conversations with any user
- **Group Chats** — Create groups, add/remove members, rename groups
- **Real-time Messages** — Instant message delivery via Firestore listeners
- **Message Replies** — Reply to specific messages with preview
- **Edit & Delete** — Edit your messages or delete for everyone/just you
- **Emoji Reactions** — React to messages with emoji (❤️ 😂 👍 😮 😢 🔥)
- **File Sharing** — Upload and share images, PDFs, documents (up to 10MB)

### Chat Experience
- **Emoji Picker** — Categorized emoji picker in the composer
- **Typing Indicators** — See who's typing in real-time
- **Online/Offline Presence** — User presence tracking with last seen
- **Message Pagination** — Infinite scroll to load older messages
- **Date Dividers** — Messages grouped by date
- **Image Lightbox** — Full-screen image viewer

### User Interface
- **2-Column Layout** — Sidebar chat list + chat window (like WhatsApp Web)
- **Dark/Light Theme** — Toggle with persistence in localStorage
- **Responsive Design** — Full mobile support with stacked layout
- **Glassmorphism UI** — Modern backdrop-blur effects
- **Smooth Animations** — Message entrance, modals, drawers
- **Skeleton Loading** — Loading states for chat list
- **Offline Banner** — Visual indicator when connection is lost

### Security & Auth
- **Google Authentication** — Secure sign-in via Firebase Auth
- **Firestore Security Rules** — Members-only chat access
- **Storage Security Rules** — Authenticated upload with size limits

---

## 🏗️ Architecture

```
src/
├── components/           # UI Components
│   ├── ChatHeader.jsx        # Chat name, presence, info button
│   ├── ChatInfoDrawer.jsx    # Right drawer — members, settings
│   ├── ChatListItem.jsx      # Individual chat row in sidebar
│   ├── ChatListSidebar.jsx   # Left sidebar — search, chat list
│   ├── ChatWindow.jsx        # Main chat panel with messages
│   ├── Composer.jsx           # Message input + emoji + file attach
│   ├── EmojiPicker.jsx        # Categorized emoji picker
│   ├── ImageViewer.jsx        # Full-screen image lightbox
│   ├── MessageItem.jsx        # Individual message bubble
│   ├── NewChatModal.jsx       # Search users → start 1:1 chat
│   ├── NewGroupModal.jsx      # Multi-step group creation
│   ├── OfflineBanner.jsx      # Offline connection banner
│   ├── ThemeToggle.jsx        # Dark/light mode switch
│   └── UserProfile.jsx        # Profile dropdown with sign-out
├── contexts/             # React Context Providers
│   ├── AuthContext.js         # Auth state + user profile sync
│   └── ChatContext.js         # Chat list + active chat tracking
├── hooks/                # Custom React Hooks
│   ├── useMessages.js         # Message subscription + pagination
│   ├── useOnlineStatus.js     # Browser online/offline detection
│   ├── usePresence.js         # User presence tracking
│   └── useTyping.js           # Per-chat typing indicators
├── pages/                # Page-level Components
│   ├── ChatsPage.jsx          # Main app page (sidebar + chat)
│   └── SignInPage.jsx         # Landing/auth page
├── services/             # Firebase Service Layer
│   ├── chatService.js         # Chat CRUD operations
│   ├── messageService.js      # Message CRUD + reactions + pagination
│   ├── uploadService.js       # File upload to Firebase Storage
│   └── userService.js         # User profiles + presence + search
├── utils/
│   └── helpers.js             # Shared utility functions
├── firebase.js           # Firebase initialization + exports
├── App.js                # Root component with AuthProvider
├── App.css               # Complete design system
└── index.js              # React entry point
```

## � Firestore Data Model

```
users/{uid}
  ├── displayName, email, photoURL
  ├── online: boolean
  ├── lastSeenAt: Timestamp
  └── statusMessage: string

chats/{chatId}
  ├── type: "direct" | "group"
  ├── memberUids: string[]
  ├── members: { [uid]: { displayName, photoURL, role } }
  ├── lastMessageText, lastMessageAt, lastMessageSenderUid
  ├── groupName?, groupPhotoURL?
  └── createdBy, createdAt
  │
  └── messages/{msgId}
      ├── senderUid, senderName, senderPhotoURL
      ├── text, createdAt
      ├── attachments: [{ url, name, type, size }]
      ├── reactions: { "❤️": [uid1, uid2], ... }
      ├── replyTo: { msgId, senderName, text }
      └── editedAt?, deletedForEveryone?, deletedFor: [uid]

typing/{chatId}
  └── { [uid]: { displayName, timestamp } }
```

---

## 🚀 Setup

### Prerequisites
- Node.js 18+
- Firebase project with Firestore, Auth, Storage, and Hosting enabled

### Install & Run

```bash
npm install
npm start
```

### Build & Deploy

```bash
npm run build
firebase deploy
```

### Deploy Security Rules

```bash
firebase deploy --only firestore:rules,storage:rules
```

---

## �️ Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI Framework |
| Firebase Auth | Google sign-in |
| Cloud Firestore | Real-time database |
| Firebase Storage | File/image uploads |
| Firebase Hosting | Production deployment |
| CSS Custom Properties | Theme system |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
