import React from 'react';
import {
  MapPin, Navigation as NavIcon, Users, CheckCircle, Circle,
  Edit3, Trash2, Lightbulb, ExternalLink, ArrowRightLeft,
  ShoppingBag, StickyNote
} from 'lucide-react';
import { Activity } from '../../types/activity';
import { getGoogleMapsTransitUrl, formatCurrencyARS, formatCurrencyUSD, getCategoryBadge } from '../../utils/helpers';
import { getPeriodIcon } from './KanbanCard';

interface TimelineCardProps {
  act: Activity;
  isLast: boolean;
  exchangeRate: number;
  onToggleComplete: (id: string) => void;
  onToggleWithFriend: (id: string) => void;
  onQuickMove: (act: Activity) => void;
  onSelectOnMap: (act: Activity) => void;
  onEdit: (act: Activity) => void;
  onDelete: (id: string) => void;
}

export default function TimelineCard({
  act,
  isLast,
  exchangeRate,
  onToggleComplete,
  onToggleWithFriend,
  onQuickMove,
  onSelectOnMap,
  onEdit,
  onDelete
}: TimelineCardProps) {
  const catBadge = getCategoryBadge(act.category);
  const mapsUrl = getGoogleMapsTransitUrl(act);

  return (
    <div className={`activity-card ${act.completed ? 'completed' : ''}`}>
      {/* Timeline connector visual line */}
      <div className="timeline-marker-col">
        <button
          className="completion-toggle-btn"
          onClick={() => onToggleComplete(act.id)}
          title={act.completed ? 'Marcar como pendiente' : 'Marcar como realizado'}
        >
          {act.completed ? (
            <CheckCircle className="check-icon completed" size={24} />
          ) : (
            <Circle className="check-icon" size={24} />
          )}
        </button>
        {!isLast && <div className="timeline-line"></div>}
      </div>

      {/* Main Card Body */}
      <div className="activity-card-content">
        {/* Card Header: Time, Category, Barrio, Friend Toggle */}
        <div className="act-header-row">
          <div className="act-time-badge">
            {act.type === 'nota' ? (
              <span className="kcard-nota-pill"><StickyNote size={12} /> Nota</span>
            ) : act.type === 'compras' ? (
              <span className="kcard-compras-pill"><ShoppingBag size={12} /> Compras</span>
            ) : (
              <>
                {getPeriodIcon(act.period)}
                <span>{act.time} hs</span>
              </>
            )}
          </div>

          <span
            className="category-pill"
            style={{ backgroundColor: catBadge.bg, color: catBadge.color }}
          >
            {catBadge.label}
          </span>

          <span className="barrio-pill">
            <MapPin size={12} />
            {act.barrio}
          </span>

          <button
            className={`friend-toggle-chip ${act.withFriend ? 'with-friend' : 'solo'}`}
            onClick={() => onToggleWithFriend(act.id)}
            title="Haz clic para cambiar si va tu amiga o vas solo"
          >
            <Users size={13} />
            <span>{act.withFriend ? 'Con mi amiga' : 'Solo'}</span>
          </button>
        </div>

        {/* Activity Title */}
        <h3 className={`act-title ${act.completed ? 'line-through' : ''}`}>
          {act.title}
        </h3>

        {/* Nota Content (if type === 'nota') */}
        {act.type === 'nota' && (act.note || act.description) && (
          <div className="timeline-nota-box">
            <StickyNote size={16} className="text-amber" />
            <p>{act.note || act.description}</p>
          </div>
        )}

        {/* Compras Multi-item breakdown list */}
        {(act.type === 'compras' || (act.items && act.items.length > 0)) && (
          <div className="timeline-compras-box">
            <div className="compras-box-header">
              <ShoppingBag size={14} className="text-purple" />
              <span>Artículos incluidos ({act.items?.length || 0}):</span>
            </div>
            <div className="compras-items-grid">
              {act.items?.map((it, idx) => (
                <div key={it.id || idx} className="compras-item-pill">
                  <span className="it-name">• {it.name || 'Artículo'}</span>
                  <strong className="it-price">{formatCurrencyARS(it.price || 0)}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description & Address */}
        {act.type !== 'nota' && act.description && (
          <p className="act-description">{act.description}</p>
        )}

        {act.address && (
          <div className="act-address">
            <MapPin size={14} className="address-icon" />
            <span>{act.address}</span>
          </div>
        )}

        {/* Local Tip Box */}
        {act.tip && (
          <div className="act-tip-box">
            <Lightbulb size={16} className="tip-icon" />
            <div className="tip-content">
              <strong>Tip porteño:</strong> {act.tip}
            </div>
          </div>
        )}

        {/* Footer: Estimated Cost + Actions */}
        <div className="act-footer">
          <div className="act-cost">
            {act.type === 'nota' ? (
              <span className="cost-nota">📌 Recordatorio / Nota</span>
            ) : act.costEstimatedARS > 0 ? (
              <div className="dual-currency-box">
                <span className="cost-ars">{formatCurrencyARS(act.costEstimatedARS)}</span>
                <span className="cost-usd-blue">≈ {formatCurrencyUSD(act.costEstimatedARS, exchangeRate)} USD Blue</span>
              </div>
            ) : (
              <span className="cost-free">Plan gratuito / En casa ($0)</span>
            )}
          </div>

          <div className="act-actions-group">
            <button
              type="button"
              className="btn-quick-move"
              onClick={() => onQuickMove(act)}
              title="Mover este plan a otro día con 1 clic"
            >
              <ArrowRightLeft size={14} />
              <span>Mover día</span>
            </button>

            {act.type !== 'nota' && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-google-maps"
                title="Abrir en Google Maps con ruta en transporte público (Subte/Colectivo)"
              >
                <NavIcon size={15} />
                <span>¿Cómo llegar?</span>
                <ExternalLink size={12} className="external-arrow" />
              </a>
            )}

            {act.coords && (
              <button
                className="btn-view-map"
                onClick={() => onSelectOnMap(act)}
                title="Ver en el mapa interactivo de la app"
              >
                <MapPin size={14} />
                <span className="desktop-only">Mapa</span>
              </button>
            )}

            <button
              className="btn-icon-subtle"
              onClick={() => onEdit(act)}
              title="Editar plan"
            >
              <Edit3 size={15} />
            </button>

            <button
              className="btn-icon-subtle danger"
              onClick={() => onDelete(act.id)}
              title="Eliminar plan"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

