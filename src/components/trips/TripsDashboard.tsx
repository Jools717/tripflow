import React, { useState } from 'react';
import {
  Plane, Calendar, Plus, Compass, Trash2, ArrowRight, Wallet, CheckCircle2, ShieldCheck, Sparkles, Clock
} from 'lucide-react';
import { Trip } from '../../types/trip';
import { Activity } from '../../types/activity';
import { Expense } from '../../types/expense';
import { UserProfile } from '../../types/user';
import { formatCurrency, getCurrencyFlag, parseCurrencyNumber } from '../../utils/helpers';

interface TripsDashboardProps {
  trips: Trip[];
  activeTripId: string;
  onSelectTrip: (tripId: string) => void;
  onOpenCreateWizard: () => void;
  onDeleteTrip: (tripId: string) => void;
  onNavigateToTab: (tab: string) => void;
  allActivities: Activity[];
  allExpenses: Expense[];
  user?: UserProfile | null;
}

export default function TripsDashboard({
  trips,
  activeTripId,
  onSelectTrip,
  onOpenCreateWizard,
  onDeleteTrip,
  onNavigateToTab,
  allActivities,
  allExpenses,
  user
}: TripsDashboardProps) {
  const [filterState, setFilterState] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const getTripTimingInfo = (trip: Trip) => {
    try {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const diffStart = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

      if (now > end) {
        return { status: 'completed', label: 'Viaje Concluido', tagClass: 'completed', durationDays };
      }
      if (now >= start && now <= end) {
        return { status: 'current', label: '¡En Curso Hoy!', tagClass: 'current', durationDays };
      }
      if (diffStart > 0) {
        return { status: 'upcoming', label: `Faltan ${diffStart} días`, tagClass: 'upcoming', durationDays };
      }
      return { status: 'upcoming', label: 'Próximamente', tagClass: 'upcoming', durationDays };
    } catch {
      return { status: 'upcoming', label: 'Fechas confirmadas', tagClass: 'upcoming', durationDays: 14 };
    }
  };

  const filteredTrips = trips.filter(trip => {
    if (filterState === 'all') return true;
    const timing = getTripTimingInfo(trip);
    if (filterState === 'active') return trip.id === activeTripId || timing.status === 'current';
    if (filterState === 'upcoming') return timing.status === 'upcoming';
    if (filterState === 'completed') return timing.status === 'completed';
    return true;
  });

  return (
    <div className="trips-dashboard-view animate-fade-in">
      
      {/* HERO BANNER */}
      <div className="trips-dashboard-hero">
        <div className="trips-hero-content">
          <div className="trips-user-badge-row">
            <div className="trips-user-avatar">
              <span>{(user?.displayName || 'U').charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <div className="trips-user-title-row">
                <h3>{user ? user.displayName : 'AdminJools'}</h3>
                {user?.role === 'admin' && (
                  <span className="admin-pill-tag">
                    <ShieldCheck size={12} />
                    <span>Admin</span>
                  </span>
                )}
              </div>
              <p className="trips-user-subtitle">
                {trips.length} {trips.length === 1 ? 'Aventura registrada' : 'Aventuras registradas'} en TripFlow
              </p>
            </div>
          </div>

          <div className="trips-hero-action">
            <button
              type="button"
              className="btn-create-trip-hero"
              onClick={onOpenCreateWizard}
            >
              <Plus size={18} />
              <span>Planificar Nuevo Viaje</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="trips-filter-pills-row">
          <button
            type="button"
            className={`trip-filter-pill ${filterState === 'all' ? 'active' : ''}`}
            onClick={() => setFilterState('all')}
          >
            Todos ({trips.length})
          </button>
          <button
            type="button"
            className={`trip-filter-pill ${filterState === 'active' ? 'active' : ''}`}
            onClick={() => setFilterState('active')}
          >
            Activo Ahora
          </button>
          <button
            type="button"
            className={`trip-filter-pill ${filterState === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilterState('upcoming')}
          >
            Próximos
          </button>
          <button
            type="button"
            className={`trip-filter-pill ${filterState === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterState('completed')}
          >
            Historial
          </button>
        </div>
      </div>

      {/* TRIPS GRID */}
      <div className="trips-cards-grid">
        {filteredTrips.map((trip) => {
          const isActive = trip.id === activeTripId;
          const timing = getTripTimingInfo(trip);
          const isBaPrimary = trip.id === 'trip-ba-2026';

          const tripActivities = allActivities.filter(a => (a.tripId || 'trip-ba-2026') === trip.id);
          const tripExpenses = allExpenses.filter(e => (e.tripId || 'trip-ba-2026') === trip.id);

          const totalDirect = tripExpenses.reduce((sum, e) => sum + (Number(e.amountARS) || 0), 0);
          const totalItin = tripActivities.reduce((sum, a) => sum + (parseCurrencyNumber(a.costEstimatedARS) || 0), 0);
          const totalSpentLocal = totalDirect + totalItin;

          const rate = trip.exchangeRate && trip.exchangeRate > 0 ? trip.exchangeRate : 1540;
          const totalSpentUSD = totalSpentLocal / rate;
          const budgetCap = trip.budgetTotalBase || 1000;
          const budgetPercent = Math.min(100, Math.round((totalSpentUSD / budgetCap) * 100));

          const baseFlag = getCurrencyFlag(trip.baseCurrency, trip.baseCurrency === 'USD' ? 'US' : undefined);
          const localFlag = trip.flagEmoji || getCurrencyFlag(trip.localCurrency, trip.countryCode);

          return (
            <div
              key={trip.id}
              className={`trip-dashboard-card ${isActive ? 'is-active-trip' : ''}`}
            >
              {/* Card Header Top */}
              <div className="trip-card-header-bar">
                <div className="trip-flag-city-badge">
                  <span className="card-flag-large">{localFlag}</span>
                  <div>
                    <span className="card-country-code">{trip.countryCode}</span>
                    <h4 className="card-trip-title">{trip.title}</h4>
                  </div>
                </div>

                <div className="trip-card-tags">
                  {isBaPrimary && (
                    <span className="card-protected-tag" title="Viaje principal original de Argentina">
                      ⭐ Principal
                    </span>
                  )}
                  {isActive ? (
                    <span className="card-active-pill">
                      <span className="pulse-green-dot"></span>
                      <span>En Uso</span>
                    </span>
                  ) : (
                    <span className={`card-timing-tag ${timing.tagClass}`}>
                      <Clock size={11} />
                      <span>{timing.label}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Destination & Dates */}
              <div className="trip-card-dest-row">
                <span className="trip-card-city-name">
                  📍 {trip.destinationCity}
                </span>
                <span className="trip-card-dates">
                  <Calendar size={13} />
                  <span>{trip.startDate} al {trip.endDate} ({timing.durationDays} días)</span>
                </span>
              </div>

              {/* Financial Progress Meter */}
              <div className="trip-card-finance-box">
                <div className="finance-labels-row">
                  <span className="finance-label">Presupuesto {baseFlag} ({budgetCap} {trip.baseCurrency}):</span>
                  <span className="finance-percent">{budgetPercent}%</span>
                </div>
                <div className="trip-card-progress-track">
                  <div
                    className={`trip-card-progress-bar ${budgetPercent >= 90 ? 'danger' : budgetPercent >= 70 ? 'warning' : 'healthy'}`}
                    style={{ width: `${budgetPercent}%` }}
                  ></div>
                </div>
                <div className="finance-values-sub">
                  <span>Gastado: <strong>{localFlag} {formatCurrency(totalSpentLocal, trip.localCurrency)}</strong></span>
                  <span>(≈ {baseFlag} ${Math.round(totalSpentUSD)} {trip.baseCurrency})</span>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="trip-card-metrics-row">
                <div className="card-metric-item">
                  <Compass size={14} className="text-sky" />
                  <span>{tripActivities.length} actividades</span>
                </div>
                <div className="card-metric-item">
                  <CheckCircle2 size={14} className="text-emerald" />
                  <span>{tripActivities.filter(a => a.completed).length} listas</span>
                </div>
                <div className="card-metric-item">
                  <Wallet size={14} className="text-amber" />
                  <span>{tripExpenses.length} compras</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="trip-card-footer-actions">
                <button
                  type="button"
                  className="btn-open-trip-itinerary"
                  onClick={() => {
                    onSelectTrip(trip.id);
                    onNavigateToTab('itinerario');
                  }}
                >
                  <span>Abrir Itinerario</span>
                  <ArrowRight size={15} />
                </button>

                <button
                  type="button"
                  className="btn-open-trip-budget"
                  onClick={() => {
                    onSelectTrip(trip.id);
                    onNavigateToTab('gastos');
                  }}
                  title="Ver Billetera de este viaje"
                >
                  <Wallet size={15} />
                </button>

                {!isBaPrimary && (
                  <button
                    type="button"
                    className="btn-delete-trip-card"
                    onClick={() => {
                      if (window.confirm(`¿Deseas eliminar el viaje "${trip.title}"?`)) {
                        onDeleteTrip(trip.id);
                      }
                    }}
                    title="Eliminar viaje"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

