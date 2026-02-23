// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  deleteDoc,
  deleteField,
  query,
  where,
  orderBy,
  limit,
  limitToLast,
  startAfter,
  endBefore,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC-ICHyTi-5Gra2Ad-nNGQqMWk2KSwsZ1E",
  authDomain: "web-chat-app-77bfb.firebaseapp.com",
  projectId: "web-chat-app-77bfb",
  storageBucket: "web-chat-app-77bfb.firebasestorage.app",
  messagingSenderId: "253059049866",
  appId: "1:253059049866:web:915677ea7cab4128304073",
  measurementId: "G-GFLXY4FHTE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export {
  auth, firestore, storage, googleProvider,
  signInWithPopup, signOut,
  collection, addDoc, doc, getDoc, getDocs,
  updateDoc, setDoc, deleteDoc, deleteField,
  query, where, orderBy, limit, limitToLast, startAfter, endBefore,
  onSnapshot, serverTimestamp,
  arrayUnion, arrayRemove, increment, writeBatch, Timestamp,
  storageRef, uploadBytesResumable, getDownloadURL, deleteObject
};