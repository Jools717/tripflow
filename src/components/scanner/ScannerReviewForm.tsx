import React from 'react';
import {
  CheckCircle2, AlertTriangle, RotateCw, RotateCcw, FlipHorizontal,
  Eye, Crop, Wand2, RefreshCw, Clock, Check
} from 'lucide-react';
import { PaymentMethod } from '../../types/expense';
import { formatCurrencyARS } from '../../utils/helpers';
import ScannerItemsTable, { ScannedItem } from './ScannerItemsTable';

interface CompressionStats {
  compressedSizeKb: number;
  reductionPercent: number;
}

interface ScannerReviewFormProps {
  previewBase64: string;
  compressionStats: CompressionStats | null;
  isUpsideDown: boolean;
  storeName: string;
  setStoreName: (val: string) => void;
  receiptDate: string;
  setReceiptDate: (val: string) => void;
  receiptTime: string;
  setReceiptTime: (val: string) => void;
  amountARS: string;
  setAmountARS: (val: string) => void;
  computedUSD: number;
  parsedAmountARS: number;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (val: PaymentMethod) => void;
  receiptNote: string;
  setReceiptNote: (val: string) => void;
  itemsList: ScannedItem[];
  itemsSumARS: number;
  onAddItem: () => void;
  onItemChange: (id: string, field: 'name' | 'quantity' | 'unitPrice' | 'total', value: string) => void;
  onDeleteItem: (id: string) => void;
  onSyncTotalFromItems: () => void;
  onTransform: (angleDelta: number, flipHorizontal: boolean) => Promise<void>;
  onOpenLightbox: (perspectiveMode: boolean) => void;
  onApplyDocumentFilter: () => Promise<void>;
  onReset: () => void;
  onApprove: (e: React.FormEvent) => void;
}

