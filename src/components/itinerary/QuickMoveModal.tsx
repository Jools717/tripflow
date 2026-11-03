import React from 'react';
import { ArrowRightLeft, MapPin, X } from 'lucide-react';
import { Activity } from '../../types/activity';
import { INITIAL_DAYS } from '../../data/initialData';

interface QuickMoveModalProps {
  quickMoveActivity: Activity | null;
  activities: Activity[];
  onClose: () => void;
  onExecuteQuickMove: (targetDayNum: number) => void;
}

export default function QuickMoveModal({
  quickMoveActivity,
  activities,
  onClose,
  onExecuteQuickMove
}: QuickMoveModalProps) {
  if (!quickMoveActivity) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-container quick-move-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon-badge text-emerald">
              <ArrowRightLeft size={18} />
            </span>
            <div>
              <h3>Mover Plan a Otro Día</h3>
              <p className="quick-move-subtitle">
                Selecciona a qué día deseas trasladar: <strong>"{quickMoveActivity.title}"</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="quick-move-body">
          <div className="quick-move-days-grid">
            {INITIAL_DAYS.map((d) => {
              const isCurrent = d.dayNumber === quickMoveActivity.dayNumber;
              const dayPlansCount = activities.filter(a => a.dayNumber === d.dayNumber).length;

              return (
                <button
                  key={d.dayNumber}
                  type="button"
                  disabled={isCurrent}
                  className={`btn-target-day-tile ${isCurrent ? 'is-current' : ''}`}
                  onClick={() => onExecuteQuickMove(d.dayNumber)}
                >
                  <div className="tile-day-header">
                    <span className="tile-day-num">DÍA {d.dayNumber}</span>
                    {isCurrent ? (
                      <span className="tile-current-badge">Día actual</span>
                    ) : (
                      <span className="tile-plans-badge">{dayPlansCount} {dayPlansCount === 1 ? 'plan' : 'planes'}</span>
                    )}
                  </div>

                  <div className="tile-day-date">{d.dateFormatted}</div>

                  <div className="tile-day-barrio">
                    <MapPin size={11} />
                    <span>{d.barrioPrincipal}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

