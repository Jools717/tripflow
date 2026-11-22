export const CLOUD_ERROR_EVENT = 'tripflow:cloud-error';

export interface CloudErrorDetail {
  context: string;
  message: string;
}

/**
 * Supabase no lanza excepciones: devuelve { error }. Esta función lo registra
 * y avisa a la interfaz (badge "Error al guardar" en el Header).
 * Devuelve true si hubo error.
 */
export const reportCloudError = (
  context: string,
  error: { message?: string } | null | undefined
): boolean => {
  if (!error) return false;
  console.error(`[Supabase] ${context}:`, error);
  try {
    window.dispatchEvent(
      new CustomEvent<CloudErrorDetail>(CLOUD_ERROR_EVENT, {
        detail: { context, message: error.message || 'Error desconocido' }
      })
    );
  } catch {
    // Entorno sin window (tests / SSR)
  }
  return true;
};
