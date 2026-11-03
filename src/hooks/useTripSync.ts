import { useState, useEffect } from 'react';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { fetchLiveDolarBlue } from '../services/exchangeRateService';
import { fetchInitialSupabaseData, subscribeToRealtimeChanges } from '../services/syncService';
import { Activity } from '../types/activity';
import { Expense, MediaReceipt } from '../types/expense';
import { ChecklistItem, ExpenseCategory } from '../types/category';
import { SyncStatus } from '../types/supabase';

interface UseTripSyncOptions {
  activeTripId?: string;
  activities: Activity[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  checklist: ChecklistItem[];
  setChecklist: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  categories: ExpenseCategory[];
  setCategories: React.Dispatch<React.SetStateAction<ExpenseCategory[]>>;
  receipts: MediaReceipt[];
  setReceipts: React.Dispatch<React.SetStateAction<MediaReceipt[]>>;
  exchangeRate: number;
  setExchangeRate: React.Dispatch<React.SetStateAction<number>>;
}

export function useTripSync({
  activeTripId,
  activities,
  setActivities,
  expenses,
  setExpenses,
  checklist,
  setChecklist,
  categories,
  setCategories,
  receipts,
  setReceipts,
  exchangeRate,
  setExchangeRate
}: UseTripSyncOptions) {
  const [cloudSyncStatus, setCloudSyncStatus] = useState<SyncStatus>(
    isSupabaseConfigured ? 'syncing' : 'offline'
  );

  // Auto-fetch live Dólar Blue on load
  useEffect(() => {
    let isMounted = true;
    fetchLiveDolarBlue().then((liveRate) => {
      if (isMounted && liveRate) setExchangeRate(liveRate);
    });
    return () => {
      isMounted = false;
    };
  }, [setExchangeRate]);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('ba_itinerary_categories', JSON.stringify(categories));
    } catch {}
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('ba_itinerary_receipts', JSON.stringify(receipts));
    } catch {}
  }, [receipts]);

  useEffect(() => {
    try {
      localStorage.setItem('ba_itinerary_activities', JSON.stringify(activities));
    } catch {}
  }, [activities]);

  useEffect(() => {
    try {
      localStorage.setItem('ba_itinerary_expenses', JSON.stringify(expenses));
    } catch {}
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem('ba_itinerary_checklist', JSON.stringify(checklist));
    } catch {}
  }, [checklist]);

  useEffect(() => {
    try {
      localStorage.setItem('ba_itinerary_exchange_rate', exchangeRate.toString());
    } catch {}
  }, [exchangeRate]);

  // SUPABASE: Load Normalized Tables & Setup Realtime Subscriptions
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setCloudSyncStatus('offline');
      return;
    }

    let isMounted = true;
    const safetyTimer = setTimeout(() => {
      if (isMounted) setCloudSyncStatus((prev) => (prev === 'syncing' ? 'connected' : prev));
    }, 3500);

    setCloudSyncStatus('syncing');
    fetchInitialSupabaseData(activeTripId)
      .then((data) => {
        if (!isMounted) return;
        if (data.activities) setActivities(data.activities);
        if (data.expenses) setExpenses(data.expenses);
        if (data.checklist) setChecklist(data.checklist);
        if (data.exchangeRate) setExchangeRate(data.exchangeRate);
        if (data.categories) setCategories(data.categories);
        if (data.receipts) setReceipts(data.receipts);
        setCloudSyncStatus('connected');
      })
      .catch((err) => {
        console.error('Error connecting to Supabase tables:', err);
        if (isMounted) setCloudSyncStatus('connected');
      })
      .finally(() => clearTimeout(safetyTimer));

    const unsubscribe = subscribeToRealtimeChanges({
      setActivities,
      setExpenses,
      setChecklist,
      setExchangeRate,
      setCategories,
      setReceipts,
      onSubscribed: () => {
        if (isMounted) setCloudSyncStatus('connected');
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [setActivities, setExpenses, setChecklist, setExchangeRate, setCategories, setReceipts]);

  return {
    cloudSyncStatus,
    setCloudSyncStatus
  };
}
