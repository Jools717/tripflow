import React from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle, Coffee, Plus } from 'lucide-react';
import { Activity } from '../../types/activity';
import { DayInfo, INITIAL_DAYS } from '../../data/initialData';
import { formatCurrencyARS, formatCurrencyUSD, parseLocalDate } from '../../utils/helpers';

// "mié 12" y "may" a partir de la fecha del día (vale para cualquier viaje)
const pillDate = (iso: string, opts: Intl.DateTimeFormatOptions) => {
  const d = parseLocalDate(iso);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('es-ES', opts).replace('.', '');
};
import TimelineCard from './TimelineCard';

interface TimelineViewProps {
  activities: Activity[];
  days?: DayInfo[];
  selectedDayNumber: number;
  setSelectedDayNumber: (dayNum: number) => void;
  filterPeriod: string;
  setFilterPeriod: (period: string) => void;
  filterActivityItem: (act: Activity) => boolean;
  exchangeRate: number;
  onOpenAddModal: (dayNum: number) => void;
  onToggleComplete: (id: string) => void;
  onToggleWithFriend: (id: string) => void;
  onQuickMove: (act: Activity) => void;
  onSelectOnMap: (act: Activity) => void;
  onEdit: (act: Activity) => void;
  onDelete: (id: string) => void;
}

