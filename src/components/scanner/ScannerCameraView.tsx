import React from 'react';
import { Camera, X, RotateCw, SwitchCamera, Sparkles } from 'lucide-react';

interface ScannerCameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  guideRef: React.RefObject<HTMLDivElement | null>;
  rotationAngle: number;
  frameOrientation: 'vertical' | 'horizontal';
  setFrameOrientation: (val: 'vertical' | 'horizontal') => void;
  autoCropGuide: boolean;
  setAutoCropGuide: React.Dispatch<React.SetStateAction<boolean>>;
  hasMultipleCameras: boolean;
  onStopCamera: () => void;
  onRotateCamera90: () => void;
  onCaptureFrame: () => void;
  onToggleFacingMode: () => void;
}

export default function ScannerCameraView({
  videoRef,
  wrapperRef,
  guideRef,
  rotationAngle,
  frameOrientation,
  setFrameOrientation,
  autoCropGuide,
  setAutoCropGuide,
  hasMultipleCameras,
  onStopCamera,
  onRotateCamera90,
  onCaptureFrame,
  onToggleFacingMode
}: ScannerCameraViewProps) {
  return (
    <div className="scanner-live-camera-view animate-fade-in">
      <div className="live-camera-format-bar">
        <button
          type="button"
          className={`btn-format-toggle ${frameOrientation === 'vertical' ? 'active' : ''}`}
          onClick={() => setFrameOrientation('vertical')}
        >
          <span>↕️ Ticket Vertical</span>
        </button>

        <button
          type="button"
          className={`btn-format-toggle ${frameOrientation === 'horizontal' ? 'active' : ''}`}
          onClick={() => setFrameOrientation('horizontal')}
        >
          <span>↔️ Factura Ancha</span>
        </button>

        <button
          type="button"
          className={`btn-format-toggle ${autoCropGuide ? 'active-crop' : ''}`}
          onClick={() => setAutoCropGuide(prev => !prev)}
          title={autoCropGuide ? 'Recortará automáticamente el ticket del recuadro verde' : 'Capturará todo el marco de la cámara'}
        >
          <span>{autoCropGuide ? '🎯 Auto-recorte: ON' : '📷 Foto Completa'}</span>
        </button>
      </div>

      <div className="live-video-wrapper" ref={wrapperRef}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="live-camera-stream"
          style={{ transform: `rotate(${rotationAngle}deg)` }}
        />
        <div className="live-camera-overlay">
          <div
            ref={guideRef}
            className={`ticket-viewfinder-guide ${frameOrientation}`}
          >
            <div className="viewfinder-corner top-left"></div>
            <div className="viewfinder-corner top-right"></div>
            <div className="viewfinder-corner bottom-left"></div>
            <div className="viewfinder-corner bottom-right"></div>
            <span className="viewfinder-text">
              {frameOrientation === 'vertical'
                ? 'Sostén el ticket verticalmente aquí'
                : 'Encuadra la factura horizontal'}
            </span>
          </div>
        </div>

        <div className="live-camera-tip-pill">
          <Sparkles size={13} className="text-emerald" />
          <span>Acerca el ticket bien a la cámara para letras nítidas</span>
        </div>
      </div>

      <div className="live-camera-controls-bar">
        <button
          type="button"
          onClick={onStopCamera}
          className="btn-live-control btn-cancel"
        >
          <X size={16} />
          <span>Cancelar</span>
        </button>

        <button
          type="button"
          onClick={onRotateCamera90}
          className="btn-live-control btn-rotate"
          title="Girar orientación de la cámara 90°"
        >
          <RotateCw size={16} />
          <span>Rotar 90°</span>
        </button>

        <button
          type="button"
          onClick={onCaptureFrame}
          className="btn-live-shutter"
          title="Tomar Foto"
        >
          <div className="shutter-circle-inner">
            <Camera size={26} />
          </div>
        </button>

        {hasMultipleCameras && (
          <button
            type="button"
            onClick={onToggleFacingMode}
            className="btn-live-control btn-flip"
            title="Cambiar entre cámara trasera y delantera"
          >
            <SwitchCamera size={16} />
            <span>Cámara</span>
          </button>
        )}
      </div>
    </div>
  );
}

