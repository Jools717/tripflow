import React, { useState } from 'react';
import { Calendar, CheckCircle, Plus, Kanban, Share2 } from 'lucide-react';
import { Activity } from '../../types/activity';
import { Trip } from '../../types/trip';
import { generateTripDays } from '../../data/initialData';
import KanbanBoard from './KanbanBoard';
import TimelineView from './TimelineView';
import QuickMoveModal from './QuickMoveModal';
import InspectActivityModal from './InspectActivityModal';

interface ItineraryViewProps {
  activities: Activity[];
  exchangeRate?: number;
  onToggleComplete: (id: string) => void;
  onToggleWithFriend: (id: string) => void;
  onOpenAddModal: (dayNum: number) => void;
  onOpenEditModal: (act: Activity) => void;
  onDeleteActivity: (id: string) => void;
  onSelectOnMap: (act: Activity) => void;
  selectedDayNumber: number;
  setSelectedDayNumber: (dayNum: number) => void;
  onMoveActivityDay?: (actId: string, targetDayNum: number) => void;
  activeTrip?: Trip;
  onOpenExport?: () => void;
}

export default function ItineraryView({
  activities,
  exchangeRate = 1280,
  onToggleComplete,
  onToggleWithFriend,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteActivity,
  onSelectOnMap,
  selectedDayNumber,
  setSelectedDayNumber,
  onMoveActivityDay,
  activeTrip,
  onOpenExport
}: ItineraryViewProps) {
  const [viewMode, setViewMode] = useState<'kanban' | 'timeline'>('kanban');
  const [filterFriend, setFilterFriend] = useState<'all' | 'withFriend' | 'solo'>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [kanbanWeek, setKanbanWeek] = useState<'all' | number>('all');

  const [quickMoveActivity, setQuickMoveActivity] = useState<Activity | null>(null);
  const [inspectingActivity, setInspectingActivity] = useState<Activity | null>(null);
  const [moveToast, setMoveToast] = useState<string | null>(null);

  const filterActivityItem = (act: Activity) => {
    if (filterFriend === 'withFriend' && !act.withFriend) return false;
    if (filterFriend === 'solo' && act.withFriend) return false;
    if (viewMode === 'timeline' && filterPeriod !== 'all' && act.period !== filterPeriod) return false;
    return true;
  };

  const allTripDays = generateTripDays(activeTrip);
  const totalDays = allTripDays.length;
  const weekCount = Math.ceil(totalDays / 7);
  // Si cambias a un viaje más corto, una semana inexistente vuelve a "Todos"
  const activeWeek = kanbanWeek !== 'all' && kanbanWeek < weekCount ? kanbanWeek : 'all';
  const visibleDays = allTripDays.filter(d => {
    if (activeWeek === 'all') return true;
    return d.dayNumber > activeWeek * 7 && d.dayNumber <= (activeWeek + 1) * 7;
  });

  const showMoveFeedback = (title: string, dayNum: number) => {
    setMoveToast(`"${title}" movido al Día ${dayNum}`);
    setTimeout(() => setMoveToast(null), 2800);
  };

  const handleMoveActivityWithToast = (actId: string, targetDayNum: number) => {
    if (!onMoveActivityDay) return;
    const act = activities.find(a => a.id === actId);
    if (act && Number(act.dayNumber) !== Number(targetDayNum)) {
      onMoveActivityDay(actId, Number(targetDayNum));
      showMoveFeedback(act.title, Number(targetDayNum));
    }
  };

  const executeQuickMove = (targetDayNum: number) => {
    if (!quickMoveActivity) return;
    handleMoveActivityWithToast(quickMoveActivity.id, targetDayNum);
    setQuickMoveActivity(null);
  };

  const handleJumpToDayTimeline = (dayNum: number) => {
    setSelectedDayNumber(dayNum);
    setViewMode('timeline');
  };

  return (
    <div className="itinerary-view">
      {/* TOAST NOTIFICATION */}
      {moveToast && (
        <div className="itinerary-move-toast animate-fade-in">
          <CheckCircle size={16} className="text-emerald" />
          <span>{moveToast}</span>
        </div>
      )}

      {/* TOP VIEW SWITCHER & CONTROLS */}
      <div className="itinerary-top-toolbar">
        <div className="view-mode-toggle-group">
          <button
            type="button"
            className={`btn-view-toggle ${viewMode === 'kanban' ? 'active' : ''}`}
            onClick={() => setViewMode('kanban')}
            title="Tablero visual con columnas por día y tarjetas deslizables"
          >
            <Kanban size={16} />
            <span className="toggle-label">Tablero Kanban</span>
            <span className="toggle-pill-badge">Ágil</span>
          </button>

          <button
            type="button"
            className={`btn-view-toggle ${viewMode === 'timeline' ? 'active' : ''}`}
            onClick={() => setViewMode('timeline')}
            title="Vista cronológica día a día con mapa y detalles paso a paso"
          >
            <Calendar size={16} />
            <span className="toggle-label">Vista Día a Día</span>
            <span className="toggle-pill-badge">Detalle</span>
          </button>
        </div>

        {viewMode === 'kanban' && (
          <div className="kanban-week-filter">
            <span className="filter-label-subtle">Semana:</span>
            <button
              className={`week-chip ${activeWeek === 'all' ? 'active' : ''}`}
              onClick={() => setKanbanWeek('all')}
            >
              Todos ({totalDays} {totalDays === 1 ? 'Día' : 'Días'})
            </button>
            {weekCount > 1 && Array.from({ length: weekCount }, (_, w) => {
              const from = w * 7 + 1;
              const to = Math.min((w + 1) * 7, totalDays);
              return (
                <button
                  key={w}
                  className={`week-chip ${activeWeek === w ? 'active' : ''}`}
                  onClick={() => setKanbanWeek(w)}
                >
                  Semana {w + 1} ({from === to ? `Día ${from}` : `Días ${from}-${to}`})
                </button>
              );
            })}
          </div>
        )}

        <div className="itinerary-quick-actions">
          <div className="filter-button-group">
            <button
              className={`filter-chip ${filterFriend === 'all' ? 'active' : ''}`}
              onClick={() => setFilterFriend('all')}
            >
              Todos
            </button>
            <button
              className={`filter-chip ${filterFriend === 'withFriend' ? 'active' : ''}`}
              onClick={() => setFilterFriend('withFriend')}
              title="Planes acompañado"
            >
              👫 Acompañado
            </button>
            <button
              className={`filter-chip ${filterFriend === 'solo' ? 'active' : ''}`}
              onClick={() => setFilterFriend('solo')}
              title="Planes en solitario"
            >
              👤 Solo
            </button>
          </div>

          <div className="itinerary-primary-actions">
            {onOpenExport && (
              <button
                type="button"
                className="btn-export-trip"
                onClick={onOpenExport}
                title="Exportar a PDF, calendario o compartir por WhatsApp"
              >
                <Share2 size={16} />
                <span>Exportar</span>
              </button>
            )}
            <button
              className="btn-add-activity"
              onClick={() => onOpenAddModal(selectedDayNumber)}
            >
              <Plus size={16} />
              <span>Nuevo Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <KanbanBoard
          visibleDays={visibleDays}
          activities={activities}
          exchangeRate={exchangeRate}
          filterActivityItem={filterActivityItem}
          onMoveActivityWithToast={handleMoveActivityWithToast}
          onOpenAddModal={onOpenAddModal}
          onJumpToDayTimeline={handleJumpToDayTimeline}
          onToggleComplete={onToggleComplete}
          onToggleWithFriend={onToggleWithFriend}
          onInspect={setInspectingActivity}
          onQuickMove={setQuickMoveActivity}
          onEdit={onOpenEditModal}
          onDelete={onDeleteActivity}
        />
      )}

      {/* VIEW 2: TIMELINE DAY-BY-DAY */}
      {viewMode === 'timeline' && (
        <TimelineView
          activities={activities}
          days={allTripDays}
          selectedDayNumber={selectedDayNumber}
          setSelectedDayNumber={setSelectedDayNumber}
          filterPeriod={filterPeriod}
          setFilterPeriod={setFilterPeriod}
          filterActivityItem={filterActivityItem}
          exchangeRate={exchangeRate}
          onOpenAddModal={onOpenAddModal}
          onToggleComplete={onToggleComplete}
          onToggleWithFriend={onToggleWithFriend}
          onQuickMove={setQuickMoveActivity}
          onSelectOnMap={onSelectOnMap}
          onEdit={onOpenEditModal}
          onDelete={onDeleteActivity}
        />
      )}

      {/* MODAL: 1-CLICK QUICK MOVE DAY PICKER */}
      <QuickMoveModal
        quickMoveActivity={quickMoveActivity}
        activities={activities}
        days={allTripDays}
        onClose={() => setQuickMoveActivity(null)}
        onExecuteQuickMove={executeQuickMove}
      />

      {/* MODAL: KANBAN DETAILED INSPECTION */}
      <InspectActivityModal
        inspectingActivity={inspectingActivity}
        exchangeRate={exchangeRate}
        onClose={() => setInspectingActivity(null)}
        onOpenQuickMove={setQuickMoveActivity}
        onDelete={onDeleteActivity}
        onEdit={onOpenEditModal}
      />
    </div>
  );
}

