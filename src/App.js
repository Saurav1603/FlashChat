// src/App.js
import React from 'react';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SignInPage from './pages/SignInPage';
import ChatsPage from './pages/ChatsPage';

function AppContent() {
  const { user, loading, userReady } = useAuth();

  if (loading || (user && !userReady)) {
    return (
      <div className="App loading-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading FlashChat...</p>
        </div>
      </div>
    );
  }

  return user ? <ChatsPage /> : <SignInPage />;
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;