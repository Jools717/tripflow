import { Trip, DEFAULT_BA_TRIP } from '../types/trip';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY_TRIPS = 'ba_user_trips';
const STORAGE_KEY_ACTIVE_TRIP = 'ba_active_trip_id';

export const loadStoredTrips = (): Trip[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRIPS);
    if (!raw) return [DEFAULT_BA_TRIP];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return [DEFAULT_BA_TRIP];
  } catch {
    return [DEFAULT_BA_TRIP];
  }
};

export const loadStoredActiveTripId = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_TRIP) || DEFAULT_BA_TRIP.id;
  } catch {
    return DEFAULT_BA_TRIP.id;
  }
};

export const saveStoredTrips = (trips: Trip[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_TRIPS, JSON.stringify(trips));
  } catch (err) {
    console.error('Failed to save trips to local storage', err);
  }
};

export const saveStoredActiveTripId = (tripId: string): void => {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_TRIP, tripId);
  } catch (err) {
    console.error('Failed to save active trip id to local storage', err);
  }
};

export const tripToDb = (t: Trip) => ({
  id: t.id,
  user_id: t.userId || null,
  title: t.title,
  destination_city: t.destinationCity,
  country_code: t.countryCode,
  flag_emoji: t.flagEmoji,
  start_date: t.startDate,
  end_date: t.endDate,
  base_currency: t.baseCurrency,
  local_currency: t.localCurrency,
  exchange_rate: t.exchangeRate,
  budget_total_base: t.budgetTotalBase,
  is_active: Boolean(t.isActive),
  notes: t.notes || ''
});

export const dbToTrip = (row: any): Trip => ({
  id: row.id,
  userId: row.user_id || null,
  title: row.title || 'Viaje',
  destinationCity: row.destination_city || '',
  countryCode: row.country_code || 'AR',
  flagEmoji: row.flag_emoji || '✈️',
  startDate: row.start_date || '2026-10-10',
  endDate: row.end_date || '2026-10-23',
  baseCurrency: row.base_currency || 'USD',
  localCurrency: row.local_currency || 'ARS',
  exchangeRate: Number(row.exchange_rate) || 1000,
  budgetTotalBase: Number(row.budget_total_base) || 1000,
  isActive: Boolean(row.is_active),
  notes: row.notes || ''
});

export const fetchTripsDb = async (userId?: string | null): Promise<Trip[] | null> => {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    let query = supabase.from('trips').select('*');
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (error) {
      // Table may not be created yet in user's Supabase instance
      return null;
    }
    if (Array.isArray(data) && data.length > 0) {
      return data.map(dbToTrip);
    }
    return null;
  } catch {
    return null;
  }
};

export const upsertTripDb = async (trip: Trip): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('trips').upsert(tripToDb(trip));
  } catch (err) {
    console.error('Failed to upsert trip in Supabase:', err);
  }
};

export const deleteTripDb = async (tripId: string): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('trips').delete().eq('id', tripId);
  } catch (err) {
    console.error('Failed to delete trip in Supabase:', err);
  }
};
