import { Activity } from '../types/activity';
import { Expense } from '../types/expense';
import { isActivityTrackedInExpenses, parseCurrencyNumber } from '../utils/helpers';
import { upsertActivityDb } from './activityService';
import { upsertExpenseDb, deleteExpensesByIdsDb } from './expenseService';

/**
 * Syncs an updated activity's cost, title, category, type and items to any matching expenses.
 */
export const syncActivityToMatchingExpenses = (
  updatedActivity: Activity,
  cleanCost: number,
  expenses: Expense[]
): Expense[] | null => {
  const matchingExpenses = expenses.filter(e =>
    e.activityId === updatedActivity.id ||
    isActivityTrackedInExpenses(updatedActivity, [e])
  );

  if (matchingExpenses.length === 0) return null;

  const nextExpenses = expenses.map(e => {
    if (matchingExpenses.some(m => m.id === e.id)) {
      const synced: Expense = {
        ...e,
        activityId: updatedActivity.id,
        amountARS: cleanCost,
        concept: updatedActivity.title,
        category: updatedActivity.category,
        type: updatedActivity.type,
        items: updatedActivity.items
      };
      upsertExpenseDb(synced).catch(console.error);
      return synced;
    }
    return e;
  });

  try {
    localStorage.setItem('ba_itinerary_expenses', JSON.stringify(nextExpenses));
  } catch {}

  return nextExpenses;
};

/**
 * Removes any expenses linked to a deleted activity.
 */
export const removeMirrorExpensesForDeletedActivity = (
  deletedActivityId: string,
  deletedActivity: Activity | undefined,
  expenses: Expense[]
): Expense[] | null => {
  const linkedExpenseIds = expenses
    .filter(e => e.activityId === deletedActivityId || (deletedActivity && isActivityTrackedInExpenses(deletedActivity, [e])))
    .map(e => e.id);

  if (linkedExpenseIds.length === 0) return null;

  const nextExpenses = expenses.filter(e => !linkedExpenseIds.includes(e.id));
  try {
    localStorage.setItem('ba_itinerary_expenses', JSON.stringify(nextExpenses));
  } catch {}
  deleteExpensesByIdsDb(linkedExpenseIds).catch(console.error);

  return nextExpenses;
};

/**
 * Resolves the clean cost of an updated expense (summing items if present) and syncs both sides.
 */
export const computeUpdatedExpenseSync = (
  updatedExpense: Expense,
  activities: Activity[],
  expenses: Expense[]
): { nextActivities: Activity[] | null; nextExpenses: Expense[] | null } => {
  let cost = 0;
  if (updatedExpense.items && updatedExpense.items.length > 0) {
    cost = updatedExpense.items.reduce((sum, item) => sum + (parseCurrencyNumber(item.price) || 0), 0);
  } else {
    cost = Math.max(0, parseCurrencyNumber(updatedExpense.amountARS) || 0);
  }
  const title = updatedExpense.concept?.trim();
  const isItineraryMirror = Boolean(
    updatedExpense.isFromItinerary ||
    (typeof updatedExpense.id === 'string' && updatedExpense.id.startsWith('itinerary-'))
  );

  const actId = updatedExpense.activityId ||
    (typeof updatedExpense.id === 'string' && updatedExpense.id.startsWith('itinerary-') ? updatedExpense.id.replace('itinerary-', '') : null) ||
    activities.find(a => isActivityTrackedInExpenses(a, [updatedExpense]))?.id;

  let nextActivities: Activity[] | null = null;
  if (actId) {
    nextActivities = activities.map(a => {
      if (a.id === actId) {
        const syncedAct: Activity = {
          ...a,
          costEstimatedARS: cost,
          ...(title ? { title } : {}),
          ...(updatedExpense.category ? { category: updatedExpense.category } : {}),
          ...(updatedExpense.items ? { items: updatedExpense.items } : {}),
          ...(updatedExpense.type ? { type: updatedExpense.type } : {})
        };
        upsertActivityDb(syncedAct).catch(console.error);
        return syncedAct;
      }
      return a;
    });
    try {
      localStorage.setItem('ba_itinerary_activities', JSON.stringify(nextActivities));
    } catch {}
  }

  let nextExpenses: Expense[] | null = null;
  if (!isItineraryMirror) {
    const finalized: Expense = {
      ...updatedExpense,
      amountARS: cost,
      concept: title || 'Gasto',
      activityId: actId || updatedExpense.activityId || null,
      items: updatedExpense.items || [],
      type: updatedExpense.type || 'plan'
    };
    nextExpenses = expenses.map(e => e.id === finalized.id ? finalized : e);
    try {
      localStorage.setItem('ba_itinerary_expenses', JSON.stringify(nextExpenses));
    } catch {}
    upsertExpenseDb(finalized).catch(console.error);
  } else {
    const matchingExp = expenses.find(e => e.activityId === actId || isActivityTrackedInExpenses({ id: actId || '', title: title || '' }, [e]));
    if (matchingExp) {
      const finalized: Expense = {
        ...matchingExp,
        amountARS: cost,
        concept: title || matchingExp.concept,
        category: updatedExpense.category || matchingExp.category,
        items: updatedExpense.items || matchingExp.items || [],
        type: updatedExpense.type || matchingExp.type || 'plan'
      };
      nextExpenses = expenses.map(e => e.id === matchingExp.id ? finalized : e);
      try {
        localStorage.setItem('ba_itinerary_expenses', JSON.stringify(nextExpenses));
      } catch {}
      upsertExpenseDb(finalized).catch(console.error);
    }
  }

  return { nextActivities, nextExpenses };
};