export default function TimelineView({
  activities,
  days = INITIAL_DAYS,
  selectedDayNumber,
  setSelectedDayNumber,
  filterPeriod,
  setFilterPeriod,
  filterActivityItem,
  exchangeRate,
  onOpenAddModal,
  onToggleComplete,
  onToggleWithFriend,
  onQuickMove,
  onSelectOnMap,
  onEdit,
  onDelete
}: TimelineViewProps) {
  const currentTimelineDay = days.find(d => d.dayNumber === selectedDayNumber) || days[0];
  const dayActivities = activities.filter(a => a.dayNumber === selectedDayNumber);
  const filteredTimelineActivities = dayActivities.filter(filterActivityItem);
  const completedInDay = dayActivities.filter(a => a.completed).length;
  const withFriendInDay = dayActivities.filter(a => a.withFriend).length;
  const dayTotalCost = dayActivities.reduce((s, a) => s + (Number(a.costEstimatedARS) || 0), 0);

  const goToPrevDay = () => {
    if (selectedDayNumber > 1) setSelectedDayNumber(selectedDayNumber - 1);
  };

  const goToNextDay = () => {
    if (selectedDayNumber < days.length) setSelectedDayNumber(selectedDayNumber + 1);
  };

  return (
    <div className="timeline-view-container animate-fade-in">
      {/* Horizontal Scrollable Day Carousel */}
      <div className="day-carousel-wrapper">
        <div className="day-carousel">
          {days.map((d) => {
            const isSelected = d.dayNumber === selectedDayNumber;
            const countForDay = activities.filter(a => a.dayNumber === d.dayNumber).length;
            const isCompletedAll = countForDay > 0 && activities.filter(a => a.dayNumber === d.dayNumber && !a.completed).length === 0;

            return (
              <button
                key={d.dayNumber}
                onClick={() => setSelectedDayNumber(d.dayNumber)}
                className={`day-pill-btn ${isSelected ? 'active' : ''} ${d.isDepartureDay ? 'departure-day' : ''}`}
              >
                <div className="day-pill-header">
                  <span className="day-number-label">Día {d.dayNumber}</span>
                  {isCompletedAll && <span className="day-check-indicator">✓</span>}
                </div>
                <div className="day-pill-date">
                  {pillDate(d.date, { weekday: 'short', day: 'numeric' })}
                </div>
                <div className="day-pill-barrio" title={d.barrioPrincipal}>
                  {pillDate(d.date, { month: 'short' })}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Day Banner */}
      <div className={`day-header-card ${currentTimelineDay.isDepartureDay ? 'departure-banner' : ''}`}>
        <div className="day-header-nav">
          <button
            className="day-nav-arrow"
            onClick={goToPrevDay}
            disabled={selectedDayNumber <= 1}
            aria-label="Día anterior"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="day-header-title-box">
            <div className="day-badge-row">
              <span className="badge-day-number">DÍA {currentTimelineDay.dayNumber} DE {days.length}</span>
              <span className="badge-day-barrio">{currentTimelineDay.barrioPrincipal}</span>
              {currentTimelineDay.isDepartureDay && (
                <span className="badge-warning">{currentTimelineDay.date === '2026-10-23' ? '✈️ Vuelo de salida 3:30 PM' : '✈️ Día de regreso'}</span>
              )}
            </div>
            <h2 className="day-title-text">{currentTimelineDay.dateFormatted}</h2>
            <p className="day-summary-text">{currentTimelineDay.summary}</p>
          </div>

          <button
            className="day-nav-arrow"
            onClick={goToNextDay}
            disabled={selectedDayNumber >= 14}
            aria-label="Día siguiente"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Day Stats & Filter Bar */}
        <div className="day-controls-bar">
          <div className="day-mini-stats">
            <span className="mini-stat">
              <strong>{dayActivities.length}</strong> planes
            </span>
            <span className="mini-stat">
              <strong>{withFriendInDay}</strong> acompañado
            </span>
            <span className="mini-stat">
              <strong>{completedInDay}</strong> listos
            </span>
            {dayTotalCost > 0 && (
              <span className="mini-stat day-cost-mini-stat">
                Est: <strong>{formatCurrencyARS(dayTotalCost)}</strong>
                <small className="usd-tag"> (≈ {formatCurrencyUSD(dayTotalCost, exchangeRate)} USD)</small>
              </span>
            )}
          </div>

          <div className="day-filters">
            <div className="filter-button-group">
              {(['all', 'mañana', 'tarde', 'noche'] as const).map((periodKey) => (
                <button
                  key={periodKey}
                  className={`filter-chip ${filterPeriod === periodKey ? 'active' : ''}`}
                  onClick={() => setFilterPeriod(periodKey)}
                >
                  {periodKey === 'all' ? 'Todo el día' : periodKey.charAt(0).toUpperCase() + periodKey.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Special alert on Departure Day */}
      {currentTimelineDay.isDepartureDay && (
        <div className="departure-alert-card">
          <AlertTriangle className="alert-icon" size={24} />
          <div>
            {currentTimelineDay.date === '2026-10-23' ? (
              <>
                {/* Nota personal del viaje original a Buenos Aires */}
                <h4>Viernes 23 de Octubre: Día de Despedida</h4>
                <p>
                  Tal como definiste, este día no tiene planes turísticos pesados: tu vuelo sale a las 3:30 PM.
                  Por el tráfico hacia Ezeiza, sal a más tardar a las 12:30 PM en Cabify/Uber. Dedica la mañana para
                  empacar con tranquilidad y despedirte de tu destino.
                </p>
              </>
            ) : (
              <>
                <h4>{currentTimelineDay.dateFormatted.replace(/^Día \d+ · /, '')}: Día de regreso</h4>
                <p>
                  Último día del viaje. Revisa la hora de tu vuelo o transporte, sal con tiempo y deja la mañana
                  para empacar con tranquilidad.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Timeline of Activities */}
      <div className="timeline-container">
        {filteredTimelineActivities.length === 0 ? (
          <div className="empty-day-state">
            <Coffee size={40} className="empty-icon" />
            <p className="empty-title">No hay actividades con estos filtros</p>
            <p className="empty-desc">
              Puedes agregar un nuevo plan para este día o cambiar los filtros de búsqueda.
            </p>
            <button
              className="btn-primary-sm"
              onClick={() => onOpenAddModal(selectedDayNumber)}
            >
              <Plus size={16} />
              <span>Agregar primer plan</span>
            </button>
          </div>
        ) : (
          filteredTimelineActivities.map((act, index) => (
            <TimelineCard
              key={act.id}
              act={act}
              isLast={index === filteredTimelineActivities.length - 1}
              exchangeRate={exchangeRate}
              onToggleComplete={onToggleComplete}
              onToggleWithFriend={onToggleWithFriend}
              onQuickMove={onQuickMove}
              onSelectOnMap={onSelectOnMap}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

