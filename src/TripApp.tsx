import React, { Suspense, lazy, useState } from 'react';
import Header from './components/common/Header';
import Navigation from './components/common/Navigation';
import ItineraryView from './components/itinerary/ItineraryView';
import TabLoading from './components/common/TabLoading';
import ActivityModal from './components/modals/ActivityModal';
import AuthModal from './components/auth/AuthModal';
import FirstTripScreen from './components/trips/FirstTripScreen';
import NewPasswordModal from './components/auth/NewPasswordModal';
import TripSelectorModal from './components/trips/TripSelectorModal';
import UpdateModal from './components/updates/UpdateModal';
import UpdateBannerPill from './components/updates/UpdateBannerPill';
import DirectionsProvider from './components/directions/DirectionsProvider';
import { useTripData } from './hooks/useTripData';
import { useAppUpdate } from './hooks/useAppUpdate';
import { AuthApi } from './hooks/useAuth';
import { OWNER_USER_ID } from './types/user';

// Pestañas y modales pesados: se descargan solo cuando se usan (el Service Worker los guarda para offline)
const MapView = lazy(() => import('./components/MapView'));
const BudgetTracker = lazy(() => import('./components/wallet/BudgetTracker'));
const SurvivalGuide = lazy(() => import('./components/SurvivalGuide'));
const ChecklistView = lazy(() => import('./components/ChecklistView'));
const TripsDashboard = lazy(() => import('./components/trips/TripsDashboard'));
const CreateTripWizard = lazy(() => import('./components/trips/CreateTripWizard'));
const ExportModal = lazy(() => import('./components/export/ExportModal'));

/** La app de viajes. Solo se monta con una sesión iniciada (ver App.tsx). */
export default function TripApp({ auth }: { auth: AuthApi }) {
  const [activeTab, setActiveTab] = useState<string>('itinerario');
  const [isExportOpen, setIsExportOpen] = useState(false);

  const trip = useTripData({
    auth,
    onNavigateToTab: setActiveTab
  });

  const appUpdate = useAppUpdate();

  // Cuenta sin viajes (nueva o invitado): esperar a la nube y luego mostrar la bienvenida
  if (!trip.hasTrips) {
    if (!trip.tripsLoaded) return <TabLoading />;
    return (
      <>
        <FirstTripScreen
          user={auth.user}
          onCreateTrip={() => trip.setIsCreateTripOpen(true)}
          onOpenAuthModal={() => trip.setIsAuthModalOpen(true)}
          onSignOut={auth.signOut}
        />
        <Suspense fallback={null}>
          {trip.isCreateTripOpen && (
            <CreateTripWizard
              isOpen={trip.isCreateTripOpen}
              onClose={() => trip.setIsCreateTripOpen(false)}
              onCreateTrip={(newTrip) => {
                trip.handleCreateTrip(newTrip);
                setActiveTab('itinerario');
              }}
              currentUserId={auth.user?.id || OWNER_USER_ID}
            />
          )}
        </Suspense>
        <AuthModal isOpen={trip.isAuthModalOpen} onClose={() => trip.setIsAuthModalOpen(false)} auth={auth} />
      </>
    );
  }

  return (
    <DirectionsProvider trip={trip.activeTrip}>
    <div className="app-root">
      <Header
        activitiesCount={trip.activities.length}
        completedCount={trip.completedActivitiesCount}
        totalSpentARS={trip.totalSpentARS}
        exchangeRate={trip.exchangeRate}
        onUpdateExchangeRate={trip.handleUpdateExchangeRate}
        cloudSyncStatus={trip.cloudSyncStatus}
        cloudError={trip.cloudError}
        isOnline={trip.isOnline}
        pendingCount={trip.pendingCount}
        onNavigateToBudget={() => setActiveTab('gastos')}
        activeTrip={trip.activeTrip}
        onOpenTripSelector={() => trip.setIsTripSelectorOpen(true)}
        user={trip.auth.user}
        onOpenAuthModal={() => trip.setIsAuthModalOpen(true)}
        onSignOut={trip.auth.signOut}
        onOpenWhatsNew={appUpdate.forceShowWhatsNew}
      />

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content-container">
        <Suspense fallback={<TabLoading />}>
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
            onOpenExport={() => setIsExportOpen(true)}
          />
        )}

        {activeTab === 'mapa' && (
          <MapView
            activities={trip.activities}
            selectedActivity={trip.selectedMapActivity}
            onSelectActivity={trip.setSelectedMapActivity}
            activeTrip={trip.activeTrip}
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

        {activeTab === 'tips' && <SurvivalGuide activeTrip={trip.activeTrip} />}

        {activeTab === 'checklist' && (
          <ChecklistView
            checklist={trip.checklist}
            onToggleChecklist={trip.handleToggleChecklist}
            onAddChecklist={trip.handleAddChecklist}
            onDeleteChecklist={trip.handleDeleteChecklist}
            activeTrip={trip.activeTrip}
          />
        )}
        </Suspense>
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
        activeTrip={trip.activeTrip}
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

      <Suspense fallback={null}>
      {trip.isCreateTripOpen && (
      <CreateTripWizard
        isOpen={trip.isCreateTripOpen}
        onClose={() => trip.setIsCreateTripOpen(false)}
        onCreateTrip={(newTrip) => {
          trip.handleCreateTrip(newTrip);
          setActiveTab('itinerario');
        }}
        currentUserId={trip.auth.user?.id || OWNER_USER_ID}
      />
      )}
      {isExportOpen && (
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        trip={trip.activeTrip}
        activities={trip.activities}
        expenses={trip.expenses}
        exchangeRate={trip.exchangeRate}
        totalSpentLocal={trip.totalSpentARS}
      />
      )}
      </Suspense>

      <AuthModal
        isOpen={trip.isAuthModalOpen}
        onClose={() => trip.setIsAuthModalOpen(false)}
        auth={trip.auth}
      />
      <NewPasswordModal auth={trip.auth} />

      {/* App Update & What's New System */}
      <UpdateModal
        isOpen={appUpdate.isUpdateModalOpen}
        onClose={appUpdate.handleDismissUpdate}
        initialStage={appUpdate.modalStage}
        onApplyUpdate={appUpdate.handleApplyReload}
      />

      <div className="mobile-bottom-spacer"></div>
    </div>
    </DirectionsProvider>
  );
}
