import React, { createContext, useCallback, useContext, useState } from 'react';
import { clearSession, getStoredUser, setStoredUser } from '../utils/auth.js';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(getStoredUser);

  // Called after a successful PIN check (login) and after every
  // fetch/save, so a role change made in the Team sheet takes effect
  // without needing to re-enter the PIN.
  const identify = useCallback((user) => {
    if (!user) return;
    setStoredUser(user);
    setCurrentUser(user);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setCurrentUser(null);
    window.location.reload();
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, identify, logout }}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
