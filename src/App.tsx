import React, { useState } from 'react';
import Header from './components/common/Header';
import Navigation from './components/common/Navigation';
import ItineraryView from './components/itinerary/ItineraryView';
import MapView from './components/MapView';
import BudgetTracker from './components/wallet/BudgetTracker';
import SurvivalGuide from './components/SurvivalGuide';
import ChecklistView from './components/ChecklistView';
import TripsDashboard from './components/trips/TripsDashboard';
import ActivityModal from './components/modals/ActivityModal';
import AuthModal from './components/auth/AuthModal';
import TripSelectorModal from './components/trips/TripSelectorModal';
import CreateTripWizard from './components/trips/CreateTripWizard';
import UpdateModal from './components/updates/UpdateModal';
import UpdateBannerPill from './components/updates/UpdateBannerPill';
import { useTripData } from './hooks/useTripData';
import { useAppUpdate } from './hooks/useAppUpdate';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('itinerario');

  const trip = useTripData({
    onNavigateToTab: setActiveTab
  });

  const appUpdate = useAppUpdate();

  return (
    <div className="app-root">
      <Header
        activitiesCount={trip.activities.length}
        completedCount={trip.completedActivitiesCount}
        totalSpentARS={trip.totalSpentARS}
        exchangeRate={trip.exchangeRate}
        onUpdateExchangeRate={trip.handleUpdateExchangeRate}
        cloudSyncStatus={trip.cloudSyncStatus}
        onNavigateToBudget={() => setActiveTab('gastos')}
        activeTrip={trip.activeTrip}
        onOpenTripSelector={() => trip.setIsTripSelectorOpen(true)}
        user={trip.auth.user}
        onOpenAuthModal={() => trip.setIsAuthModalOpen(true)}
        onOpenWhatsNew={appUpdate.forceShowWhatsNew}
      />

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content-container">
        {activeTab === 'viajes' && (
          <TripsDashboard
            trips={trip.trips}
            activeTripId={trip.activeTripId}
            onSelectTrip={trip.handleSelectTrip}
            onOpenCreateWizard={() => trip.setIsCreateTripOpen(true)}
            onDeleteTrip={trip.handleDeleteTrip}
            onNavigateToTab={setActiveTab}
            allActivities={trip.allActivities}
            allExpenses={trip.allExpenses}
            user={trip.auth.user}
          />
        )}

        {activeTab === 'itinerario' && (
          <ItineraryView
            activities={trip.activities}
            exchangeRate={trip.exchangeRate}
            onToggleComplete={trip.handleToggleComplete}
            onToggleWithFriend={trip.handleToggleWithFriend}
            onOpenAddModal={trip.handleOpenAddModal}
            onOpenEditModal={trip.handleOpenEditModal}
            onDeleteActivity={trip.handleDeleteActivity}
            onSelectOnMap={trip.handleSelectOnMap}
            selectedDayNumber={trip.selectedDayNumber}
            setSelectedDayNumber={trip.setSelectedDayNumber}
            onMoveActivityDay={trip.handleMoveActivityDay}
            activeTrip={trip.activeTrip}
          />
        )}

        {activeTab === 'mapa' && (
          <MapView
            activities={trip.activities}
            selectedActivity={trip.selectedMapActivity}
            onSelectActivity={trip.setSelectedMapActivity}
          />
        )}

        {(activeTab === 'gastos' || activeTab === 'mercado') && (
          <BudgetTracker
            expenses={trip.expenses}
            activities={trip.activities}
            receipts={trip.receipts}
            categories={trip.categories}
            onAddExpense={trip.handleAddExpense}
            onDeleteExpense={trip.handleDeleteExpense}
            onUpdateExpense={trip.handleUpdateExpense}
            onUpdateActivityCost={trip.handleUpdateActivityCost}
            onAddCategory={trip.handleAddCategory}
            onDeleteCategory={trip.handleDeleteCategory}
            exchangeRate={trip.exchangeRate}
            onUpdateExchangeRate={trip.handleUpdateExchangeRate}
            activeTrip={trip.activeTrip}
          />
        )}

        {activeTab === 'tips' && <SurvivalGuide />}

        {activeTab === 'checklist' && (
          <ChecklistView
            checklist={trip.checklist}
            onToggleChecklist={trip.handleToggleChecklist}
            onAddChecklist={trip.handleAddChecklist}
            onDeleteChecklist={trip.handleDeleteChecklist}
          />
        )}
      </main>

      {/* Floating pill for users with app already open when an update is detected */}
      <UpdateBannerPill
        isVisible={appUpdate.hasBackgroundUpdate}
        onUpdateApp={appUpdate.handleOpenBackgroundUpdateModal}
      />

      {/* Modals & Wizards */}
      <ActivityModal
        isOpen={trip.isActivityModalOpen}
        onClose={trip.handleCloseActivityModal}
        onSave={trip.handleSaveActivity}
        editingActivity={trip.editingActivity}
        currentDayNumber={trip.modalDayNumber}
        exchangeRate={trip.exchangeRate}
      />

      <TripSelectorModal
        isOpen={trip.isTripSelectorOpen}
        onClose={() => trip.setIsTripSelectorOpen(false)}
        trips={trip.trips}
        activeTripId={trip.activeTripId}
        onSelectTrip={trip.handleSelectTrip}
        onOpenCreateTrip={() => trip.setIsCreateTripOpen(true)}
        onDeleteTrip={trip.handleDeleteTrip}
      />

      <CreateTripWizard
        isOpen={trip.isCreateTripOpen}
        onClose={() => trip.setIsCreateTripOpen(false)}
        onCreateTrip={(newTrip) => {
          trip.handleCreateTrip(newTrip);
          setActiveTab('itinerario');
        }}
        currentUserId={trip.auth.user?.id || 'user-admin-jools'}
      />

      <AuthModal
        isOpen={trip.isAuthModalOpen}
        onClose={() => trip.setIsAuthModalOpen(false)}
        user={trip.auth.user}
        onSignInCredentials={trip.auth.signInWithCredentials}
        onSignInGoogle={trip.auth.signInWithGoogle}
        onSignInOtp={trip.auth.signInWithOtp}
        onSignOut={trip.auth.signOut}
        onContinueAsGuest={trip.auth.continueAsGuest}
      />

      {/* App Update & What's New System */}
      <UpdateModal
        isOpen={appUpdate.isUpdateModalOpen}
        onClose={appUpdate.handleDismissUpdate}
        initialStage={appUpdate.modalStage}
        onApplyUpdate={appUpdate.handleApplyReload}
      />

      <div className="mobile-bottom-spacer"></div>
    </div>
  );
}
