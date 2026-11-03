export interface DbActivityRow {
  id: string;
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
}

export interface DbExpenseRow {
  id: string;
  date: string;
  concept: string;
  category: string;
  amount_ars: number;
  paid_by: string;
  note: string;
  receipt_id: string | null;
}

export interface DbCategoryRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
}

export interface DbChecklistRow {
  id: string;
  text: string;
  category: string;
  completed: boolean;
}

export type SyncStatus = 'syncing' | 'connected' | 'saving' | 'offline';

