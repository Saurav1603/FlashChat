// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { createOrUpdateUser, updatePresence } from '../services/userService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, loading] = useAuthState(auth);
  const [userReady, setUserReady] = useState(false);

  useEffect(() => {
    if (user) {
      // Sync user profile to Firestore and set online
      createOrUpdateUser(user).then(() => {
        updatePresence(true);
        setUserReady(true);
      });

      // Set offline on window close
      const handleBeforeUnload = () => updatePresence(false);
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        updatePresence(false);
      };
    } else {
      setUserReady(false);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, userReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
