// Registro del Service Worker (modo sin conexión) y detección real de versiones nuevas.
let registration: ServiceWorkerRegistration | null = null;

const canUseSW = (): boolean =>
  import.meta.env.PROD && typeof navigator !== 'undefined' && 'serviceWorker' in navigator;

/**
 * Registra /sw.js. Llama a onUpdateReady cuando hay una versión nueva descargada esperando a activarse.
 * En desarrollo no se registra (evita servir archivos viejos mientras se programa).
 */
export const registerServiceWorker = (onUpdateReady: () => void): void => {
  if (!canUseSW()) return;

  const watch = (reg: ServiceWorkerRegistration) => {
    if (reg.waiting && navigator.serviceWorker.controller) onUpdateReady();
    reg.addEventListener('updatefound', () => {
      const worker = reg.installing;
      worker?.addEventListener('statechange', () => {
        // Solo es "actualización" si ya había una versión controlando la página
        if (worker.state === 'installed' && navigator.serviceWorker.controller) onUpdateReady();
      });
    });
  };

  const start = () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        registration = reg;
        watch(reg);
        // Buscar versiones nuevas al volver a la app
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') reg.update().catch(() => {});
        });
      })
      .catch((err) => console.warn('Service Worker no registrado:', err));
  };

  // Se llama desde un useEffect, normalmente después de que 'load' ya ocurrió
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
};

/**
 * Activa la versión nueva y recarga cuando toma el control.
 * Devuelve false si no hay una versión esperando (el llamador debe recargar por su cuenta).
 */
export const applyServiceWorkerUpdate = (): boolean => {
  const waiting = registration?.waiting;
  if (!waiting) return false;
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded) return;
    reloaded = true;
    window.location.reload();
  });
  waiting.postMessage({ type: 'SKIP_WAITING' });
  return true;
};
