// Autenticación con Supabase Auth: correo + contraseña (con confirmación por correo) y Google.
// AdminJools es desde la Fase 8.2 una cuenta real de Supabase (rol "admin" en app_metadata).
import type { AuthChangeEvent, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { UserProfile } from '../types/user';

// Sesión local del antiguo acceso de pruebas: solo se borra si quedó guardada
const LEGACY_STORAGE_KEY_USER = 'tripflow_current_user';
type AuthResult = { error?: string };

const redirectUrl = (): string => window.location.origin;

/** Traduce los mensajes de Supabase Auth a mensajes claros en español. */
export const translateAuthError = (message?: string): string => {
  const m = (message || '').toLowerCase();
  if (m.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (m.includes('email not confirmed')) return 'Aún no confirmaste tu correo. Revisa tu bandeja de entrada (y la carpeta de spam).';
  if (m.includes('user already registered') || m.includes('already been registered')) return 'Ya existe una cuenta con ese correo. Inicia sesión o recupera tu contraseña.';
  if (m.includes('password should be at least') || m.includes('weak password')) return 'La contraseña es muy corta: usa al menos 8 caracteres.';
  if (m.includes('unable to validate email') || m.includes('invalid email')) return 'Ese correo no es válido.';
  if (m.includes('rate limit') || m.includes('too many') || m.includes('security purposes')) return 'Demasiados intentos. Espera un momento y vuelve a probar.';
  if (m.includes('provider is not enabled')) return 'Este método de acceso todavía no está activado.';
  if (m.includes('signups not allowed')) return 'El registro de cuentas nuevas está desactivado.';
  if (m.includes('failed to fetch') || m.includes('network')) return 'Sin conexión. Revisa tu internet e inténtalo de nuevo.';
  return message || 'Ocurrió un error inesperado. Inténtalo de nuevo.';
};

export const mapSupabaseUser = (user: User): UserProfile => ({
  id: user.id,
  email: user.email,
  // app_metadata.display_name (solo editable desde el servidor) tiene prioridad: Google reescribe user_metadata en cada inicio de sesión
  displayName:
    user.app_metadata?.display_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Viajero',
  avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
  role: user.app_metadata?.role === 'admin' ? 'admin' : 'user',
  createdAt: user.created_at
});

const clearLegacySession = (): void => {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY_USER);
    localStorage.removeItem('tripflow_logged_out');
    localStorage.removeItem('ba_auth_guest');
  } catch {
    // Almacenamiento no disponible
  }
};

const supabaseOrError = (): AuthResult | null =>
  isSupabaseConfigured && supabase ? null : { error: 'El servicio de cuentas no está configurado.' };

/** Sesión actual de Supabase (se conserva sin conexión: Supabase la guarda en el dispositivo). */
export const getCurrentUser = async (): Promise<UserProfile | null> => {
  clearLegacySession();
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user ? mapSupabaseUser(data.session.user) : null;
  } catch {
    return null;
  }
};

/** Crea una cuenta con correo y contraseña. Supabase envía un correo de confirmación. */
export const signUpWithEmail = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResult & { needsConfirmation?: boolean; user?: UserProfile }> => {
  const notReady = supabaseOrError();
  if (notReady) return notReady;
  const { data, error } = await supabase!.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { full_name: name.trim() }, emailRedirectTo: redirectUrl() }
  });
  if (error) return { error: translateAuthError(error.message) };
  // Si el correo ya existía, Supabase no da error pero devuelve un usuario sin identidades
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { error: translateAuthError('User already registered') };
  }
  if (!data.session) return { needsConfirmation: true };
  return { user: mapSupabaseUser(data.session.user) };
};

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<AuthResult & { user?: UserProfile; unconfirmed?: boolean }> => {
  const notReady = supabaseOrError();
  if (notReady) return notReady;
  const { data, error } = await supabase!.auth.signInWithPassword({ email: email.trim(), password });
  if (error) {
    return { error: translateAuthError(error.message), unconfirmed: /email not confirmed/i.test(error.message) };
  }
  return { user: mapSupabaseUser(data.user) };
};

export const resendConfirmationEmail = async (email: string): Promise<AuthResult> => {
  const notReady = supabaseOrError();
  if (notReady) return notReady;
  const { error } = await supabase!.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: redirectUrl() } });
  return error ? { error: translateAuthError(error.message) } : {};
};

export const requestPasswordReset = async (email: string): Promise<AuthResult> => {
  const notReady = supabaseOrError();
  if (notReady) return notReady;
  const { error } = await supabase!.auth.resetPasswordForEmail(email.trim(), { redirectTo: redirectUrl() });
  return error ? { error: translateAuthError(error.message) } : {};
};

/** Cambia la contraseña del usuario con sesión (se usa tras abrir el enlace de recuperación). */
export const updatePassword = async (newPassword: string): Promise<AuthResult> => {
  const notReady = supabaseOrError();
  if (notReady) return notReady;
  const { error } = await supabase!.auth.updateUser({ password: newPassword });
  return error ? { error: translateAuthError(error.message) } : {};
};

export const signInWithGoogle = async (): Promise<AuthResult> => {
  const notReady = supabaseOrError();
  if (notReady) return notReady;
  const { error } = await supabase!.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: redirectUrl(), queryParams: { prompt: 'select_account' } }
  });
  return error ? { error: translateAuthError(error.message) } : {};
};

export const signOut = async (): Promise<void> => {
  clearLegacySession();
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error al cerrar sesión en Supabase:', err);
    }
  }
};

/** Escucha cambios de sesión. El evento PASSWORD_RECOVERY indica que hay que pedir una contraseña nueva. */
export const onAuthStateChange = (callback: (user: UserProfile | null, event: AuthChangeEvent) => void) => {
  if (!isSupabaseConfigured || !supabase) return { unsubscribe: () => {} };
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ? mapSupabaseUser(session.user) : null, event);
  });
  return { unsubscribe: () => subscription.unsubscribe() };
};
