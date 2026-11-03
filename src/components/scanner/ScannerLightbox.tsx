import React, { useRef, useState } from 'react';
import {
  Eye, RotateCcw, RotateCw, FlipHorizontal, Crop, ZoomIn, ZoomOut, X,
  Wand2, Sparkles, Check, RefreshCw
} from 'lucide-react';

export interface CornerCoords {
  x: number;
  y: number;
}

export interface CornersState {
  tl: CornerCoords;
  tr: CornerCoords;
  br: CornerCoords;
  bl: CornerCoords;
}

interface ScannerLightboxProps {
  isOpen: boolean;
  previewBase64: string | null;
  onClose: () => void;
  onTransform: (angleDelta: number, flipHorizontal: boolean) => Promise<void>;
  onApplyPerspectiveWarp: (corners: CornersState) => Promise<void>;
  isApplyingPerspective: boolean;
  onReset: () => void;
  initialPerspectiveMode?: boolean;
}

export default function ScannerLightbox({
  isOpen,
  previewBase64,
  onClose,
  onTransform,
  onApplyPerspectiveWarp,
  isApplyingPerspective,
  onReset,
  initialPerspectiveMode = false
}: ScannerLightboxProps) {
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [isPerspectiveMode, setIsPerspectiveMode] = useState(initialPerspectiveMode);
  const [activeCorner, setActiveCorner] = useState<string | null>(null);
  const [corners, setCorners] = useState<CornersState>({
    tl: { x: 4, y: 4 },
    tr: { x: 96, y: 4 },
    br: { x: 96, y: 96 },
    bl: { x: 4, y: 96 }
  });

  const imgContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !previewBase64) return null;

  const handlePointerDownCorner = (key: keyof CornersState, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveCorner(key);
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch (_) {}

    const container = imgContainerRef.current;
    if (!container) return;

    const onPointerMove = (moveEvt: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const xPct = Math.max(0, Math.min(100, ((moveEvt.clientX - rect.left) / rect.width) * 100));
      const yPct = Math.max(0, Math.min(100, ((moveEvt.clientY - rect.top) / rect.height) * 100));
      setCorners(prev => ({
        ...prev,
        [key]: { x: Number(xPct.toFixed(1)), y: Number(yPct.toFixed(1)) }
      }));
    };

    const onPointerUp = (upEvt: PointerEvent) => {
      try {
        (upEvt.target as HTMLElement).releasePointerCapture(upEvt.pointerId);
      } catch (_) {}
      setActiveCorner(null);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleResetCorners = () => {
    setCorners({
      tl: { x: 4, y: 4 },
      tr: { x: 96, y: 4 },
      br: { x: 96, y: 96 },
      bl: { x: 4, y: 96 }
    });
  };

  return (
    <div
      className="photo-lightbox-backdrop animate-fade-in"
      onClick={onClose}
    >
      <div
        className="photo-lightbox-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="photo-lightbox-header">
          <div className="photo-lightbox-title-box">
            <Eye size={18} className="text-emerald" />
            <div>
              <h5>Inspección de Foto del Ticket</h5>
              <span className="photo-lightbox-sub">
                Comprueba que las letras, precios y fecha estén enfocados y legibles
              </span>
            </div>
          </div>

          <div className="photo-lightbox-controls">
            <button
              type="button"
              className="btn-lightbox-zoom"
              onClick={() => onTransform(270, false)}
              title="Girar 90° a la izquierda"
            >
              <RotateCcw size={15} />
            </button>

            <button
              type="button"
              className="btn-lightbox-zoom font-bold"
              onClick={() => onTransform(180, false)}
              title="Invertir 180° (Poner al derecho)"
            >
              <span>180°</span>
            </button>

            <button
              type="button"
              className="btn-lightbox-zoom"
              onClick={() => onTransform(90, false)}
              title="Girar 90° a la derecha"
            >
              <RotateCw size={15} />
            </button>

            <button
              type="button"
              className="btn-lightbox-zoom"
              onClick={() => onTransform(0, true)}
              title="Reflejar espejo"
            >
              <FlipHorizontal size={15} />
            </button>

            <button
              type="button"
              className={`btn-lightbox-tool ${isPerspectiveMode ? 'active' : ''}`}
              onClick={() => setIsPerspectiveMode(prev => !prev)}
              title="Modo Recomponer y Aplanar Perspectiva (4 esquinas estilo CamScanner)"
            >
              <Crop size={15} />
              <span>{isPerspectiveMode ? 'Salir Modo Aplanar' : 'Modo Aplanar'}</span>
            </button>

            <span className="toolbar-sep"></span>

            <button
              type="button"
              className="btn-lightbox-zoom"
              onClick={() => setLightboxZoom(prev => Math.max(0.5, Number((prev - 0.25).toFixed(2))))}
              title="Reducir zoom (-)"
            >
              <ZoomOut size={16} />
            </button>

            <button
              type="button"
              className="btn-lightbox-zoom font-mono"
              onClick={() => setLightboxZoom(1)}
              title="Restablecer tamaño normal (100%)"
            >
              <span>{Math.round(lightboxZoom * 100)}%</span>
            </button>

            <button
              type="button"
              className="btn-lightbox-zoom"
              onClick={() => setLightboxZoom(prev => Math.min(3, Number((prev + 0.25).toFixed(2))))}
              title="Aumentar zoom (+)"
            >
              <ZoomIn size={16} />
            </button>

            <button
              type="button"
              className="btn-close-lightbox"
              onClick={onClose}
              title="Cerrar visor"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="photo-lightbox-viewport">
          <div
            className="perspective-img-container"
            ref={imgContainerRef}
            style={{ position: 'relative', display: 'inline-block' }}
          >
            <img
              src={previewBase64}
              alt="Foto del ticket en tamaño completo"
              className="photo-lightbox-img"
              style={{ transform: `scale(${lightboxZoom})`, pointerEvents: isPerspectiveMode ? 'none' : 'auto' }}
            />

            {isPerspectiveMode && (
              <svg
                className="perspective-overlay-svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  transform: `scale(${lightboxZoom})`,
                  transformOrigin: 'center center'
                }}
              >
                <polygon
                  points={`${corners.tl.x},${corners.tl.y} ${corners.tr.x},${corners.tr.y} ${corners.br.x},${corners.br.y} ${corners.bl.x},${corners.bl.y}`}
                  fill="rgba(16, 185, 129, 0.22)"
                  stroke="#10b981"
                  strokeWidth="1"
                  strokeDasharray="2.5,1.5"
                />
              </svg>
            )}

            {isPerspectiveMode && (
              <div
                className="perspective-handles-layer"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  transform: `scale(${lightboxZoom})`,
                  transformOrigin: 'center center',
                  pointerEvents: 'none'
                }}
              >
                {[
                  { key: 'tl' as const, label: '1 (Sup. Izq)' },
                  { key: 'tr' as const, label: '2 (Sup. Der)' },
                  { key: 'br' as const, label: '3 (Inf. Der)' },
                  { key: 'bl' as const, label: '4 (Inf. Izq)' }
                ].map(({ key, label }) => {
                  const c = corners[key];
                  return (
                    <div
                      key={key}
                      className={`perspective-handle ${activeCorner === key ? 'active' : ''}`}
                      style={{
                        position: 'absolute',
                        left: `${c.x}%`,
                        top: `${c.y}%`,
                        transform: 'translate(-50%, -50%)',
                        cursor: 'grab',
                        pointerEvents: 'auto'
                      }}
                      onPointerDown={(e) => handlePointerDownCorner(key, e)}
                      title={`Esquina ${label} - Arrastra para encuadrar`}
                    >
                      <div className="handle-outer-ring"></div>
                      <div className="handle-inner-dot"></div>
                      <span className="handle-badge">{key.toUpperCase()}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="photo-lightbox-footer">
          {isPerspectiveMode ? (
            <div className="perspective-toolbar-banner animate-fade-in">
              <div className="perspective-toolbar-info">
                <Wand2 size={16} className="text-emerald" />
                <span>
                  Arrastra las 4 esquinas circulares a los vértices de la factura para eliminar la mesa, manos y aplanar el documento.
                </span>
              </div>
              <div className="perspective-toolbar-buttons">
                <button
                  type="button"
                  className="btn-reset-perspective"
                  onClick={handleResetCorners}
                  title="Restablecer cuadrilátero"
                >
                  Restablecer
                </button>
                <button
                  type="button"
                  className="btn-apply-perspective"
                  onClick={() => onApplyPerspectiveWarp(corners)}
                  disabled={isApplyingPerspective}
                  title="Transformar perspectiva y mejorar nitidez"
                >
                  <Sparkles size={15} />
                  <span>{isApplyingPerspective ? 'Aplanando...' : '⚡ Aplanar y Transcribir'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="photo-lightbox-hint">
              <Sparkles size={15} className="text-amber" />
              <span>
                Si la foto quedó inclinada o con bordes de la mesa, haz clic en <strong>Modo Aplanar</strong> para recomponer el ticket con las 4 esquinas.
              </span>
            </div>
          )}

          <div className="photo-lightbox-actions">
            <button
              type="button"
              className="btn-lightbox-retry"
              onClick={onReset}
            >
              <RefreshCw size={14} />
              <span>Tomar otra foto</span>
            </button>

            <button
              type="button"
              className="btn-lightbox-confirm"
              onClick={onClose}
            >
              <Check size={16} />
              <span>La foto está clara (Continuar)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

