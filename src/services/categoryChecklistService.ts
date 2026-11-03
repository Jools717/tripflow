import { ExpenseCategory, ChecklistItem } from '../types/category';
import { DbCategoryRow, DbChecklistRow } from '../types/supabase';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'mercado', name: 'Mercado de Alimentos', icon: 'ShoppingCart', color: '#10b981', is_default: true },
  { id: 'regalos', name: 'Regalos del Viaje', icon: 'Gift', color: '#ec4899', is_default: true },
  { id: 'gastronomia', name: 'Restaurantes & Bares', icon: 'Utensils', color: '#f59e0b', is_default: true },
  { id: 'transporte', name: 'Transporte (SUBE/Apps)', icon: 'Bus', color: '#3b82f6', is_default: true },
  { id: 'cultura', name: 'Entradas & Cultura', icon: 'Ticket', color: '#8b5cf6', is_default: true },
  { id: 'compras', name: 'Compras & Outlets', icon: 'ShoppingBag', color: '#a855f7', is_default: true },
  { id: 'varios', name: 'Varios & Emergencias', icon: 'Receipt', color: '#64748b', is_default: true }
];

export const categoryToDb = (cat: ExpenseCategory): DbCategoryRow => ({
  id: cat.id,
  name: cat.name,
  icon: cat.icon || 'Tag',
  color: cat.color || '#10b981',
  is_default: Boolean(cat.is_default)
});

export const dbToCategory = (row: DbCategoryRow): ExpenseCategory => ({
  id: row.id,
  name: row.name,
  icon: row.icon || 'Tag',
  color: row.color || '#10b981',
  is_default: Boolean(row.is_default)
});

export const checklistToDb = (chk: ChecklistItem): DbChecklistRow => ({
  id: chk.id,
  text: chk.text,
  category: chk.category,
  completed: Boolean(chk.completed)
});

export const dbToChecklist = (row: DbChecklistRow): ChecklistItem => ({
  id: row.id,
  text: row.text,
  category: row.category,
  completed: Boolean(row.completed)
});

export const insertCategoryDb = async (cat: ExpenseCategory): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) return;
  await supabase.from('expense_categories').insert(categoryToDb(cat));
};

export const deleteCategoryDb = async (catId: string): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) return;
  await supabase.from('expense_categories').delete().eq('id', catId);
};

export const insertChecklistDb = async (item: ChecklistItem): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) return;
  await supabase.from('checklist').insert(checklistToDb(item));
};

export const updateChecklistCompletedDb = async (id: string, completed: boolean): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) return;
  await supabase.from('checklist').update({ completed }).eq('id', id);
};

export const deleteChecklistDb = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) return;
  await supabase.from('checklist').delete().eq('id', id);
};

