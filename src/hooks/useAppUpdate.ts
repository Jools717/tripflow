import { useState, useEffect } from 'react';
import { CURRENT_RELEASE } from '../components/updates/versionConfig';
import { UpdateModalStage } from '../components/updates/UpdateModal';
import { createSafetyDataBackup } from '../services/storageService';

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

  // Listen to visibilitychange / window focus (simulate detection if app was kept open)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const lastSeen = localStorage.getItem(STORAGE_KEY_SEEN_VERSION);
        if (lastSeen && lastSeen !== CURRENT_RELEASE.version) {
          setHasBackgroundUpdate(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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
    window.location.reload();
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
