import React from 'react';
import { RefreshCw, Check, Sparkles } from 'lucide-react';

export const PIPELINE_STEPS = [
  { id: 1, title: 'Optimización de encuadre y resolución', subtitle: 'Preservando cabecera y márgenes completos' },
  { id: 2, title: 'Balance de iluminación y sombras', subtitle: 'Normalizando luz de fondo sin distorsión' },
  { id: 3, title: 'Realce óptico de texto térmico', subtitle: 'Nitidez continua con antialiasing suave' },
  { id: 4, title: 'Extracción de productos y totales con OCR', subtitle: 'Poblando la tabla de ítems' }
];

interface CompressionStats {
  originalSizeKb?: number;
  compressedSizeKb: number;
  reductionPercent: number;
}

interface ScannerPipelineProgressProps {
  pipelineStep: number;
  pipelineStatusText: string;
  ocrProgress: number;
  compressionStats: CompressionStats | null;
}

export default function ScannerPipelineProgress({
  pipelineStep,
  pipelineStatusText,
  ocrProgress,
  compressionStats
}: ScannerPipelineProgressProps) {
  const progressPercent =
    pipelineStep === 1
      ? 25
      : pipelineStep === 2
      ? 50
      : pipelineStep === 3
      ? 75
      : Math.min(100, Math.round(75 + ocrProgress * 0.25));

  return (
    <div className="scanner-processing-state animate-fade-in">
      <div className="processing-spinner-box">
        <RefreshCw size={34} className="spin-icon text-emerald" />
      </div>

      <div className="processing-titles">
        <h5>Recomponiendo y digitalizando factura...</h5>
        <p>
          {pipelineStatusText || 'Mejorando calidad óptica para transcribir productos con precisión'}
        </p>
      </div>

      <div className="ocr-progress-container">
        <div className="ocr-progress-labels">
          <span>Progreso de digitalización:</span>
          <strong>{progressPercent}%</strong>
        </div>
        <div className="ocr-progress-track">
          <div
            className="ocr-progress-fill pipeline-gradient-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="pipeline-stepper-card">
        {PIPELINE_STEPS.map((step) => {
          const isDone = pipelineStep > step.id;
          const isActive = pipelineStep === step.id;
          const isPending = pipelineStep < step.id;
          return (
            <div
              key={step.id}
              className={`pipeline-step-item ${isDone ? 'is-done' : ''} ${isActive ? 'is-active' : ''} ${isPending ? 'is-pending' : ''}`}
            >
              <div className="pipeline-step-indicator">
                {isDone ? (
                  <div className="step-circle step-done">
                    <Check size={14} strokeWidth={3} />
                  </div>
                ) : isActive ? (
                  <div className="step-circle step-active">
                    <div className="step-pulse-ring" />
                    <span className="step-num">{step.id}</span>
                  </div>
                ) : (
                  <div className="step-circle step-pending">
                    <span className="step-num">{step.id}</span>
                  </div>
                )}
              </div>

              <div className="pipeline-step-info">
                <div className="pipeline-step-title-row">
                  <span className="step-title-text">{step.title}</span>
                  {isDone && <span className="step-status-tag tag-done">Listo</span>}
                  {isActive && (
                    <span className="step-status-tag tag-active">
                      {step.id === 4 && ocrProgress > 0 ? `${ocrProgress}%` : 'En proceso...'}
                    </span>
                  )}
                </div>
                <span className="step-subtitle-text">
                  {isActive && pipelineStatusText ? pipelineStatusText : step.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {compressionStats && (
        <div className="compression-success-badge animate-fade-in">
          <Sparkles size={14} className="text-amber" />
          <span>
            Resolución optimizada: <strong>{compressionStats.compressedSizeKb} KB</strong> (-{compressionStats.reductionPercent}%)
          </span>
        </div>
      )}
    </div>
  );
}

