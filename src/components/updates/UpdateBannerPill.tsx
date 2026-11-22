import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface UpdateBannerPillProps {
  isVisible: boolean;
  onUpdateApp: () => void;
}

export default function UpdateBannerPill({
  isVisible,
  onUpdateApp
}: UpdateBannerPillProps) {
  if (!isVisible) return null;

  return (
    <div className="update-floating-pill-container animate-fade-in">
      <button
        type="button"
        className="update-floating-pill"
        onClick={onUpdateApp}
        title="Toca aquí para actualizar la aplicación de inmediato"
      >
        <span className="pill-pulse-dot"></span>
        <Sparkles size={15} className="text-amber" />
        <span className="pill-text">
          <strong>¡Nueva versión lista!</strong> Toca aquí para actualizar la app
        </span>
        <ArrowRight size={15} className="pill-arrow" />
      </button>
    </div>
  );
}