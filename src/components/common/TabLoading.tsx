import React from 'react';
import { Loader2 } from 'lucide-react';

/** Indicador mientras se descarga una pestaña cargada bajo demanda. */
export default function TabLoading() {
  return (
    <div className="tf-tab-loading" role="status" aria-live="polite">
      <Loader2 size={22} className="directions-spin" />
      <span>Cargando…</span>
    </div>
  );
}
