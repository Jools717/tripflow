/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Clave de Google Maps Embed API (restringida por dominio). Opcional: sin ella no se muestra el mapa incrustado. */
  readonly VITE_GOOGLE_MAPS_EMBED_KEY?: string;
}

