import { GLOBAL_DESTINATIONS } from '../types/trip';

export interface FxRateResult {
  rate: number;
  source: string;
  pair: string;
  timestamp: string;
  isFallback?: boolean;
}

const CACHE_PREFIX = 'tripflow_fx_cache_';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export const getCachedFxRate = (baseCurrency: string, localCurrency: string): number | null => {
  try {
    const key = `${CACHE_PREFIX}${baseCurrency.toUpperCase()}_${localCurrency.toUpperCase()}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.rate === 'number' && parsed.rate > 0) {
      return parsed.rate;
    }
  } catch {
    // ignore
  }
  return null;
};

export const saveCachedFxRate = (baseCurrency: string, localCurrency: string, rate: number): void => {
  try {
    const key = `${CACHE_PREFIX}${baseCurrency.toUpperCase()}_${localCurrency.toUpperCase()}`;
    localStorage.setItem(key, JSON.stringify({
      rate,
      timestamp: Date.now()
    }));
  } catch {
    // ignore
  }
};

/**
 * Fetch live exchange rate with smart routing:
 * - Dólar Blue (DolarApi) for Argentina
 * - Global Open Exchange Rates for all other 50+ countries
 */
export const fetchLiveExchangeRate = async (
  baseCurrency = 'USD',
  localCurrency = 'ARS',
  countryCode?: string
): Promise<FxRateResult> => {
  const base = baseCurrency.toUpperCase();
  const local = localCurrency.toUpperCase();
  const country = (countryCode || '').toUpperCase();
  const pair = `${base}/${local}`;

  // Route 1: Argentina Blue Dollar
  if (country === 'AR' || local === 'ARS') {
    try {
      const res = await fetch('https://dolarapi.com/v1/dolares/blue', { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        const liveRate = Number(data.compra) || Number(data.venta);
        if (liveRate && liveRate >= 100) {
          saveCachedFxRate(base, local, liveRate);
          return {
            rate: liveRate,
            source: 'Dólar Blue (DolarApi)',
            pair,
            timestamp: new Date().toISOString()
          };
        }
      }
    } catch (err) {
      console.warn('Failed to fetch Dólar Blue live rate, checking cache:', err);
    }
  } 
  // Route 2: Global Exchange Rates for all other countries
  else {
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${base}`, { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates && typeof data.rates[local] === 'number') {
          const liveRate = data.rates[local];
          saveCachedFxRate(base, local, liveRate);
          return {
            rate: liveRate,
            source: 'Tipo de cambio global (ER-API)',
            pair,
            timestamp: new Date().toISOString()
          };
        }
      }
    } catch (err) {
      console.warn(`Failed to fetch global live rate for ${pair}:`, err);
    }
  }

  // Fallback 1: LocalStorage Cache
  const cached = getCachedFxRate(base, local);
  if (cached) {
    return {
      rate: cached,
      source: 'Caché local (Guardado)',
      pair,
      timestamp: new Date().toISOString(),
      isFallback: true
    };
  }

  // Fallback 2: Destination presets catalogue
  const matchedCountry = GLOBAL_DESTINATIONS.find(d => d.code === country || d.defaultCurrency === local);
  const presetRate = matchedCountry?.approxRateUSD || (local === 'ARS' ? 1540 : 1);

  return {
    rate: presetRate,
    source: 'Catálogo de referencia',
    pair,
    timestamp: new Date().toISOString(),
    isFallback: true
  };
};

