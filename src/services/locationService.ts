// Ubicación del usuario y enlaces de "Cómo llegar" con Google Maps.
// Google Maps abre su app en Android/iOS cuando se toca un enlace google.com/maps/dir.
import { Activity } from '../types/activity';
import { Trip, GLOBAL_DESTINATIONS } from '../types/trip';

export type GeoPermission = 'granted' | 'prompt' | 'denied' | 'unsupported';
export type GeoErrorReason = 'denied' | 'unavailable' | 'timeout' | 'unsupported' | 'insecure';
export type TravelMode = 'transit' | 'walking' | 'driving' | 'bicycling';

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number;
}

export const TRAVEL_MODES: { id: TravelMode; label: string; emoji: string }[] = [
  { id: 'transit', label: 'Transporte', emoji: '🚇' },
  { id: 'walking', label: 'A pie', emoji: '🚶' },
  { id: 'driving', label: 'Auto', emoji: '🚗' },
  { id: 'bicycling', label: 'Bici', emoji: '🚲' }
];

const MODE_STORAGE_KEY = 'tripflow_directions_mode';
let lastPosition: { pos: GeoPosition; at: number } | null = null;

export const isGeolocationSupported = (): boolean =>
  typeof navigator !== 'undefined' && 'geolocation' in navigator;

/** Estado del permiso sin disparar el aviso del navegador. Safari antiguo no tiene Permissions API → 'prompt'. */
export const getGeoPermission = async (): Promise<GeoPermission> => {
  if (!isGeolocationSupported()) return 'unsupported';
  try {
    if (navigator.permissions?.query) {
      const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      return status.state as GeoPermission;
    }
  } catch {
    // Permissions API no disponible para geolocalización en este navegador
  }
  return 'prompt';
};

/** Pide la posición actual (muestra el aviso del navegador si el permiso está en 'prompt'). */
export const getCurrentPosition = (): Promise<GeoPosition> =>
  new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      reject({ reason: 'insecure' as GeoErrorReason });
      return;
    }
    if (!isGeolocationSupported()) {
      reject({ reason: 'unsupported' as GeoErrorReason });
      return;
    }
    if (lastPosition && Date.now() - lastPosition.at < 60_000) {
      resolve(lastPosition.pos);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const pos = { lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy };
        lastPosition = { pos, at: Date.now() };
        resolve(pos);
      },
      (err) => {
        const reason: GeoErrorReason =
          err.code === err.PERMISSION_DENIED ? 'denied' : err.code === err.TIMEOUT ? 'timeout' : 'unavailable';
        reject({ reason });
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 }
    );
  });

export const loadPreferredMode = (): TravelMode => {
  try {
    const saved = localStorage.getItem(MODE_STORAGE_KEY) as TravelMode | null;
    if (saved && TRAVEL_MODES.some((m) => m.id === saved)) return saved;
  } catch {
    // Almacenamiento no disponible (modo privado)
  }
  return 'transit';
};

export const savePreferredMode = (mode: TravelMode): void => {
  try {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  } catch {
    // Almacenamiento no disponible (modo privado)
  }
};

/** Texto o coordenadas del destino para Google Maps. */
export const getDestinationQuery = (activity: Partial<Activity>, trip?: Trip | null): string => {
  if (activity.coords && activity.coords.length === 2) {
    return `${activity.coords[0]},${activity.coords[1]}`;
  }
  const country = GLOBAL_DESTINATIONS.find((c) => c.code === trip?.countryCode)?.name;
  return [activity.address || activity.title, trip?.destinationCity, country].filter(Boolean).join(', ');
};

/**
 * Enlace de ruta de Google Maps. Sin origen, la app de Google Maps usa la ubicación actual del teléfono.
 */
export const buildDirectionsUrl = (
  activity: Partial<Activity>,
  trip: Trip | null | undefined,
  mode: TravelMode,
  origin?: GeoPosition | null
): string => {
  const params = new URLSearchParams({ api: '1', destination: getDestinationQuery(activity, trip), travelmode: mode });
  if (origin) params.set('origin', `${origin.lat},${origin.lng}`);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

/** Distancia en línea recta (km) entre dos puntos. */
export const distanceKm = (a: { lat: number; lng: number }, b: [number, number]): number => {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a.lat);
  const dLng = toRad(b[1] - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

export const formatDistance = (km: number): string =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km.toLocaleString('es-ES', { maximumFractionDigits: km < 10 ? 1 : 0 })} km`;

// ── Mapa de Google incrustado (Maps Embed API: gratuita, requiere clave restringida por dominio)
const EMBED_KEY: string | undefined = import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY;

export const isMapsEmbedEnabled = (): boolean => Boolean(EMBED_KEY && EMBED_KEY.trim());

/**
 * URL del mapa incrustado: con origen muestra la ruta; sin origen muestra solo el destino.
 * Devuelve null si no hay clave configurada.
 */
export const buildEmbedUrl = (
  activity: Partial<Activity>,
  trip: Trip | null | undefined,
  mode: TravelMode,
  origin?: GeoPosition | null
): string | null => {
  if (!isMapsEmbedEnabled()) return null;
  const params = new URLSearchParams({ key: EMBED_KEY!.trim(), language: 'es' });
  if (trip?.countryCode) params.set('region', trip.countryCode.toLowerCase());
  if (origin) {
    params.set('origin', `${origin.lat},${origin.lng}`);
    params.set('destination', getDestinationQuery(activity, trip));
    params.set('mode', mode);
    return `https://www.google.com/maps/embed/v1/directions?${params.toString()}`;
  }
  params.set('q', getDestinationQuery(activity, trip));
  return `https://www.google.com/maps/embed/v1/place?${params.toString()}`;
};

export const isIOS = (): boolean =>
  typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);
