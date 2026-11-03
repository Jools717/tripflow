import { ActivityType, PurchaseItem } from '../types/activity';
import { Expense, MediaReceipt } from '../types/expense';
import { DbExpenseRow } from '../types/supabase';
import { supabase, isSupabaseConfigured } from './supabaseClient';
export {
  DEFAULT_EXPENSE_CATEGORIES,
  categoryToDb,
  dbToCategory,
  checklistToDb,
  dbToChecklist,
  insertCategoryDb,
  deleteCategoryDb,
  insertChecklistDb,
  updateChecklistCompletedDb,
  deleteChecklistDb
} from './categoryChecklistService';

export const expenseToDb = (exp: Expense): DbExpenseRow => {
  let dbNote = exp.note || '';
  if (exp.type === 'compras' || (Array.isArray(exp.items) && exp.items.length > 0)) {
    dbNote = JSON.stringify({
      type: exp.type || 'compras',
      items: exp.items || [],
      note: exp.note || ''
    });
  }
  return {
    id: exp.id,
    date: exp.date,
    concept: exp.concept,
    category: exp.category,
    amount_ars: Number(exp.amountARS) || 0,
    paid_by: exp.paymentMethod || exp.paidBy || 'efectivo',
    note: dbNote,
    receipt_id: exp.receipt_id || exp.receiptId || null
  };
};

export const dbToExpense = (row: DbExpenseRow): Expense => {
  let parsedType: ActivityType = 'plan';
  let parsedItems: PurchaseItem[] = [];
  let parsedNote = row.note || '';

  if (row.note && typeof row.note === 'string' && row.note.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(row.note);
      if (parsed && typeof parsed === 'object') {
        parsedType = parsed.type || (Array.isArray(parsed.items) && parsed.items.length > 0 ? 'compras' : 'plan');
        parsedItems = Array.isArray(parsed.items) ? parsed.items : [];
        parsedNote = parsed.note || '';
      }
    } catch {}
  }

  return {
    id: row.id,
    date: row.date,
    concept: row.concept,
    category: row.category,
    amountARS: Number(row.amount_ars) || 0,
    paymentMethod: (row.paid_by?.toLowerCase() === 'tarjeta' || row.note?.toLowerCase().includes('tarjeta')) ? 'tarjeta' : 'efectivo',
    paidBy: row.paid_by || 'Efectivo',
    note: parsedNote,
    type: parsedType,
    items: parsedItems,
    receipt_id: row.receipt_id || null
  };
};

export const upsertExpenseDb = async (expense: Expense): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) return;
  await supabase.from('expenses').upsert(expenseToDb(expense));
};

export const insertExpenseDb = async (expense: Expense, mediaItem?: MediaReceipt | null): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) return;
  if (mediaItem) {
    await supabase.from('media_manager').insert(mediaItem);
  }
  await supabase.from('expenses').insert(expenseToDb(expense));
};

export const deleteExpenseDb = async (id: string, receiptId?: string | null): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) return;
  await supabase.from('expenses').delete().eq('id', id);
  if (receiptId) {
    await supabase.from('media_manager').delete().eq('uuid', receiptId);
  }
};

export const deleteExpensesByIdsDb = async (ids: string[]): Promise<void> => {
  if (!isSupabaseConfigured || !supabase || ids.length === 0) return;
  await supabase.from('expenses').delete().in('id', ids);
};
