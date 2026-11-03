import { supabase, isSupabaseConfigured } from './supabaseClient';
import { UserProfile } from '../types/user';

export const getCurrentUser = async (): Promise<UserProfile | null> => {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return {
      id: user.id,
      email: user.email,
      displayName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
      avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      createdAt: user.created_at
    };
  } catch {
    return null;
  }
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
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error('Error signing out:', err);
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
      callback(null);
    }
  });

  return {
    unsubscribe: () => subscription.unsubscribe()
  };
};
