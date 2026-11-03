import React from 'react';
import { Activity } from '../types/activity';
import { Expense, MediaReceipt } from '../types/expense';
import { ChecklistItem, ExpenseCategory } from '../types/category';
import { SyncStatus } from '../types/supabase';
import { isSupabaseConfigured } from '../services/supabaseClient';
import {
  insertExpenseDb,
  deleteExpenseDb,
  insertCategoryDb,
  deleteCategoryDb,
  insertChecklistDb,
  updateChecklistCompletedDb,
  deleteChecklistDb
} from '../services/expenseService';
import { upsertActivityDb } from '../services/activityService';
import { saveExchangeRateDb } from '../services/exchangeRateService';
import {
  syncActivityToMatchingExpenses,
  computeUpdatedExpenseSync
} from '../services/mirrorSyncService';
import { parseCurrencyNumber, isActivityTrackedInExpenses } from '../utils/helpers';

interface UseWalletOptions {
  activities: Activity[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  setCategories: React.Dispatch<React.SetStateAction<ExpenseCategory[]>>;
  setReceipts: React.Dispatch<React.SetStateAction<MediaReceipt[]>>;
  checklist: ChecklistItem[];
  setChecklist: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  setExchangeRate: React.Dispatch<React.SetStateAction<number>>;
  setCloudSyncStatus: React.Dispatch<React.SetStateAction<SyncStatus>>;
}

export function useWallet({
  activities,
  setActivities,
  expenses,
  setExpenses,
  setCategories,
  setReceipts,
  checklist,
  setChecklist,
  setExchangeRate,
  setCloudSyncStatus
}: UseWalletOptions) {
  const handleAddExpense = async (expense: Expense, mediaItem?: MediaReceipt) => {
    const cost = Math.max(0, parseCurrencyNumber(expense.amountARS) || 0);
    setExpenses(prev => [expense, ...prev]);
    if (mediaItem) setReceipts(prev => [mediaItem, ...prev]);

    const actId = expense.activityId || activities.find(a => isActivityTrackedInExpenses(a, [expense]))?.id;
    if (actId) {
      const nextActs = activities.map(a => a.id === actId ? { ...a, costEstimatedARS: cost } : a);
      setActivities(nextActs);
      const fullAct = nextActs.find(a => a.id === actId);
      if (fullAct) upsertActivityDb(fullAct).catch(console.error);
    }

    if (isSupabaseConfigured) {
      setCloudSyncStatus('saving');
      await insertExpenseDb(expense, mediaItem);
      setCloudSyncStatus('connected');
    }
  };

  const handleUpdateActivityCost = async (activityId: string, newCost: number | string) => {
    const cost = Math.max(0, parseCurrencyNumber(newCost) || 0);
    const nextActs = activities.map(a => a.id === activityId ? { ...a, costEstimatedARS: cost } : a);
    setActivities(nextActs);

    const fullAct = nextActs.find(a => a.id === activityId);
    if (isSupabaseConfigured && fullAct) {
      setCloudSyncStatus('saving');
      await upsertActivityDb(fullAct);
      setCloudSyncStatus('connected');
    }
    if (fullAct) {
      const syncedExpenses = syncActivityToMatchingExpenses(fullAct, cost, expenses);
      if (syncedExpenses) setExpenses(syncedExpenses);
    }
  };

  const handleUpdateExpense = async (updatedExpense: Expense) => {
    setCloudSyncStatus('saving');
    const { nextActivities, nextExpenses } = computeUpdatedExpenseSync(updatedExpense, activities, expenses);
    if (nextActivities) setActivities(nextActivities);
    if (nextExpenses) setExpenses(nextExpenses);
    setCloudSyncStatus('connected');
  };

  const handleDeleteExpense = async (id: string, expItem?: Expense) => {
    if (expItem?.isFromItinerary || (typeof id === 'string' && id.startsWith('itinerary-'))) {
      const actId = expItem?.activityId || id.replace('itinerary-', '');
      await handleUpdateActivityCost(actId, 0);
      return;
    }

    const exp = expenses.find(e => e.id === id);
    setExpenses(prev => prev.filter(e => e.id !== id));

    const actId = exp?.activityId || (exp ? activities.find(a => isActivityTrackedInExpenses(a, [exp]))?.id : null);
    if (actId) {
      const nextActs = activities.map(a => a.id === actId ? { ...a, costEstimatedARS: 0 } : a);
      setActivities(nextActs);
      const fullAct = nextActs.find(a => a.id === actId);
      if (fullAct) upsertActivityDb(fullAct).catch(console.error);
    }

    if (isSupabaseConfigured) {
      setCloudSyncStatus('saving');
      if (exp?.receipt_id) setReceipts(prev => prev.filter(r => r.uuid !== exp.receipt_id));
      await deleteExpenseDb(id, exp?.receipt_id);
      setCloudSyncStatus('connected');
    }
  };

  const handleAddCategory = async (newCat: ExpenseCategory) => {
    setCategories(prev => [...prev, newCat]);
    if (isSupabaseConfigured) {
      setCloudSyncStatus('saving');
      await insertCategoryDb(newCat);
      setCloudSyncStatus('connected');
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    setCategories(prev => prev.filter(c => c.id !== catId));
    if (isSupabaseConfigured) {
      setCloudSyncStatus('saving');
      await deleteCategoryDb(catId);
      setCloudSyncStatus('connected');
    }
  };

  const handleToggleChecklist = async (id: string) => {
    const item = checklist.find(c => c.id === id);
    if (!item) return;
    const newCompleted = !item.completed;
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, completed: newCompleted } : c));
    if (isSupabaseConfigured) {
      setCloudSyncStatus('saving');
      await updateChecklistCompletedDb(id, newCompleted);
      setCloudSyncStatus('connected');
    }
  };

  const handleAddChecklist = async (item: ChecklistItem) => {
    setChecklist(prev => [item, ...prev]);
    if (isSupabaseConfigured) {
      setCloudSyncStatus('saving');
      await insertChecklistDb(item);
      setCloudSyncStatus('connected');
    }
  };

  const handleDeleteChecklist = async (id: string) => {
    setChecklist(prev => prev.filter(c => c.id !== id));
    if (isSupabaseConfigured) {
      setCloudSyncStatus('saving');
      await deleteChecklistDb(id);
      setCloudSyncStatus('connected');
    }
  };

  const handleUpdateExchangeRate = async (rate: number | string) => {
    const validRate = Number(rate);
    if (!validRate || isNaN(validRate) || validRate < 100) return;
    setExchangeRate(validRate);
    if (isSupabaseConfigured) {
      setCloudSyncStatus('saving');
      await saveExchangeRateDb(validRate);
      setCloudSyncStatus('connected');
    }
  };

  return {
    handleAddExpense,
    handleUpdateActivityCost,
    handleUpdateExpense,
    handleDeleteExpense,
    handleAddCategory,
    handleDeleteCategory,
    handleToggleChecklist,
    handleAddChecklist,
    handleDeleteChecklist,
    handleUpdateExchangeRate
  };
}