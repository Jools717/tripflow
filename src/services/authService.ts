import { supabase, isSupabaseConfigured } from './supabaseClient';
import { UserProfile, ADMIN_JOOLS_USER } from '../types/user';

const STORAGE_KEY_USER = 'tripflow_current_user';

export const getCurrentUser = async (): Promise<UserProfile | null> => {
  // 1. Check local session (e.g. AdminJools)
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id) return parsed;
    }
  } catch {
    // fallback
  }

  // 2. Default initial admin session if not explicitly logged out or guest
  const isGuest = localStorage.getItem('ba_auth_guest') === 'true';
  const isLoggedOut = localStorage.getItem('tripflow_logged_out') === 'true';
  if (!isGuest && !isLoggedOut) {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(ADMIN_JOOLS_USER));
      return ADMIN_JOOLS_USER;
    } catch {
      return ADMIN_JOOLS_USER;
    }
  }

  // 3. Check Supabase session if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user) {
        return {
          id: user.id,
          email: user.email,
          displayName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
          avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          createdAt: user.created_at
        };
      }
    } catch {
      return null;
    }
  }

  return null;
};

export const signInWithCredentials = async (
  identifier: string,
  password: string
): Promise<{ user?: UserProfile; error?: string }> => {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = password.trim();

  // AdminJools verification
  if (
    (cleanId === 'adminjools' || cleanId === 'adminjools@tripflow.app') &&
    cleanPass === '12345'
  ) {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(ADMIN_JOOLS_USER));
      localStorage.removeItem('tripflow_logged_out');
      localStorage.removeItem('ba_auth_guest');
      return { user: ADMIN_JOOLS_USER };
    } catch {
      return { user: ADMIN_JOOLS_USER };
    }
  }

  return { error: 'Credenciales inválidas. Usa Usuario: AdminJools y Contraseña: 12345' };
};

export const signInWithGoogle = async (): Promise<{ error?: string }> => {
  if (!isSupabaseConfigured || !supabase) {
    return { error: 'Supabase no está configurado.' };
  }
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) return { error: error.message };
    return {};
  } catch (err: any) {
    return { error: err.message || 'Error al iniciar sesión con Google.' };
  }
};

export const signInWithOtp = async (email: string): Promise<{ error?: string; success?: boolean }> => {
  if (!isSupabaseConfigured || !supabase) {
    return { error: 'Supabase no está configurado.' };
  }
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    if (error) return { error: error.message };
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Error al enviar enlace de inicio.' };
  }
};

export const signOut = async (): Promise<void> => {
  try {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.setItem('tripflow_logged_out', 'true');
  } catch (err) {
    console.error('Error removing local session:', err);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out Supabase:', err);
    }
  }
};

export const onAuthStateChange = (callback: (user: UserProfile | null) => void) => {
  if (!isSupabaseConfigured || !supabase) {
    return { unsubscribe: () => {} };
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email,
        displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
        avatarUrl: session.user.user_metadata?.avatar_url,
        createdAt: session.user.created_at
      });
    } else {
      const localUser = localStorage.getItem(STORAGE_KEY_USER);
      if (localUser) {
        try {
          callback(JSON.parse(localUser));
          return;
        } catch {
          // ignore
        }
      }
      callback(null);
    }
  });

  return {
    unsubscribe: () => subscription.unsubscribe()
  };
};