export default function ScannerReviewForm({
  previewBase64,
  compressionStats,
  isUpsideDown,
  storeName,
  setStoreName,
  receiptDate,
  setReceiptDate,
  receiptTime,
  setReceiptTime,
  amountARS,
  setAmountARS,
  computedUSD,
  parsedAmountARS,
  paymentMethod,
  setPaymentMethod,
  receiptNote,
  setReceiptNote,
  itemsList,
  itemsSumARS,
  onAddItem,
  onItemChange,
  onDeleteItem,
  onSyncTotalFromItems,
  onTransform,
  onOpenLightbox,
  onApplyDocumentFilter,
  onReset,
  onApprove
}: ScannerReviewFormProps) {
  return (
    <form onSubmit={onApprove} className="scanner-review-form animate-fade-in">
      {compressionStats && (
        <div className="review-compression-pill">
          <CheckCircle2 size={14} className="text-emerald" />
          <span>
            Imagen optimizada a <strong>{compressionStats.compressedSizeKb} KB</strong> (-{compressionStats.reductionPercent}%)
          </span>
        </div>
      )}

      {isUpsideDown && (
        <div className="upside-down-detected-alert animate-fade-in">
          <div className="alert-content-row">
            <AlertTriangle size={20} className="text-amber" />
            <div>
              <strong>¡El ticket parece estar al revés (boca abajo)!</strong>
              <p>La cámara capturó el texto invertido. Haz clic en el botón para girarlo 180° y transcribir correctamente.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onTransform(180, false)}
            className="btn-auto-rotate-180"
          >
            <RotateCw size={15} />
            <span>Girar 180° y Re-leer</span>
          </button>
        </div>
      )}

      <div className="scanner-review-layout">
        {/* Left: Thumbnail Preview with Rotation Tools & Lightbox */}
        <div className="scanner-preview-col">
          <div
            className="preview-image-frame clickable"
            onClick={() => onOpenLightbox(false)}
            title="Haz clic para inspeccionar y comprobar si la foto quedó nítida"
          >
            <img src={previewBase64} alt="Foto del ticket" className="ticket-thumbnail" />
            <div className="preview-hover-zoom-hint">
              <Eye size={15} />
              <span>Clic para ampliar</span>
            </div>
          </div>

          <div className="scanner-rotate-toolbar" title="Ajustar orientación de la foto">
            <button
              type="button"
              className="btn-rotate-tool"
              onClick={() => onTransform(270, false)}
              title="Girar 90° a la izquierda"
            >
              <RotateCcw size={14} />
              <span>-90°</span>
            </button>

            <button
              type="button"
              className={`btn-rotate-tool ${isUpsideDown ? 'highlight' : ''}`}
              onClick={() => onTransform(180, false)}
              title="Invertir 180° (poner de cabeza/al derecho)"
            >
              <RotateCw size={14} />
              <span>180°</span>
            </button>

            <button
              type="button"
              className="btn-rotate-tool"
              onClick={() => onTransform(90, false)}
              title="Girar 90° a la derecha"
            >
              <RotateCw size={14} />
              <span>+90°</span>
            </button>

            <button
              type="button"
              className="btn-rotate-tool"
              onClick={() => onTransform(0, true)}
              title="Reflejar horizontalmente (Efecto Espejo)"
            >
              <FlipHorizontal size={14} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onOpenLightbox(false)}
            className="btn-inspect-photo"
            title="Ampliar foto para verificar que el texto no esté borroso"
          >
            <Eye size={14} />
            <span>Revisar nitidez</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenLightbox(true)}
            className="btn-perspective-tool"
            title="Aplanar perspectiva y encuadrar ticket con 4 esquinas (Estilo CamScanner)"
          >
            <Crop size={14} className="text-emerald" />
            <span>Aplanar Perspectiva</span>
          </button>

          <button
            type="button"
            onClick={onApplyDocumentFilter}
            className="btn-enhance-filter"
            title="Filtro B/N mágico: blanquea el papel térmico y realza el texto a negro profundo"
          >
            <Wand2 size={14} className="text-amber" />
            <span>Filtro Escáner B/N</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="btn-retry-photo"
          >
            <RefreshCw size={14} />
            <span>Tomar otra foto</span>
          </button>
        </div>

        {/* Right: Data Confirmation Fields & Items Table */}
        <div className="scanner-fields-col">
          <div className="form-group">
            <label>Comercio / Lugar detectado *</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="form-input"
              placeholder="Ej: Coto, Red Comercial Express, Güerrín..."
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Monto Total (ARS) *</label>
              <div className="currency-input-wrapper">
                <span className="curr-symbol">$ ARS</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amountARS}
                  onChange={(e) => setAmountARS(e.target.value)}
                  className="form-input font-bold"
                  placeholder="Ej: 19.741"
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ minWidth: '150px' }}>
              <label>Fecha de la Factura</label>
              <input
                type="date"
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group" style={{ minWidth: '130px' }}>
              <label>Hora</label>
              <div className="time-input-group">
                <Clock size={15} className="time-icon text-muted" />
                <input
                  type="text"
                  value={receiptTime}
                  onChange={(e) => setReceiptTime(e.target.value)}
                  className="form-input"
                  placeholder="Ej: 10:26:28"
                />
              </div>
            </div>
          </div>

          {parsedAmountARS > 0 && (
            <div className="scanner-dual-preview">
              <span>Equivalente en Dólar Blue:</span>
              <strong className="text-emerald">≈ ${computedUSD.toFixed(1)} USD Blue</strong>
              <span>({formatCurrencyARS(parsedAmountARS)})</span>
            </div>
          )}

          <ScannerItemsTable
            itemsList={itemsList}
            amountARS={amountARS}
            itemsSumARS={itemsSumARS}
            onAddItem={onAddItem}
            onItemChange={onItemChange}
            onDeleteItem={onDeleteItem}
            onSyncTotalFromItems={onSyncTotalFromItems}
          />

          <div className="form-row">
            <div className="form-group">
              <label>Método de Pago</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('efectivo')}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: paymentMethod === 'efectivo' ? '2px solid #10b981' : '1px solid var(--border-color, #e2e8f0)',
                    background: paymentMethod === 'efectivo' ? 'rgba(16, 185, 129, 0.14)' : 'transparent',
                    color: paymentMethod === 'efectivo' ? '#10b981' : 'inherit',
                    fontWeight: paymentMethod === 'efectivo' ? '700' : '500',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  💵 Efectivo
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('tarjeta')}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: paymentMethod === 'tarjeta' ? '2px solid #3b82f6' : '1px solid var(--border-color, #e2e8f0)',
                    background: paymentMethod === 'tarjeta' ? 'rgba(59, 130, 246, 0.14)' : 'transparent',
                    color: paymentMethod === 'tarjeta' ? '#3b82f6' : 'inherit',
                    fontWeight: paymentMethod === 'tarjeta' ? '700' : '500',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  💳 Tarjeta
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Nota o Detalle</label>
              <input
                type="text"
                value={receiptNote}
                onChange={(e) => setReceiptNote(e.target.value)}
                className="form-input"
                placeholder="Ej: Desayunos y meriendas"
              />
            </div>
          </div>

          <button type="submit" className="btn-approve-scanned-receipt">
            <Check size={18} />
            <span>
              Aprobar y Sumar a la Billetera ({formatCurrencyARS(Number(amountARS) || 0)})
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}

