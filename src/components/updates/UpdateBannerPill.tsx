import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { CURRENT_RELEASE } from './versionConfig';

interface UpdateBannerPillProps {
  isVisible: boolean;
  onUpdateApp: () => void;
  targetVersion?: string;
}

export default function UpdateBannerPill({
  isVisible,
  onUpdateApp,
  targetVersion = CURRENT_RELEASE.version
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
          <strong>¡Nueva versión v{targetVersion} lista!</strong> Toca aquí para actualizar la app
        </span>
        <ArrowRight size={15} className="pill-arrow" />
      </button>
    </div>
  );
}