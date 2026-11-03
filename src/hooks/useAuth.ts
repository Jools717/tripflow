import { useState, useEffect } from 'react';
import { UserProfile } from '../types/user';
import {
  getCurrentUser,
  signInWithGoogle,
  signInWithOtp,
  signOut as authSignOut,
  onAuthStateChange
} from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem('ba_auth_guest') === 'true';
  });

  useEffect(() => {
    let isMounted = true;

    getCurrentUser().then((currentUser) => {
      if (isMounted) {
        setUser(currentUser);
        setIsLoading(false);
      }
    });

    const { unsubscribe } = onAuthStateChange((updatedUser) => {
      if (isMounted) {
        setUser(updatedUser);
        setIsLoading(false);
        if (updatedUser) {
          localStorage.removeItem('ba_auth_guest');
          setIsGuest(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const continueAsGuest = () => {
    localStorage.setItem('ba_auth_guest', 'true');
    setIsGuest(true);
  };

  const handleSignOut = async () => {
    await authSignOut();
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem('ba_auth_guest');
  };

  return {
    user,
    isLoading,
    isGuest,
    signInWithGoogle,
    signInWithOtp,
    signOut: handleSignOut,
    continueAsGuest
  };
}
