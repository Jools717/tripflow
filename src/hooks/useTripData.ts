import { useState, useEffect, useMemo } from 'react';
import { Activity } from '../types/activity';
import { Expense, MediaReceipt } from '../types/expense';
import { ChecklistItem, ExpenseCategory } from '../types/category';
import { Trip, PLACEHOLDER_TRIP } from '../types/trip';
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
import { AuthApi } from './useAuth';
import { parseCurrencyNumber, isActivityTrackedInExpenses } from '../utils/helpers';
import { OWNER_USER_ID } from '../types/user';

interface UseTripDataOptions {
  auth: AuthApi;
  onNavigateToTab?: (tab: string) => void;
}

export function useTripData(options: UseTripDataOptions) {
  initLocalStorageCacheVersion();

  // Multi-Trip State
  const [trips, setTrips] = useState<Trip[]>(loadStoredTrips);
  const [activeTripId, setActiveTripId] = useState<string>(loadStoredActiveTripId);

  // Modals state
  const [isTripSelectorOpen, setIsTripSelectorOpen] = useState(false);
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Auth Hook
  const auth = options.auth;

  // Data states
  const [activities, setActivities] = useState<Activity[]>(loadStoredActivities);
  const [expenses, setExpenses] = useState<Expense[]>(loadStoredExpenses);
  const [categories, setCategories] = useState<ExpenseCategory[]>(loadStoredCategories);
  const [receipts, setReceipts] = useState<MediaReceipt[]>(loadStoredReceipts);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(loadStoredChecklist);
  const [exchangeRate, setExchangeRate] = useState<number>(loadStoredExchangeRate);

  // Active Trip derived
  const activeTrip = trips.find((t) => t.id === activeTripId) || trips[0] || PLACEHOLDER_TRIP;
  const hasTrips = trips.length > 0;
  // Sin viajes en el dispositivo hay que esperar a la nube antes de mostrar "Crea tu primer viaje"
  const [tripsLoaded, setTripsLoaded] = useState<boolean>(() => trips.length > 0);

  // Viajes de la cuenta desde la nube (la nube manda, aunque devuelva cero viajes)
  useEffect(() => {
    if (!auth.user) return;
    let cancelled = false;
    fetchTripsDb(auth.user.id).then((cloudTrips) => {
      if (cancelled) return;
      if (cloudTrips) {
        setTrips(cloudTrips);
        saveStoredTrips(cloudTrips);
      }
      setTripsLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [auth.user]);

  const { cloudSyncStatus, setCloudSyncStatus, cloudError, isOnline, pendingCount } = useTripSync({
    activeTripId: activeTrip.id,
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
    onNavigateToTab: options?.onNavigateToTab,
    activeTripId: activeTrip.id,
    userId: auth.user?.id || OWNER_USER_ID
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
    setCloudSyncStatus,
    activeTripId: activeTrip.id,
    userId: auth.user?.id || OWNER_USER_ID
  });

  // Cotización por viaje: Buenos Aires usa la cotización global (trip_settings / Dólar Blue);
  // el resto de viajes guarda la suya en trips.exchange_rate para no pisar la de BA.
  const isBaTrip = activeTrip.id === 'trip-ba-2026';
  const effectiveExchangeRate = isBaTrip
    ? exchangeRate
    : (activeTrip.exchangeRate && activeTrip.exchangeRate > 0 ? activeTrip.exchangeRate : exchangeRate);

  const handleUpdateTripExchangeRate = async (rate: number | string) => {
    if (isBaTrip) {
      await wallet.handleUpdateExchangeRate(rate);
      return;
    }
    const validRate = Number(rate);
    if (!validRate || isNaN(validRate) || validRate < 0.0001) return;
    const updatedTrip: Trip = { ...activeTrip, exchangeRate: validRate };
    const nextTrips = trips.map(t => (t.id === updatedTrip.id ? updatedTrip : t));
    setTrips(nextTrips);
    saveStoredTrips(nextTrips);
    setCloudSyncStatus('saving');
    await upsertTripDb(updatedTrip);
    setCloudSyncStatus('connected');
  };

  // Trip Handlers
  const handleSelectTrip = (tripId: string) => {
    setActiveTripId(tripId);
    saveStoredActiveTripId(tripId);
  };

  const handleCreateTrip = async (newTrip: Trip) => {
    const tripWithUser: Trip = {
      ...newTrip,
      userId: auth.user?.id || OWNER_USER_ID
    };
    const nextTrips = [tripWithUser, ...trips];
    setTrips(nextTrips);
    saveStoredTrips(nextTrips);
    handleSelectTrip(tripWithUser.id);
    await upsertTripDb(tripWithUser);
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (tripId === 'trip-ba-2026') {
      alert('El viaje principal de Buenos Aires 2026 está protegido y no se puede eliminar.');
      return;
    }
    const nextTrips = trips.filter(t => t.id !== tripId);
    if (nextTrips.length === 0) return;
    setTrips(nextTrips);
    saveStoredTrips(nextTrips);
    if (activeTripId === tripId) {
      handleSelectTrip(nextTrips[0].id);
    }
    await deleteTripDb(tripId);
  };

  // Filtered collections by active trip
  const activeActivities = useMemo(() => {
    return activities.filter(a => (a.tripId || 'trip-ba-2026') === activeTrip.id);
  }, [activities, activeTrip.id]);

  const activeExpenses = useMemo(() => {
    return expenses.filter(e => (e.tripId || 'trip-ba-2026') === activeTrip.id);
  }, [expenses, activeTrip.id]);

  const activeChecklist = useMemo(() => {
    return checklist.filter(c => (c.tripId || 'trip-ba-2026') === activeTrip.id);
  }, [checklist, activeTrip.id]);

  const activeCategories = useMemo(() => {
    return categories.filter(c => (c.tripId || 'trip-ba-2026') === activeTrip.id);
  }, [categories, activeTrip.id]);

  const activeReceipts = useMemo(() => {
    return receipts.filter(r => (r.tripId || 'trip-ba-2026') === activeTrip.id);
  }, [receipts, activeTrip.id]);

  // Metrics on active trip
  const untrackedItineraryARS = activeActivities
    .filter((a) => {
      const cost = parseCurrencyNumber(a.costEstimatedARS) || 0;
      return cost > 0 && !isActivityTrackedInExpenses(a, activeExpenses);
    })
    .reduce((sum, a) => sum + (parseCurrencyNumber(a.costEstimatedARS) || 0), 0);

  const totalExpensesARS = activeExpenses.reduce((sum, e) => sum + (parseCurrencyNumber(e.amountARS) || 0), 0);
  const totalSpentARS = untrackedItineraryARS + totalExpensesARS;
  const completedActivitiesCount = activeActivities.filter((a) => a.completed).length;

  return {
    // Entities for Active Trip
    activities: activeActivities,
    allActivities: activities,
    expenses: activeExpenses,
    allExpenses: expenses,
    categories: activeCategories.length > 0 ? activeCategories : categories,
    receipts: activeReceipts,
    checklist: activeChecklist.length > 0 ? activeChecklist : checklist,
    cloudSyncStatus,

    // Trips state & handlers
    trips,
    hasTrips,
    tripsLoaded,
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
    ...wallet,

    // Overrides por viaje (deben ir después del spread de wallet)
    exchangeRate: effectiveExchangeRate,
    handleUpdateExchangeRate: handleUpdateTripExchangeRate,
    cloudError,
    isOnline,
    pendingCount
  };
}
