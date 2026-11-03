export interface DbTripRow {
  id: string;
  user_id: string;
  title: string;
  destination_city: string;
  country_code: string;
  flag_emoji: string;
  start_date: string;
  end_date: string;
  base_currency: string;
  local_currency: string;
  exchange_rate: number;
  budget_total_base: number;
  is_active: boolean;
  notes: string;
  created_at?: string;
}

export interface DbActivityRow {
  id: string;
  trip_id?: string;
  user_id?: string;
  day_number: number;
  time: string;
  period: string;
  title: string;
  barrio: string;
  category: string;
  address: string;
  lat: number | null;
  lng: number | null;
  description: string;
  tip: string;
  with_friend: boolean;
  completed: boolean;
  cost_estimated_ars: number;
  created_at?: string;
}

export interface DbExpenseRow {
  id: string;
  trip_id?: string;
  user_id?: string;
  activity_id?: string | null;
  date: string;
  concept: string;
  category: string;
  amount_ars: number;
  paid_by: string;
  note: string;
  receipt_id: string | null;
  currency?: string;
  amount_usd?: number;
  created_at?: string;
}

export interface DbCategoryRow {
  id: string;
  trip_id?: string;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
  created_at?: string;
}

export interface DbChecklistRow {
  id: string;
  trip_id?: string;
  user_id?: string;
  text: string;
  category: string;
  completed: boolean;
  created_at?: string;
}

export type SyncStatus = 'syncing' | 'connected' | 'saving' | 'offline';
