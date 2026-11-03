import { useState, useEffect } from 'react';
import { Activity } from '../types/activity';
import { Expense, MediaReceipt } from '../types/expense';
import { ChecklistItem, ExpenseCategory } from '../types/category';
import { Trip, DEFAULT_BA_TRIP } from '../types/trip';
import {
  initLocalStorageCacheVersion,
  loadStoredActivities,
  loadStoredExpenses,
  loadStoredCategories,
  loadStoredReceipts,
  loadStoredChecklist,
  loadStoredExchangeRate
} from '../services/storageService';
import {
  loadStoredTrips,
  loadStoredActiveTripId,
  saveStoredTrips,
  saveStoredActiveTripId,
  upsertTripDb,
  deleteTripDb,
  fetchTripsDb
} from '../services/tripService';
import { useTripSync } from './useTripSync';
import { useItinerary } from './useItinerary';
import { useWallet } from './useWallet';
import { useAuth } from './useAuth';
import { parseCurrencyNumber, isActivityTrackedInExpenses } from '../utils/helpers';

interface UseTripDataOptions {
  onNavigateToTab?: (tab: string) => void;
}

export function useTripData(options?: UseTripDataOptions) {
  initLocalStorageCacheVersion();

  // Multi-Trip State
  const [trips, setTrips] = useState<Trip[]>(loadStoredTrips);
  const [activeTripId, setActiveTripId] = useState<string>(loadStoredActiveTripId);

  // Modals state
  const [isTripSelectorOpen, setIsTripSelectorOpen] = useState(false);
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Auth Hook
  const auth = useAuth();

  // Data states
  const [activities, setActivities] = useState<Activity[]>(loadStoredActivities);
  const [expenses, setExpenses] = useState<Expense[]>(loadStoredExpenses);
  const [categories, setCategories] = useState<ExpenseCategory[]>(loadStoredCategories);
  const [receipts, setReceipts] = useState<MediaReceipt[]>(loadStoredReceipts);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(loadStoredChecklist);
  const [exchangeRate, setExchangeRate] = useState<number>(loadStoredExchangeRate);

  // Active Trip derived
  const activeTrip = trips.find((t) => t.id === activeTripId) || trips[0] || DEFAULT_BA_TRIP;

  // Sync trips if user logs in
  useEffect(() => {
    if (auth.user) {
      fetchTripsDb(auth.user.id).then((cloudTrips) => {
        if (cloudTrips && cloudTrips.length > 0) {
          setTrips(cloudTrips);
          saveStoredTrips(cloudTrips);
        }
      });
    }
  }, [auth.user]);

  const { cloudSyncStatus, setCloudSyncStatus } = useTripSync({
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
  });

  const itinerary = useItinerary({
    activities,
    setActivities,
    expenses,
    setExpenses,
    setCloudSyncStatus,
    onNavigateToTab: options?.onNavigateToTab
  });

  const wallet = useWallet({
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
  });

  // Trip Handlers
  const handleSelectTrip = (tripId: string) => {
    setActiveTripId(tripId);
    saveStoredActiveTripId(tripId);
    const chosen = trips.find(t => t.id === tripId);
    if (chosen && chosen.exchangeRate) {
      wallet.handleUpdateExchangeRate(chosen.exchangeRate);
    }
  };

  const handleCreateTrip = async (newTrip: Trip) => {
    const tripWithUser: Trip = {
      ...newTrip,
      userId: auth.user?.id || null
    };
    const nextTrips = [tripWithUser, ...trips];
    setTrips(nextTrips);
    saveStoredTrips(nextTrips);
    handleSelectTrip(tripWithUser.id);
    await upsertTripDb(tripWithUser);
  };

  const handleDeleteTrip = async (tripId: string) => {
    const nextTrips = trips.filter(t => t.id !== tripId);
    if (nextTrips.length === 0) return;
    setTrips(nextTrips);
    saveStoredTrips(nextTrips);
    if (activeTripId === tripId) {
      handleSelectTrip(nextTrips[0].id);
    }
    await deleteTripDb(tripId);
  };

  const untrackedItineraryARS = activities
    .filter((a) => {
      const cost = parseCurrencyNumber(a.costEstimatedARS) || 0;
      return cost > 0 && !isActivityTrackedInExpenses(a, expenses);
    })
    .reduce((sum, a) => sum + (parseCurrencyNumber(a.costEstimatedARS) || 0), 0);

  const totalExpensesARS = expenses.reduce((sum, e) => sum + (parseCurrencyNumber(e.amountARS) || 0), 0);
  const totalSpentARS = untrackedItineraryARS + totalExpensesARS;
  const completedActivitiesCount = activities.filter((a) => a.completed).length;

  return {
    // Entities
    activities,
    expenses,
    categories,
    receipts,
    checklist,
    exchangeRate,
    cloudSyncStatus,

    // Trips state & handlers
    trips,
    activeTrip,
    activeTripId,
    handleSelectTrip,
    handleCreateTrip,
    handleDeleteTrip,

    // Modal toggles
    isTripSelectorOpen,
    setIsTripSelectorOpen,
    isCreateTripOpen,
    setIsCreateTripOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,

    // Auth slice
    auth,

    // Calculated metrics
    totalSpentARS,
    completedActivitiesCount,

    // Itinerary slice
    ...itinerary,

    // Wallet slice
    ...wallet
  };
}