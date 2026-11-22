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
import { flushOutbox, getPendingCount } from '../services/cloudQueue';
import { clearLocalTripData } from '../services/storageService';

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

  /** Cierra sesión: envía lo pendiente, avisa si algo no se pudo enviar y borra los datos del dispositivo. */
  const handleSignOut = async (): Promise<boolean> => {
    await flushOutbox().catch(() => undefined);
    const pending = getPendingCount();
    if (pending > 0) {
      const ok = window.confirm(
        `Tienes ${pending} cambio(s) sin enviar a la nube porque no hay conexión. Si cierras sesión ahora se perderán.\n\n¿Cerrar sesión de todas formas?`
      );
      if (!ok) return false;
    }
    await authSignOut();
    clearLocalTripData();
    setUser(null);
    return true;
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
