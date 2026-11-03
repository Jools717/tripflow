import React from 'react';
import { X, Plus, Check, Plane, Calendar, DollarSign, Trash2 } from 'lucide-react';
import { Trip } from '../../types/trip';

interface TripSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  trips: Trip[];
  activeTripId: string;
  onSelectTrip: (tripId: string) => void;
  onOpenCreateTrip: () => void;
  onDeleteTrip?: (tripId: string) => void;
}

export default function TripSelectorModal({
  isOpen,
  onClose,
  trips,
  activeTripId,
  onSelectTrip,
  onOpenCreateTrip,
  onDeleteTrip
}: TripSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-overlay animate-fade-in" onClick={onClose}>
      <div className="trip-selector-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="trip-modal-header">
          <div className="trip-modal-title">
            <Plane size={22} className="text-sky" />
            <div>
              <h3>Mis Viajes</h3>
              <p>Cambia de destino o crea una nueva aventura</p>
            </div>
          </div>

          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Trips List */}
        <div className="trip-modal-body">
          <div className="trips-cards-list">
            {trips.map((trip) => {
              const isActive = trip.id === activeTripId;

              return (
                <div
                  key={trip.id}
                  className={`trip-selection-card ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    onSelectTrip(trip.id);
                    onClose();
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="trip-card-flag-box">
                    <span className="trip-flag-large">{trip.flagEmoji || '✈️'}</span>
                  </div>

                  <div className="trip-card-info">
                    <div className="trip-card-title-row">
                      <h4>{trip.title}</h4>
                      {isActive && (
                        <span className="active-trip-pill">
                          <Check size={12} />
                          <span>Activo</span>
                        </span>
                      )}
                    </div>

                    <span className="trip-card-city">
                      📍 {trip.destinationCity} ({trip.countryCode})
                    </span>

                    <div className="trip-card-meta-row">
                      <span className="trip-meta-item">
                        <Calendar size={13} />
                        <span>{trip.startDate} al {trip.endDate}</span>
                      </span>
                      <span className="trip-meta-item">
                        <DollarSign size={13} />
                        <span>${trip.budgetTotalBase} {trip.baseCurrency}</span>
                      </span>
                    </div>
                  </div>

                  {onDeleteTrip && trips.length > 1 && !isActive && (
                    <button
                      type="button"
                      className="btn-delete-trip"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`¿Deseas eliminar "${trip.title}"?`)) {
                          onDeleteTrip(trip.id);
                        }
                      }}
                      title="Eliminar viaje"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action button */}
          <div className="trip-modal-actions">
            <button
              type="button"
              className="btn-primary btn-block btn-new-trip"
              onClick={() => {
                onClose();
                onOpenCreateTrip();
              }}
            >
              <Plus size={18} />
              <span>Crear Nuevo Viaje</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
