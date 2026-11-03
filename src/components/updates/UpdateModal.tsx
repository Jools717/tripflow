import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import UpdateProgressBar from './UpdateProgressBar';
import WhatsNewGrid from './WhatsNewGrid';
import { CURRENT_RELEASE } from './versionConfig';

export type UpdateModalStage = 'loading' | 'whats_new' | 'reload_prompt';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStage?: UpdateModalStage;
  onApplyUpdate?: () => void;
}

export default function UpdateModal({
  isOpen,
  onClose,
  initialStage = 'loading',
  onApplyUpdate
}: UpdateModalProps) {
  const [stage, setStage] = useState<UpdateModalStage>(initialStage);

  useEffect(() => {
    if (isOpen) {
      setStage(initialStage);
    }
  }, [isOpen, initialStage]);

  if (!isOpen) return null;

  const handleLoadingComplete = () => {
    setStage('whats_new');
  };

  const handleContinue = () => {
    if (stage === 'reload_prompt' && onApplyUpdate) {
      onApplyUpdate();
    } else {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop-overlay animate-fade-in update-modal-backdrop">
      <div className="update-modal-dialog animate-scale-up" onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button (only if in whats_new or reload_prompt, not while loading) */}
        {stage !== 'loading' && (
          <button
            type="button"
            className="btn-modal-close update-modal-close"
            onClick={onClose}
            aria-label="Cerrar modal de actualización"
          >
            <X size={20} />
          </button>
        )}

        {/* Stage 1: Progress Bar */}
        {stage === 'loading' && (
          <UpdateProgressBar
            targetVersion={CURRENT_RELEASE.version}
            onComplete={handleLoadingComplete}
          />
        )}

        {/* Stage 2 & 3: What's New Grid */}
        {(stage === 'whats_new' || stage === 'reload_prompt') && (
          <WhatsNewGrid
            onContinue={handleContinue}
            isBackgroundUpdate={stage === 'reload_prompt'}
          />
        )}

      </div>
    </div>
  );
}