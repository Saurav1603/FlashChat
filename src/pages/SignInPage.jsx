// src/pages/SignInPage.jsx
import React from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

function SignInPage() {
  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Sign-in error:', err);
    }
  };

  return (
    <div className="sign-in-page">
      <div className="sign-in-container">
        <div className="sign-in-hero">
          <span className="sign-in-logo">💬</span>
          <h1>FlashChat</h1>
          <p className="sign-in-tagline">Fast, secure, real-time messaging</p>
          <div className="sign-in-features">
            <div className="feature-item">
              <span>🔒</span>
              <span>Secure messaging</span>
            </div>
            <div className="feature-item">
              <span>👥</span>
              <span>Group chats</span>
            </div>
            <div className="feature-item">
              <span>📎</span>
              <span>File sharing</span>
            </div>
            <div className="feature-item">
              <span>⚡</span>
              <span>Real-time</span>
            </div>
          </div>
          <button onClick={signIn} className="sign-in-btn">
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              width="20"
              height="20"
            />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;
