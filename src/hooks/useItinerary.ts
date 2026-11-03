import { useState } from 'react';
import { Activity } from '../types/activity';
import { Expense } from '../types/expense';
import { SyncStatus } from '../types/supabase';
import { isSupabaseConfigured } from '../services/supabaseClient';
import {
  upsertActivityDb,
  insertActivityDb,
  updateActivityFieldsDb,
  deleteActivityDb
} from '../services/activityService';
import {
  syncActivityToMatchingExpenses,
  removeMirrorExpensesForDeletedActivity
} from '../services/mirrorSyncService';
import { parseCurrencyNumber } from '../utils/helpers';

interface UseItineraryOptions {
  activities: Activity[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  setCloudSyncStatus: React.Dispatch<React.SetStateAction<SyncStatus>>;
  onNavigateToTab?: (tab: string) => void;
}

export function useItinerary({
  activities,
  setActivities,
  expenses,
  setExpenses,
  setCloudSyncStatus,
  onNavigateToTab
}: UseItineraryOptions) {
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [selectedMapActivity, setSelectedMapActivity] = useState<Activity | null>(null);

  const [isActivityModalOpen, setIsActivityModalOpen] = useState<boolean>(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [modalDayNumber, setModalDayNumber] = useState<number>(1);

  const handleToggleComplete = async (id: string) => {
    const act = activities.find(a => a.id === id);
    if (!act) return;
    const newCompleted = !act.completed;
    setActivities(prev => prev.map(a => a.id === id ? { ...a, completed: newCompleted } : a));
    if (isSupabaseConfigured) {
      setCloudSyncStatus('saving');
      await updateActivityFieldsDb(id, { completed: newCompleted });
      setCloudSyncStatus('connected');
    }
  };

  const handleToggleWithFriend = async (id: string) => {
    const act = activities.find(a => a.id === id);
    if (!act) return;
    const newWithFriend = !act.withFriend;
    setActivities(prev => prev.map(a => a.id === id ? { ...a, withFriend: newWithFriend } : a));
    if (isSupabaseConfigured) {
      setCloudSyncStatus('saving');
      await updateActivityFieldsDb(id, { with_friend: newWithFriend });
      setCloudSyncStatus('connected');
    }
  };

  const handleOpenAddModal = (dayNumber?: number) => {
    setEditingActivity(null);
    setModalDayNumber(Number(dayNumber || selectedDayNumber || 1));
    setIsActivityModalOpen(true);
  };

  const handleOpenEditModal = (activity: Activity) => {
    setEditingActivity(activity);
    setModalDayNumber(Number(activity.dayNumber || 1));
    setIsActivityModalOpen(true);
  };

  const handleCloseActivityModal = () => {
    setIsActivityModalOpen(false);
  };

  const handleSaveActivity = async (formData: Partial<Activity>) => {
    let cleanCost = 0;
    if (formData.type === 'compras' && Array.isArray(formData.items) && formData.items.length > 0) {
      cleanCost = formData.items.reduce((sum, item) => sum + (parseCurrencyNumber(item.price) || 0), 0);
    } else if (formData.type === 'nota') {
      cleanCost = 0;
    } else {
      cleanCost = Math.max(0, parseCurrencyNumber(formData.costEstimatedARS) || 0);
    }

    if (editingActivity) {
      const updated: Activity = {
        ...editingActivity,
        ...formData,
        id: editingActivity.id,
        dayNumber: Number(formData.dayNumber || editingActivity.dayNumber || 1),
        costEstimatedARS: cleanCost,
        type: formData.type || editingActivity.type || 'plan',
        items: formData.items || editingActivity.items || []
      };
      setActivities(prev => prev.map(a => a.id === editingActivity.id ? updated : a));
      if (isSupabaseConfigured) {
        setCloudSyncStatus('saving');
        await upsertActivityDb(updated);
        setCloudSyncStatus('connected');
      }
      const syncedExpenses = syncActivityToMatchingExpenses(updated, cleanCost, expenses);
      if (syncedExpenses) setExpenses(syncedExpenses);
    } else {
      const newActivity: Activity = {
        id: 'act-' + Date.now(),
        dayNumber: Number(formData.dayNumber || modalDayNumber || selectedDayNumber || 1),
        time: formData.time || '10:00',
        period: formData.period || 'mañana',
        title: formData.title || 'Nueva actividad',
        barrio: formData.barrio || 'Buenos Aires',
        category: formData.category || 'cultura',
        address: formData.address || '',
        coords: formData.coords || null,
        withFriend: formData.withFriend || false,
        completed: false,
        tip: formData.tip || '',
        costEstimatedARS: cleanCost,
        type: formData.type || 'plan',
        items: formData.items || []
      };
      setActivities(prev => [...prev, newActivity]);
      if (isSupabaseConfigured) {
        setCloudSyncStatus('saving');
        await insertActivityDb(newActivity);
        setCloudSyncStatus('connected');
      }
    }
    setIsActivityModalOpen(false);
  };

  const handleDeleteActivity = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este plan del itinerario?')) return;
    const actToDelete = activities.find(a => a.id === id);
    setActivities(prev => prev.filter(a => a.id !== id));

    const remainingExpenses = removeMirrorExpensesForDeletedActivity(id, actToDelete, expenses);
    if (remainingExpenses) setExpenses(remainingExpenses);

    if (isSupabaseConfigured) {
      setCloudSyncStatus('saving');
      await deleteActivityDb(id);
      setCloudSyncStatus('connected');
    }
  };

  const handleMoveActivityDay = async (id: string, targetDayNumber: number) => {
    const targetNum = Number(targetDayNumber);
    const act = activities.find(a => a.id === id);
    if (!act || Number(act.dayNumber) === targetNum) return;
    setActivities(prev => prev.map(a => a.id === id ? { ...a, dayNumber: targetNum } : a));
    if (isSupabaseConfigured) {
      setCloudSyncStatus('saving');
      await updateActivityFieldsDb(id, { day_number: targetNum });
      setCloudSyncStatus('connected');
    }
  };

  const handleSelectOnMap = (activity: Activity) => {
    setSelectedMapActivity(activity);
    if (onNavigateToTab) onNavigateToTab('mapa');
  };

  return {
    selectedDayNumber,
    setSelectedDayNumber,
    selectedMapActivity,
    setSelectedMapActivity,
    isActivityModalOpen,
    editingActivity,
    modalDayNumber,
    handleToggleComplete,
    handleToggleWithFriend,
    handleOpenAddModal,
    handleOpenEditModal,
    handleCloseActivityModal,
    handleSaveActivity,
    handleDeleteActivity,
    handleMoveActivityDay,
    handleSelectOnMap
  };
}