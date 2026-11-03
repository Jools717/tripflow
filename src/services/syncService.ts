import { supabase, isSupabaseConfigured } from './supabaseClient';
import { dbToActivity } from './activityService';
import { dbToExpense, dbToCategory, dbToChecklist } from './expenseService';
import { Activity } from '../types/activity';
import { Expense, MediaReceipt } from '../types/expense';
import { ExpenseCategory, ChecklistItem } from '../types/category';

export interface InitialSupabaseData {
  activities?: Activity[];
  expenses?: Expense[];
  checklist?: ChecklistItem[];
  exchangeRate?: number;
  categories?: ExpenseCategory[];
  receipts?: MediaReceipt[];
}

export const fetchInitialSupabaseData = async (): Promise<InitialSupabaseData> => {
  if (!isSupabaseConfigured || !supabase) return {};

  const [actRes, expRes, chkRes, setRes, catRes, recRes] = await Promise.allSettled([
    supabase.from('activities').select('*').order('day_number', { ascending: true }).order('time', { ascending: true }),
    supabase.from('expenses').select('*').order('date', { ascending: false }),
    supabase.from('checklist').select('*').order('id', { ascending: true }),
    supabase.from('trip_settings').select('*').eq('id', 'config').maybeSingle(),
    supabase.from('expense_categories').select('*'),
    supabase.from('media_manager').select('uuid, filename, description, extension, content_type, content_base64')
  ]);

  const result: InitialSupabaseData = {};

  if (actRes.status === 'fulfilled' && !actRes.value.error && actRes.value.data) {
    result.activities = actRes.value.data.map(dbToActivity);
  }
  if (expRes.status === 'fulfilled' && !expRes.value.error && expRes.value.data) {
    result.expenses = expRes.value.data.map(dbToExpense);
  }
  if (chkRes.status === 'fulfilled' && !chkRes.value.error && chkRes.value.data) {
    result.checklist = chkRes.value.data.map(dbToChecklist);
  }
  if (setRes.status === 'fulfilled' && !setRes.value.error && setRes.value.data?.exchange_rate) {
    result.exchangeRate = Number(setRes.value.data.exchange_rate);
  }
  if (catRes.status === 'fulfilled' && !catRes.value.error && catRes.value.data && catRes.value.data.length > 0) {
    result.categories = catRes.value.data.map(dbToCategory);
  }
  if (recRes.status === 'fulfilled' && !recRes.value.error && recRes.value.data && recRes.value.data.length > 0) {
    result.receipts = recRes.value.data;
  }

  return result;
};

export interface RealtimeHandlers {
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  setChecklist: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  setExchangeRate: React.Dispatch<React.SetStateAction<number>>;
  setCategories: React.Dispatch<React.SetStateAction<ExpenseCategory[]>>;
  setReceipts: React.Dispatch<React.SetStateAction<MediaReceipt[]>>;
  onSubscribed?: () => void;
}

export const subscribeToRealtimeChanges = (handlers: RealtimeHandlers) => {
  if (!isSupabaseConfigured || !supabase) return () => {};

  const realtimeChannel = supabase
    .channel('schema-db-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, (payload: any) => {
      if (payload.eventType === 'INSERT') {
        const newAct = dbToActivity(payload.new);
        handlers.setActivities(prev => prev.some(a => a.id === newAct.id) ? prev : [...prev, newAct]);
      } else if (payload.eventType === 'UPDATE') {
        const updated = dbToActivity(payload.new);
        handlers.setActivities(prev => prev.map(a => a.id === updated.id ? updated : a));
      } else if (payload.eventType === 'DELETE') {
        handlers.setActivities(prev => prev.filter(a => a.id !== payload.old.id));
      }
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, (payload: any) => {
      if (payload.eventType === 'INSERT') {
        const newExp = dbToExpense(payload.new);
        handlers.setExpenses(prev => prev.some(e => e.id === newExp.id) ? prev : [newExp, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        const updated = dbToExpense(payload.new);
        handlers.setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
      } else if (payload.eventType === 'DELETE') {
        handlers.setExpenses(prev => prev.filter(e => e.id !== payload.old.id));
      }
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'checklist' }, (payload: any) => {
      if (payload.eventType === 'INSERT') {
        const newChk = dbToChecklist(payload.new);
        handlers.setChecklist(prev => prev.some(c => c.id === newChk.id) ? prev : [newChk, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        const updated = dbToChecklist(payload.new);
        handlers.setChecklist(prev => prev.map(c => c.id === updated.id ? updated : c));
      } else if (payload.eventType === 'DELETE') {
        handlers.setChecklist(prev => prev.filter(c => c.id !== payload.old.id));
      }
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_settings' }, (payload: any) => {
      if (payload.new?.exchange_rate) {
        const r = Number(payload.new.exchange_rate);
        if (r && r >= 100) handlers.setExchangeRate(r);
      }
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'expense_categories' }, (payload: any) => {
      if (payload.eventType === 'INSERT') {
        const newCat = dbToCategory(payload.new);
        handlers.setCategories(prev => prev.some(c => c.id === newCat.id) ? prev : [...prev, newCat]);
      } else if (payload.eventType === 'UPDATE') {
        const updated = dbToCategory(payload.new);
        handlers.setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
      } else if (payload.eventType === 'DELETE') {
        handlers.setCategories(prev => prev.filter(c => c.id !== payload.old.id));
      }
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'media_manager' }, (payload: any) => {
      if (payload.eventType === 'INSERT') {
        handlers.setReceipts(prev => prev.some(r => r.uuid === payload.new.uuid) ? prev : [payload.new, ...prev]);
      } else if (payload.eventType === 'DELETE') {
        handlers.setReceipts(prev => prev.filter(r => r.uuid !== payload.old.uuid));
      }
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED' && handlers.onSubscribed) {
        handlers.onSubscribed();
      }
    });

  return () => {
    supabase.removeChannel(realtimeChannel);
  };
};

