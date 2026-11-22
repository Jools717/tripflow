import { useState, useEffect } from 'react';
import { CURRENT_RELEASE } from '../components/updates/versionConfig';
import { UpdateModalStage } from '../components/updates/UpdateModal';
import { createSafetyDataBackup } from '../services/storageService';
import { registerServiceWorker, applyServiceWorkerUpdate, isFreshlyOpened, JUST_UPDATED_KEY } from '../services/swRegistration';

// ¿Esta carga viene justo de una actualización? Se consume una sola vez.
const consumeJustUpdated = (): boolean => {
  try {
    const flag = sessionStorage.getItem(JUST_UPDATED_KEY) === '1';
    sessionStorage.removeItem(JUST_UPDATED_KEY);
    return flag;
  } catch {
    return false;
  }
};

const STORAGE_KEY_SEEN_VERSION = 'ba_last_seen_app_version';

export function useAppUpdate() {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [modalStage, setModalStage] = useState<UpdateModalStage>('loading');
  const [hasBackgroundUpdate, setHasBackgroundUpdate] = useState(false);
  // Aviso "TripFlow se actualizó" tras una actualización que no cambió el número de versión
  const [justUpdated, setJustUpdated] = useState<boolean>(() => {
    const updated = consumeJustUpdated();
    let lastSeen: string | null = null;
    try { lastSeen = localStorage.getItem(STORAGE_KEY_SEEN_VERSION); } catch { /* sin almacenamiento */ }
    // Si cambió la versión ya se muestra la pantalla completa de novedades
    return updated && lastSeen === CURRENT_RELEASE.version;
  });

  useEffect(() => {
    if (!justUpdated) return;
    const t = setTimeout(() => setJustUpdated(false), 8000);
    return () => clearTimeout(t);
  }, [justUpdated]);

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
  // Al abrir o volver a la app se actualiza sola (con copia de seguridad); si ya se está usando, se avisa con la píldora.
  useEffect(() => {
    registerServiceWorker(() => {
      if (isFreshlyOpened()) {
        createSafetyDataBackup('auto_update_on_open');
        if (applyServiceWorkerUpdate()) return;
      }
      setHasBackgroundUpdate(true);
    });
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
    justUpdated,
    dismissJustUpdated: () => setJustUpdated(false),
    handleDismissUpdate,
    handleApplyReload,
    handleOpenBackgroundUpdateModal,
    forceShowWhatsNew
  };
}
