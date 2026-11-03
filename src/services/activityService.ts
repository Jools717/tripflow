import { Activity, ActivityType, PurchaseItem } from '../types/activity';
import { DbActivityRow } from '../types/supabase';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export const activityToDb = (act: Activity): DbActivityRow => {
  let dbDescription = act.description || '';
  if (act.type === 'compras' || act.type === 'nota' || (Array.isArray(act.items) && act.items.length > 0)) {
    dbDescription = JSON.stringify({
      type: act.type || (Array.isArray(act.items) && act.items.length > 0 ? 'compras' : 'plan'),
      items: act.items || [],
      note: act.note || act.description || ''
    });
  }
  const result: DbActivityRow = {
    id: act.id,
    day_number: act.dayNumber,
    time: act.time || '10:00',
    period: act.period || 'mañana',
    title: act.title,
    barrio: act.barrio || '',
    category: act.category || (act.type === 'compras' ? 'compras' : 'cultura'),
    address: act.address || '',
    lat: act.coords && act.coords.length === 2 ? act.coords[0] : null,
    lng: act.coords && act.coords.length === 2 ? act.coords[1] : null,
    description: dbDescription,
    tip: act.tip || '',
    with_friend: Boolean(act.withFriend),
    completed: Boolean(act.completed),
    cost_estimated_ars: Number(act.costEstimatedARS) || 0
  };

  if (act.tripId) result.trip_id = act.tripId;
  if (act.userId) result.user_id = act.userId;

  return result;
};

export const dbToActivity = (row: DbActivityRow): Activity => {
  let parsedType: ActivityType = 'plan';
  let parsedItems: PurchaseItem[] = [];
  let parsedDesc = row.description || '';
  let parsedNote = '';

  if (row.description && typeof row.description === 'string' && row.description.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(row.description);
      if (parsed && typeof parsed === 'object') {
        parsedType = parsed.type || (Array.isArray(parsed.items) && parsed.items.length > 0 ? 'compras' : 'plan');
        parsedItems = Array.isArray(parsed.items) ? parsed.items : [];
        parsedDesc = parsed.note || parsed.description || '';
        parsedNote = parsed.note || '';
      }
    } catch {}
  } else if (row.category === 'compras') {
    parsedType = 'plan';
  }

  return {
    id: row.id,
    tripId: row.trip_id || 'trip-ba-2026',
    userId: row.user_id || 'user-admin-jools',
    dayNumber: Number(row.day_number),
    time: row.time || '10:00',
    period: row.period || 'mañana',
    title: row.title,
    barrio: row.barrio || '',
    category: row.category || 'cultura',
    address: row.address || '',
    coords: (row.lat != null && row.lng != null) ? [row.lat, row.lng] : null,
    description: parsedDesc,
    note: parsedNote,
    type: parsedType,
    items: parsedItems,
    tip: row.tip || '',
    withFriend: Boolean(row.with_friend),
    completed: Boolean(row.completed),
    costEstimatedARS: Number(row.cost_estimated_ars) || 0
  };
};

export const upsertActivityDb = async (activity: Activity): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) return;
  const { error } = await supabase.from('activities').upsert(activityToDb(activity));
  if (error) console.error('Error upserting activity in Supabase:', error);
};

export const insertActivityDb = async (activity: Activity): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) return;
  const { error } = await supabase.from('activities').insert(activityToDb(activity));
  if (error) console.error('Error inserting activity in Supabase:', error);
};

export const updateActivityFieldsDb = async (id: string, fields: Partial<DbActivityRow>): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) return;
  const { error } = await supabase.from('activities').update(fields).eq('id', id);
  if (error) console.error('Error updating activity fields in Supabase:', error);
};

export const deleteActivityDb = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) return;
  const { error } = await supabase.from('activities').delete().eq('id', id);
  if (error) console.error('Error deleting activity in Supabase:', error);
};

