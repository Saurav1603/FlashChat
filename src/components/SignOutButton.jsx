import React from 'react';
import { auth, signOut } from '../firebase';

function SignOutButton() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => signOut(auth)} title="Sign Out">
        Sign Out
      </button>
    )
  );
}

export default SignOutButton;
