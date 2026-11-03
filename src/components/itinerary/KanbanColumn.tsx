import React from 'react';
import { Calendar, MapPin, Plus, Coffee } from 'lucide-react';
import { Activity } from '../../types/activity';
import KanbanCard from './KanbanCard';

interface DayInfo {
  dayNumber: number;
  dateFormatted: string;
  barrioPrincipal: string;
  summary?: string;
  isDepartureDay?: boolean;
}

interface KanbanColumnProps {
  day: DayInfo;
  dayActsCount: number;
  filteredDayActs: Activity[];
  exchangeRate: number;
  isOver: boolean;
  draggedActivityId: string | null;
  expandedPurchases: Record<string, boolean>;
  onToggleExpandPurchase: (id: string) => void;
  onDragOverColumn: (e: React.DragEvent<HTMLDivElement>, dayNum: number) => void;
  onDragLeaveColumn: (e: React.DragEvent<HTMLDivElement>, dayNum: number) => void;
  onDropOnColumn: (e: React.DragEvent<HTMLDivElement>, dayNum: number) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, act: Activity) => void;
  onDragEnd: () => void;
  onOpenAddModal: (dayNum: number) => void;
  onJumpToDayTimeline: (dayNum: number) => void;
  onToggleComplete: (id: string) => void;
  onToggleWithFriend: (id: string) => void;
  onInspect: (act: Activity) => void;
  onQuickMove: (act: Activity) => void;
  onEdit: (act: Activity) => void;
  onDelete: (id: string) => void;
}

export default function KanbanColumn({
  day,
  dayActsCount,
  filteredDayActs,
  exchangeRate,
  isOver,
  draggedActivityId,
  expandedPurchases,
  onToggleExpandPurchase,
  onDragOverColumn,
  onDragLeaveColumn,
  onDropOnColumn,
  onDragStart,
  onDragEnd,
  onOpenAddModal,
  onJumpToDayTimeline,
  onToggleComplete,
  onToggleWithFriend,
  onInspect,
  onQuickMove,
  onEdit,
  onDelete
}: KanbanColumnProps) {
  const isDeparture = Boolean(day.isDepartureDay);

  return (
    <div
      className={`kanban-column ${isOver ? 'is-drag-over' : ''} ${isDeparture ? 'is-departure' : ''}`}
      onDragOver={(e) => onDragOverColumn(e, day.dayNumber)}
      onDragLeave={(e) => onDragLeaveColumn(e, day.dayNumber)}
      onDrop={(e) => onDropOnColumn(e, day.dayNumber)}
    >
      {/* Column Header */}
      <div className="kanban-col-header">
        <div className="col-header-top">
          <div className="col-day-badge">
            <span className="col-day-num">DÍA {day.dayNumber}</span>
            {isDeparture && <span className="col-dep-tag">✈️ Salida</span>}
          </div>
          <span className="col-acts-count">{dayActsCount} {dayActsCount === 1 ? 'plan' : 'planes'}</span>
        </div>

        <div className="col-date-text">{day.dateFormatted}</div>

        <div className="col-barrio-tag" title={day.barrioPrincipal}>
          <MapPin size={11} />
          <span>{day.barrioPrincipal}</span>
        </div>

        {/* Quick Column Actions */}
        <div className="col-header-actions">
          <button
            type="button"
            className="btn-col-add"
            onClick={() => onOpenAddModal(day.dayNumber)}
            title={`Agregar plan al Día ${day.dayNumber}`}
          >
            <Plus size={13} />
            <span>Agregar</span>
          </button>

          <button
            type="button"
            className="btn-col-timeline"
            onClick={() => onJumpToDayTimeline(day.dayNumber)}
            title="Ver este día en Timeline detallado"
          >
            <Calendar size={13} />
            <span>Ver Día</span>
          </button>
        </div>
      </div>

      {/* Drop zone indicator message during drag */}
      {isOver && (
        <div className="kanban-drop-placeholder animate-pulse">
          <span>Soltar aquí para mover al Día {day.dayNumber}</span>
        </div>
      )}

      {/* Cards List */}
      <div className="kanban-cards-stack">
        {filteredDayActs.length === 0 ? (
          <div className="kanban-empty-col">
            <Coffee size={24} className="text-muted" />
            <p>Sin planes en este día</p>
            <button
              type="button"
              className="btn-add-empty-col"
              onClick={() => onOpenAddModal(day.dayNumber)}
            >
              + Agregar
            </button>
          </div>
        ) : (
          filteredDayActs.map((act) => (
            <KanbanCard
              key={act.id}
              act={act}
              exchangeRate={exchangeRate}
              isBeingDragged={draggedActivityId === act.id}
              isPurchaseExpanded={Boolean(expandedPurchases[act.id])}
              onToggleExpandPurchase={onToggleExpandPurchase}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onToggleComplete={onToggleComplete}
              onToggleWithFriend={onToggleWithFriend}
              onInspect={onInspect}
              onQuickMove={onQuickMove}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

