export interface UserProfile {
  id: string;
  email?: string;
  displayName?: string;
  username?: string;
  role?: 'admin' | 'user';
  avatarUrl?: string;
  createdAt?: string;
}

/** Identificador de la antigua sesión local de pruebas (antes de la Fase 8). */
export const LEGACY_ADMIN_ID = 'user-admin-jools';

/**
 * Cuenta real de AdminJools en Supabase Auth (dueña del viaje de Buenos Aires).
 * Transitorio (Fase 8.2): se usa como dueño por defecto mientras la app permita usarse sin sesión.
 * En la Fase 8.3 desaparece el uso sin sesión y este respaldo deja de ser necesario.
 */
export const OWNER_USER_ID = '26d4da6c-536c-4ed3-91af-62e1f11a28f8';

/** Convierte el identificador antiguo (o vacío) en el de la cuenta real antes de guardar. */
export const resolveOwnerId = (id?: string | null): string =>
  !id || id === LEGACY_ADMIN_ID ? OWNER_USER_ID : id;
