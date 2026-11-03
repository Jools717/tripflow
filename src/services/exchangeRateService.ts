import { supabase, isSupabaseConfigured } from './supabaseClient';

export const fetchLiveDolarBlue = async (): Promise<number | null> => {
  try {
    const res = await fetch('https://dolarapi.com/v1/dolares/blue');
    if (res.ok) {
      const data = await res.json();
      const liveRate = Number(data.compra) || Number(data.venta);
      if (liveRate && liveRate >= 100) {
        return liveRate;
      }
    }
  } catch {
    // Fallback silently if offline
  }
  return null;
};

export const saveExchangeRateDb = async (rate: number): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) return;
  await supabase.from('trip_settings').upsert({ id: 'config', exchange_rate: rate });
};

