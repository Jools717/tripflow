import { useState, useEffect } from 'react';
import { CURRENT_RELEASE } from '../components/updates/versionConfig';
import { UpdateModalStage } from '../components/updates/UpdateModal';
import { createSafetyDataBackup } from '../services/storageService';
import { registerServiceWorker, applyServiceWorkerUpdate } from '../services/swRegistration';

const STORAGE_KEY_SEEN_VERSION = 'ba_last_seen_app_version';

export function useAppUpdate() {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [modalStage, setModalStage] = useState<UpdateModalStage>('loading');
  const [hasBackgroundUpdate, setHasBackgroundUpdate] = useState(false);

  // Check version on initial launch
  useEffect(() => {
    const lastSeenVersion = localStorage.getItem(STORAGE_KEY_SEEN_VERSION);

    if (!lastSeenVersion || lastSeenVersion !== CURRENT_RELEASE.version) {
      // First time user is opening this updated version
      // Show simulated progress bar then "What's New"
      setModalStage('loading');
      setIsUpdateModalOpen(true);
    }
  }, []);

  // Detección real: el Service Worker avisa cuando Vercel publicó una versión nueva y ya está descargada
  useEffect(() => {
    registerServiceWorker(() => setHasBackgroundUpdate(true));
  }, []);

  const handleDismissUpdate = () => {
    // CONTINGENCY: Create safety backup before closing
    createSafetyDataBackup('dismiss_update_v' + CURRENT_RELEASE.version);
    localStorage.setItem(STORAGE_KEY_SEEN_VERSION, CURRENT_RELEASE.version);
    setIsUpdateModalOpen(false);
    setHasBackgroundUpdate(false);
  };

  const handleApplyReload = () => {
    // CONTINGENCY: Create safety backup before reloading page
    createSafetyDataBackup('before_update_reload_v' + CURRENT_RELEASE.version);
    localStorage.setItem(STORAGE_KEY_SEEN_VERSION, CURRENT_RELEASE.version);
    setIsUpdateModalOpen(false);
    setHasBackgroundUpdate(false);
    // Si hay una versión nueva esperando, el Service Worker la activa y recarga; si no, recarga normal
    if (!applyServiceWorkerUpdate()) window.location.reload();
  };

  const handleOpenBackgroundUpdateModal = () => {
    setModalStage('reload_prompt');
    setIsUpdateModalOpen(true);
  };

  const forceShowWhatsNew = () => {
    setModalStage('whats_new');
    setIsUpdateModalOpen(true);
  };

  return {
    isUpdateModalOpen,
    modalStage,
    hasBackgroundUpdate,
    handleDismissUpdate,
    handleApplyReload,
    handleOpenBackgroundUpdateModal,
    forceShowWhatsNew
  };
}
