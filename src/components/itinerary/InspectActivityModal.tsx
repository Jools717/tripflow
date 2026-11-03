import React from 'react';
import {
  MapPin, Navigation as NavIcon, Users, Edit3, Trash2,
  Lightbulb, ExternalLink, ArrowRightLeft, Eye, X,
  ShoppingBag, StickyNote
} from 'lucide-react';
import { Activity } from '../../types/activity';
import { getGoogleMapsTransitUrl, formatCurrencyARS, formatCurrencyUSD, getCategoryBadge } from '../../utils/helpers';

interface InspectActivityModalProps {
  inspectingActivity: Activity | null;
  exchangeRate: number;
  onClose: () => void;
  onOpenQuickMove: (act: Activity) => void;
  onDelete: (id: string) => void;
  onEdit: (act: Activity) => void;
}

export default function InspectActivityModal({
  inspectingActivity,
  exchangeRate,
  onClose,
  onOpenQuickMove,
  onDelete,
  onEdit
}: InspectActivityModalProps) {
  if (!inspectingActivity) return null;

  const catBadge = getCategoryBadge(inspectingActivity.category);

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-container activity-inspect-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon-badge text-emerald">
              <Eye size={18} />
            </span>
            <div>
              <h3>
                {inspectingActivity.type === 'nota'
                  ? 'Detalle de la Nota'
                  : inspectingActivity.type === 'compras'
                  ? 'Lote de Compras'
                  : 'Detalle del Plan'}
              </h3>
              <p className="quick-move-subtitle">
                Día {inspectingActivity.dayNumber} {inspectingActivity.type !== 'nota' && `• ${inspectingActivity.time} hs`}
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

        <div className="inspect-modal-body">
          {/* Header Badges */}
          <div className="inspect-meta-row">
            <span
              className="category-pill"
              style={{
                backgroundColor: catBadge.bg,
                color: catBadge.color
              }}
            >
              {inspectingActivity.type === 'nota'
                ? 'Nota'
                : inspectingActivity.type === 'compras'
                ? '🛍️ Compras'
                : catBadge.label}
            </span>

            <span className="barrio-pill">
              <MapPin size={12} />
              {inspectingActivity.barrio}
            </span>

            <span className={`friend-toggle-chip ${inspectingActivity.withFriend ? 'with-friend' : 'solo'}`}>
              <Users size={12} />
              <span>{inspectingActivity.withFriend ? 'Con mi amiga' : 'Solo'}</span>
            </span>
          </div>

          {/* Title */}
          <h2 className="inspect-title">{inspectingActivity.title}</h2>

          {/* Address */}
          {inspectingActivity.address && (
            <div className="act-address">
              <MapPin size={14} className="address-icon" />
              <span>{inspectingActivity.address}</span>
            </div>
          )}

          {/* Nota / Recordatorio Body */}
          {inspectingActivity.type === 'nota' && (inspectingActivity.note || inspectingActivity.description) && (
            <div className="timeline-nota-box inspect-nota-box">
              <StickyNote size={18} className="text-amber" />
              <p>{inspectingActivity.note || inspectingActivity.description}</p>
            </div>
          )}

          {/* Multi-item Compras Table / List */}
          {(inspectingActivity.type === 'compras' || (inspectingActivity.items && inspectingActivity.items.length > 0)) && (
            <div className="inspect-compras-box">
              <div className="inspect-compras-header">
                <ShoppingBag size={16} className="text-purple" />
                <strong>Desglose de productos comprados ({inspectingActivity.items?.length || 0}):</strong>
              </div>
              <div className="inspect-items-table">
                {inspectingActivity.items?.map((it, idx) => (
                  <div key={it.id || idx} className="inspect-item-row">
                    <span className="it-num">{idx + 1}.</span>
                    <span className="it-name">{it.name || 'Artículo'}</span>
                    <strong className="it-price">{formatCurrencyARS(it.price || 0)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {inspectingActivity.type !== 'nota' && inspectingActivity.description && (
            <p className="inspect-description">{inspectingActivity.description}</p>
          )}

          {/* Tip Porteño */}
          {inspectingActivity.tip && (
            <div className="act-tip-box">
              <Lightbulb size={16} className="tip-icon" />
              <div className="tip-content">
                <strong>Tip porteño:</strong> {inspectingActivity.tip}
              </div>
            </div>
          )}

          {/* Estimated Cost */}
          <div className="inspect-cost-card">
            <span>{inspectingActivity.type === 'compras' ? 'Total acumulado del lote:' : 'Costo estimado:'}</span>
            {inspectingActivity.type === 'nota' ? (
              <strong className="text-amber">📌 Nota / Recordatorio sin costo</strong>
            ) : inspectingActivity.costEstimatedARS > 0 ? (
              <div className="dual-currency-box">
                <strong className="cost-ars">{formatCurrencyARS(inspectingActivity.costEstimatedARS)}</strong>
                <span className="cost-usd-blue">≈ {formatCurrencyUSD(inspectingActivity.costEstimatedARS, exchangeRate)} USD Blue</span>
              </div>
            ) : (
              <strong className="text-emerald">Plan gratuito ($0)</strong>
            )}
          </div>

          {/* Primary Google Maps Route Button (if not nota) */}
          {inspectingActivity.type !== 'nota' && (
            <a
              href={getGoogleMapsTransitUrl(inspectingActivity)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-inspect-maps"
            >
              <NavIcon size={16} />
              <span>¿Cómo llegar en Subte / Colectivo (Google Maps)?</span>
              <ExternalLink size={14} />
            </a>
          )}
        </div>

        <div className="modal-footer inspect-modal-footer">
          <div className="inspect-footer-left">
            <button
              type="button"
              className="btn-inspect-move"
              onClick={() => {
                const act = inspectingActivity;
                onClose();
                onOpenQuickMove(act);
              }}
              title="Mover este plan a otro día"
            >
              <ArrowRightLeft size={14} />
              <span>Mover a otro día</span>
            </button>

            <button
              type="button"
              className="btn-inspect-delete"
              onClick={() => {
                const id = inspectingActivity.id;
                onClose();
                onDelete(id);
              }}
              title="Eliminar este plan del itinerario"
            >
              <Trash2 size={14} />
              <span>Eliminar</span>
            </button>
          </div>

          <div className="inspect-footer-right">
            <button
              type="button"
              className="btn-inspect-close"
              onClick={onClose}
            >
              Cerrar
            </button>

            <button
              type="button"
              className="btn-inspect-edit"
              onClick={() => {
                const act = inspectingActivity;
                onClose();
                onEdit(act);
              }}
            >
              <Edit3 size={14} />
              <span>Editar Plan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

