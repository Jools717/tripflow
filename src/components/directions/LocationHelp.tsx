import React from 'react';
import { isIOS } from '../../services/locationService';

interface LocationHelpProps {
  reason: 'denied' | 'unavailable' | 'timeout' | 'unsupported' | 'insecure';
}

/** Instrucciones para activar la ubicación según el problema y el sistema del celular. */
export default function LocationHelp({ reason }: LocationHelpProps) {
  if (reason === 'unsupported' || reason === 'insecure') {
    return (
      <p className="directions-help-text">
        Este navegador no permite compartir la ubicación
        {reason === 'insecure' ? ' en una conexión sin HTTPS' : ''}. Puedes abrir la ruta igualmente:
        Google Maps usará la ubicación de tu teléfono.
      </p>
    );
  }

  if (reason === 'timeout' || reason === 'unavailable') {
    return (
      <p className="directions-help-text">
        No pudimos encontrarte. Revisa que el <strong>GPS / Ubicación</strong> del teléfono esté encendido
        y vuelve a intentarlo, o abre la ruta sin tu ubicación.
      </p>
    );
  }

  return (
    <div className="directions-help-text">
      <p>
        La ubicación está <strong>bloqueada</strong> para TripFlow. Para activarla:
      </p>
      {isIOS() ? (
        <ol>
          <li>Abre <strong>Ajustes</strong> → <strong>Privacidad y seguridad</strong> → <strong>Localización</strong>.</li>
          <li>Activa la localización y entra en <strong>Safari</strong> (o en la app TripFlow si la instalaste).</li>
          <li>Elige <strong>"Al usar la app"</strong> y vuelve aquí.</li>
        </ol>
      ) : (
        <ol>
          <li>Toca el ícono <strong>ⓘ</strong> o el candado junto a la dirección (o mantén pulsado el ícono de TripFlow → <strong>Información de la app</strong>).</li>
          <li>Entra en <strong>Permisos</strong> → <strong>Ubicación</strong> → <strong>Permitir</strong>.</li>
          <li>Vuelve aquí y toca <strong>Reintentar</strong>.</li>
        </ol>
      )}
    </div>
  );
}
