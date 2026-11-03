import {
  INITIAL_ACTIVITIES,
  INITIAL_EXPENSES,
  INITIAL_CHECKLIST,
  TRIP_INFO
} from '../data/initialData';
import { DEFAULT_EXPENSE_CATEGORIES } from './categoryChecklistService';
import { Activity } from '../types/activity';
import { Expense, MediaReceipt } from '../types/expense';
import { ExpenseCategory, ChecklistItem } from '../types/category';

const STORAGE_KEYS = [
  'ba_itinerary_activities',
  'ba_itinerary_expenses',
  'ba_itinerary_checklist',
  'ba_itinerary_categories',
  'ba_itinerary_receipts',
  'ba_itinerary_exchange_rate',
  'ba_user_trips',
  'ba_active_trip_id',
  'tripflow_current_user'
];

/**
 * CONTINGENCY SYSTEM:
 * Generates an immutable, timestamped snapshot of all trip data, activities,
 * expenses, and checklists in LocalStorage before any update or reload.
 */
export const createSafetyDataBackup = (tag = 'manual'): boolean => {
  try {
    const backup: Record<string, string | null> = {};
    STORAGE_KEYS.forEach(key => {
      backup[key] = localStorage.getItem(key);
    });

    const payload = JSON.stringify({
      timestamp: new Date().toISOString(),
      tag,
      data: backup
    });

    localStorage.setItem('ba_safety_backup_latest', payload);
    localStorage.setItem(`ba_safety_backup_${Date.now()}`, payload);

    // Keep rolling history of maximum 3 timestamped backups to prevent storage bloat
    const allKeys = Object.keys(localStorage);
    const backupKeys = allKeys
      .filter(k => k.startsWith('ba_safety_backup_') && k !== 'ba_safety_backup_latest')
      .sort();
    if (backupKeys.length > 3) {
      const keysToRemove = backupKeys.slice(0, backupKeys.length - 3);
      keysToRemove.forEach(k => localStorage.removeItem(k));
    }
    return true;
  } catch (err) {
    console.error('Error creating safety data backup:', err);
    return false;
  }
};

/**
 * Flush all active in-memory state directly to LocalStorage and create
 * a safety backup before applying an app update or reloading the page.
 */
export const flushAndBackupBeforeUpdate = (
  activities?: Activity[],
  expenses?: Expense[],
  categories?: ExpenseCategory[],
  receipts?: MediaReceipt[],
  checklist?: ChecklistItem[],
  exchangeRate?: number
): void => {
  try {
    if (activities) localStorage.setItem('ba_itinerary_activities', JSON.stringify(activities));
    if (expenses) localStorage.setItem('ba_itinerary_expenses', JSON.stringify(expenses));
    if (categories) localStorage.setItem('ba_itinerary_categories', JSON.stringify(categories));
    if (receipts) localStorage.setItem('ba_itinerary_receipts', JSON.stringify(receipts));
    if (checklist) localStorage.setItem('ba_itinerary_checklist', JSON.stringify(checklist));
    if (exchangeRate) localStorage.setItem('ba_itinerary_exchange_rate', exchangeRate.toString());

    createSafetyDataBackup('before_update_reload');
  } catch (err) {
    console.error('Error flushing state before update:', err);
  }
};

export const initLocalStorageCacheVersion = (): void => {
  try {
    if (localStorage.getItem('ba_trip_wipe_clean_v4') !== 'true') {
      createSafetyDataBackup('legacy_v3_to_v4_migration');
      localStorage.removeItem('ba_itinerary_activities');
      localStorage.removeItem('ba_itinerary_expenses');
      localStorage.removeItem('ba_itinerary_checklist');
      localStorage.removeItem('ba_itinerary_receipts');
      localStorage.setItem('ba_trip_wipe_clean_v4', 'true');
    }
  } catch {}
};

export const loadStoredActivities = (): Activity[] => {
  try {
    const saved = localStorage.getItem('ba_itinerary_activities');
    if (saved) {
      const parsed: Activity[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map(a => ({
          ...a,
          tripId: a.tripId || 'trip-ba-2026',
          userId: a.userId || 'user-admin-jools'
        }));
      }
    }
  } catch {}
  return INITIAL_ACTIVITIES.map(a => ({
    ...a,
    tripId: 'trip-ba-2026',
    userId: 'user-admin-jools'
  }));
};

export const loadStoredExpenses = (): Expense[] => {
  try {
    const saved = localStorage.getItem('ba_itinerary_expenses');
    if (saved) {
      const parsed: Expense[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map(e => ({
          ...e,
          tripId: e.tripId || 'trip-ba-2026',
          userId: e.userId || 'user-admin-jools'
        }));
      }
    }
  } catch {}
  return INITIAL_EXPENSES.map(e => ({
    ...e,
    tripId: 'trip-ba-2026',
    userId: 'user-admin-jools'
  }));
};

export const loadStoredChecklist = (): ChecklistItem[] => {
  try {
    const saved = localStorage.getItem('ba_itinerary_checklist');
    if (saved) {
      const parsed: ChecklistItem[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map(c => ({
          ...c,
          tripId: c.tripId || 'trip-ba-2026',
          userId: c.userId || 'user-admin-jools'
        }));
      }
    }
  } catch {}
  return INITIAL_CHECKLIST.map(c => ({
    ...c,
    tripId: 'trip-ba-2026',
    userId: 'user-admin-jools'
  }));
};

export const loadStoredCategories = (): ExpenseCategory[] => {
  try {
    const saved = localStorage.getItem('ba_itinerary_categories');
    if (saved) {
      const parsed: ExpenseCategory[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map(cat => ({
          ...cat,
          tripId: cat.tripId || 'trip-ba-2026',
          userId: cat.userId || 'user-admin-jools'
        }));
      }
    }
    return DEFAULT_EXPENSE_CATEGORIES.map(cat => ({
      ...cat,
      tripId: 'trip-ba-2026',
      userId: 'user-admin-jools'
    }));
  } catch {
    return DEFAULT_EXPENSE_CATEGORIES.map(cat => ({
      ...cat,
      tripId: 'trip-ba-2026',
      userId: 'user-admin-jools'
    }));
  }
};

export const loadStoredReceipts = (): MediaReceipt[] => {
  try {
    const saved = localStorage.getItem('ba_itinerary_receipts');
    if (saved) {
      const parsed: MediaReceipt[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map(r => ({
          ...r,
          tripId: r.tripId || 'trip-ba-2026',
          userId: r.userId || 'user-admin-jools'
        }));
      }
    }
  } catch {}
  return [];
};

export const loadStoredExchangeRate = (): number => {
  try {
    const saved = localStorage.getItem('ba_itinerary_exchange_rate');
    const parsed = Number(saved);
    if (parsed && parsed >= 100) return parsed;
  } catch {}
  return TRIP_INFO.defaultExchangeRateUSD || 1540;
};
