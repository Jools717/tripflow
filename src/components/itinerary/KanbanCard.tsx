import React from 'react';
import {
  Clock, MapPin, Users, CheckCircle, Circle, Edit3, Trash2,
  Sun, Sunset, Moon, ArrowRightLeft, GripVertical, Eye,
  ShoppingBag, StickyNote
} from 'lucide-react';
import { Activity } from '../../types/activity';
import { formatCurrencyARS, formatCurrencyUSD, getCategoryBadge } from '../../utils/helpers';
import KanbanItemsDropdown from './KanbanItemsDropdown';

interface KanbanCardProps {
  act: Activity;
  exchangeRate: number;
  isBeingDragged: boolean;
  isPurchaseExpanded: boolean;
  onToggleExpandPurchase: (id: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, act: Activity) => void;
  onDragEnd: () => void;
  onToggleComplete: (id: string) => void;
  onToggleWithFriend: (id: string) => void;
  onInspect: (act: Activity) => void;
  onQuickMove: (act: Activity) => void;
  onEdit: (act: Activity) => void;
  onDelete: (id: string) => void;
}

export const getPeriodIcon = (period: string) => {
  switch (period) {
    case 'mañana': return <Sun size={14} className="period-icon morning" />;
    case 'tarde': return <Sunset size={14} className="period-icon afternoon" />;
    case 'noche': return <Moon size={14} className="period-icon night" />;
    default: return <Clock size={14} />;
  }
};

export default function KanbanCard({
  act,
  exchangeRate,
  isBeingDragged,
  isPurchaseExpanded,
  onToggleExpandPurchase,
  onDragStart,
  onDragEnd,
  onToggleComplete,
  onToggleWithFriend,
  onInspect,
  onQuickMove,
  onEdit,
  onDelete
}: KanbanCardProps) {
  const catBadge = getCategoryBadge(act.category);

  return (
    <div
      className={`kanban-card ${act.completed ? 'is-completed' : ''} ${isBeingDragged ? 'is-dragging' : ''}`}
      draggable={true}
      onDragStart={(e) => onDragStart(e, act)}
      onDragEnd={onDragEnd}
    >
      {/* Card Top Row: Grip handle, Time / Type badge, Category, Check */}
      <div className="kcard-header">
        <div className="kcard-grip" title="Arrastra para mover a otro día">
          <GripVertical size={14} className="text-muted" />
        </div>

        <div className="kcard-time">
          {act.type === 'nota' ? (
            <span className="kcard-nota-pill"><StickyNote size={11} /> Nota</span>
          ) : act.type === 'compras' ? (
            <span className="kcard-compras-pill"><ShoppingBag size={11} /> Compras</span>
          ) : (
            <>
              {getPeriodIcon(act.period)}
              <span>{act.time} hs</span>
            </>
          )}
        </div>

        <span
          className="kcard-category-pill"
          style={{ backgroundColor: catBadge.bg, color: catBadge.color }}
        >
          {catBadge.label}
        </span>

        <button
          type="button"
          className="kcard-check-btn"
          onClick={() => onToggleComplete(act.id)}
          title={act.completed ? 'Marcar como pendiente' : 'Marcar como realizado'}
        >
          {act.completed ? (
            <CheckCircle size={17} className="text-emerald" />
          ) : (
            <Circle size={17} className="text-muted" />
          )}
        </button>
      </div>

      {/* Card Title */}
      <h4
        className={`kcard-title ${act.completed ? 'line-through' : ''}`}
        onClick={() => onInspect(act)}
        title="Haz clic para ver detalles del plan y ruta en Google Maps"
      >
        {act.title}
      </h4>

      {/* Nota Body Preview (if type === 'nota') */}
      {act.type === 'nota' && (act.note || act.description) && (
        <div className="kcard-nota-text">
          {act.note || act.description}
        </div>
      )}

      {/* Compras Multi-item toggle button & expandable list */}
      {(act.type === 'compras' || (act.items && act.items.length > 0)) && (
        <KanbanItemsDropdown
          activityId={act.id}
          items={act.items}
          totalCostARS={act.costEstimatedARS}
          isExpanded={isPurchaseExpanded}
          onToggleExpand={onToggleExpandPurchase}
        />
      )}

      {/* Card Barrio & Tags */}
      <div className="kcard-meta-row">
        <span className="kcard-barrio">
          <MapPin size={11} />
          {act.barrio}
        </span>

        <button
          type="button"
          className={`kcard-friend-pill ${act.withFriend ? 'with-friend' : 'solo'}`}
          onClick={() => onToggleWithFriend(act.id)}
          title="Alternar si va tu amiga o vas solo"
        >
          <Users size={11} />
          <span>{act.withFriend ? 'Amiga' : 'Solo'}</span>
        </button>
      </div>

      {/* Cost Row */}
      <div className="kcard-cost-row">
        {act.type === 'nota' ? (
          <span className="kcard-cost-nota">📌 Recordatorio / Nota</span>
        ) : act.costEstimatedARS > 0 ? (
          <span className="kcard-cost">
            {formatCurrencyARS(act.costEstimatedARS)}
            <small> (≈ {formatCurrencyUSD(act.costEstimatedARS, exchangeRate)} USD)</small>
          </span>
        ) : (
          <span className="kcard-cost-free">Plan sin costo ($0)</span>
        )}
      </div>

      {/* Action Tools Row */}
      <div className="kcard-actions-bar">
        <button
          type="button"
          className="kcard-action-btn move-btn"
          onClick={() => onQuickMove(act)}
          title="Mover este plan a cualquier otro día con 1 clic"
        >
          <ArrowRightLeft size={13} />
          <span>Mover</span>
        </button>

        <button
          type="button"
          className="kcard-action-btn detail-btn"
          onClick={() => onInspect(act)}
          title="Ver detalles, cómo llegar en Google Maps y tip porteño"
        >
          <Eye size={13} />
          <span>Detalle</span>
        </button>

        <button
          type="button"
          className="kcard-icon-btn"
          onClick={() => onEdit(act)}
          title="Editar plan"
        >
          <Edit3 size={13} />
        </button>

        <button
          type="button"
          className="kcard-icon-btn danger"
          onClick={() => onDelete(act.id)}
          title="Eliminar plan"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

