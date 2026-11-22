import React, { useMemo, useState } from 'react';
import { X, FileText, CalendarPlus, MessageCircle, Copy, Share2, Download } from 'lucide-react';
import { Activity } from '../../types/activity';
import { Expense } from '../../types/expense';
import { Trip } from '../../types/trip';
import { TripExportInput } from '../../services/export/exportData';
import { openTripReport } from '../../services/export/reportExport';
import { downloadTripIcs } from '../../services/export/icsExport';
import {
  buildTripSummaryText,
  buildWhatsAppText,
  openWhatsAppShare,
  canNativeShare,
  nativeShare,
  copyTextToClipboard
} from '../../services/export/shareExport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  activities: Activity[];
  expenses: Expense[];
  exchangeRate: number;
  totalSpentLocal: number;
}

type Feedback = { type: 'success' | 'error'; text: string } | null;

export default function ExportModal({
  isOpen,
  onClose,
  trip,
  activities,
  expenses,
  exchangeRate,
  totalSpentLocal
}: ExportModalProps) {
  const [feedback, setFeedback] = useState<Feedback>(null);

  const input: TripExportInput = useMemo(
    () => ({ trip, activities, expenses, exchangeRate, totalSpentLocal }),
    [trip, activities, expenses, exchangeRate, totalSpentLocal]
  );

  const eventCount = activities.length;
  const timedCount = activities.filter((a) => /\d{1,2}[:.]\d{2}/.test(a.time || '')).length;

  if (!isOpen) return null;

  const notify = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handlePdf = () => {
    const ok = openTripReport(input);
    if (ok) notify('success', 'Informe abierto. Elige "Guardar como PDF" en el diálogo de impresión.');
    else notify('error', 'Tu navegador bloqueó la ventana. Permite las ventanas emergentes para TripFlow.');
  };

  const handleIcs = () => {
    if (eventCount === 0) {
      notify('error', 'Este viaje todavía no tiene planes para exportar.');
      return;
    }
    const count = downloadTripIcs(trip, activities);
    notify('success', `Calendario descargado con ${count} eventos. Ábrelo para añadirlo a tu calendario.`);
  };

  const handleWhatsApp = () => openWhatsAppShare(buildWhatsAppText(input));

  const handleNativeShare = async () => {
    const shared = await nativeShare(trip.title, buildTripSummaryText(input, 'full'));
    if (shared) notify('success', 'Resumen compartido.');
  };

  const handleCopy = async () => {
    const ok = await copyTextToClipboard(buildTripSummaryText(input, 'full'));
    if (ok) notify('success', 'Resumen copiado al portapapeles.');
    else notify('error', 'No se pudo copiar. Inténtalo de nuevo.');
  };

  return (
    <div className="modal-backdrop-overlay animate-fade-in" onClick={onClose}>
      <div
        className="export-modal-card animate-scale-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="export-modal-header">
          <div>
            <h3 id="export-modal-title">Exportar y Compartir</h3>
            <p>{trip.flagEmoji} {trip.title} · {eventCount} {eventCount === 1 ? 'plan' : 'planes'}</p>
          </div>
          <button type="button" className="export-modal-close" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="export-options-list">
          <button type="button" className="export-option-card" onClick={handlePdf}>
            <span className="export-option-icon pdf"><FileText size={22} /></span>
            <span className="export-option-text">
              <strong>Informe PDF</strong>
              <small>Itinerario día por día, resumen financiero y gastos. Ideal para imprimir o llevar offline.</small>
            </span>
            <Download size={18} className="export-option-arrow" />
          </button>

          <button type="button" className="export-option-card" onClick={handleIcs}>
            <span className="export-option-icon calendar"><CalendarPlus size={22} /></span>
            <span className="export-option-text">
              <strong>Calendario (.ics)</strong>
              <small>
                Para Google Calendar, Apple Calendar y Outlook. {timedCount} con hora
                {eventCount - timedCount > 0 ? `, ${eventCount - timedCount} de día completo` : ''}.
              </small>
            </span>
            <Download size={18} className="export-option-arrow" />
          </button>

          <div className="export-option-card static">
            <span className="export-option-icon share"><MessageCircle size={22} /></span>
            <span className="export-option-text">
              <strong>Compartir resumen</strong>
              <small>Texto con los planes de cada día y lo gastado.</small>
              <span className="export-share-actions">
                <button type="button" className="export-share-btn whatsapp" onClick={handleWhatsApp}>
                  <MessageCircle size={15} /> WhatsApp
                </button>
                {canNativeShare() && (
                  <button type="button" className="export-share-btn" onClick={handleNativeShare}>
                    <Share2 size={15} /> Compartir
                  </button>
                )}
                <button type="button" className="export-share-btn" onClick={handleCopy}>
                  <Copy size={15} /> Copiar
                </button>
              </span>
            </span>
          </div>
        </div>

        {feedback && (
          <div className={`export-feedback ${feedback.type}`} role="status">
            {feedback.text}
          </div>
        )}
      </div>
    </div>
  );
}
