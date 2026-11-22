import { useState, useEffect } from 'react';
import { UserProfile } from '../types/user';
import {
  getCurrentUser,
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  resendConfirmationEmail,
  requestPasswordReset,
  updatePassword,
  signOut as authSignOut,
  onAuthStateChange
} from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // true cuando el usuario llegó desde el enlace "Restablecer contraseña" del correo
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getCurrentUser().then((currentUser) => {
      if (isMounted) {
        setUser(currentUser);
        setIsLoading(false);
      }
    });

    const { unsubscribe } = onAuthStateChange((updatedUser, event) => {
      if (!isMounted) return;
      setUser(updatedUser);
      setIsLoading(false);
      if (event === 'PASSWORD_RECOVERY') setIsPasswordRecovery(true);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const withUser = <T extends { user?: UserProfile }>(result: T): T => {
    if (result.user) setUser(result.user);
    return result;
  };

  const handleSignOut = async () => {
    await authSignOut();
    setUser(null);
  };

  return {
    user,
    isLoading,
    isPasswordRecovery,
    finishPasswordRecovery: () => setIsPasswordRecovery(false),
    signUpWithEmail: async (name: string, email: string, password: string) =>
      withUser(await signUpWithEmail(name, email, password)),
    signInWithEmail: async (email: string, password: string) => withUser(await signInWithEmail(email, password)),
    signInWithGoogle,
    resendConfirmationEmail,
    requestPasswordReset,
    updatePassword,
    signOut: handleSignOut
  };
}

export type AuthApi = ReturnType<typeof useAuth>;
