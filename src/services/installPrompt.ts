// Botón propio "Instalar la app". Chrome dispara "beforeinstallprompt" cuando la app se puede instalar;
// se guarda el evento para lanzarlo cuando el usuario toque el botón (Chrome a veces no muestra su propio aviso,
// por ejemplo justo después de desinstalar). Se registra al importar el módulo, antes de montar React.
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    notify();
  });
}

const isStandalone = (): boolean =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);

/** canInstall: el navegador permite instalar ahora. install(): abre el diálogo de instalación. */
export function useInstallPrompt() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const fn = () => setTick((t) => t + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);

  const install = async (): Promise<boolean> => {
    if (!deferred) return false;
    const ev = deferred;
    deferred = null;
    notify();
    await ev.prompt();
    const choice = await ev.userChoice.catch(() => ({ outcome: 'dismissed' as const }));
    return choice.outcome === 'accepted';
  };

  return { canInstall: Boolean(deferred) && !isStandalone(), install };
}
