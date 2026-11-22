import React from 'react';
import { CheckCircle2, Sparkles, X } from 'lucide-react';
import { CURRENT_RELEASE } from './versionConfig';

interface UpdatedToastProps {
  isVisible: boolean;
  onOpenWhatsNew: () => void;
  onClose: () => void;
}

/** Aviso tras actualizarse sola: "TripFlow se actualizó · Ver novedades". */
export default function UpdatedToast({ isVisible, onOpenWhatsNew, onClose }: UpdatedToastProps) {
  if (!isVisible) return null;
  const version = CURRENT_RELEASE.version.split('.').slice(0, 2).join('.');
  return (
    <div className="tf-updated-toast animate-scale-up" role="status">
      <CheckCircle2 size={20} className="tf-updated-icon" />
      <div className="tf-updated-text">
        <strong>TripFlow se actualizó</strong>
        <span>Ya tienes la última versión (v{version}).</span>
      </div>
      <button type="button" className="tf-updated-cta" onClick={() => { onOpenWhatsNew(); onClose(); }}>
        <Sparkles size={14} /> Ver novedades
      </button>
      <button type="button" className="tf-updated-close" onClick={onClose} aria-label="Cerrar aviso">
        <X size={16} />
      </button>
    </div>
  );
}
