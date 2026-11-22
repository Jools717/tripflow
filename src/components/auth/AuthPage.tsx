import React from 'react';
import { CalendarDays, Wallet, WifiOff, Navigation, Download } from 'lucide-react';
import { useInstallPrompt } from '../../services/installPrompt';
import { Wordmark } from '../common/Logo';
import { AuthApi } from '../../hooks/useAuth';
import AuthPanel from './AuthPanel';

const FEATURES = [
  { icon: CalendarDays, text: 'Itinerario día a día con tablero y línea de tiempo' },
  { icon: Wallet, text: 'Presupuesto y gastos en tu moneda y en la local' },
  { icon: Navigation, text: 'Cómo llegar a cada plan desde donde estés' },
  { icon: WifiOff, text: 'Funciona sin internet durante el viaje' }
];

/** Página de inicio de sesión a pantalla completa: sin sesión no se carga ningún dato de viajes. */
export default function AuthPage({ auth }: { auth: AuthApi }) {
  const { canInstall, install } = useInstallPrompt();
  return (
    <div className="tf-auth-page">
      <aside className="tf-auth-hero">
        <div className="tf-auth-hero-brand">
          <Wordmark tone="light" className="tf-wordmark-hero" />
        </div>
        <h2 className="tf-auth-hero-title">Planifica, viaja y controla tus gastos en un solo lugar.</h2>
        <ul className="tf-auth-hero-list">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text}><span><Icon size={16} /></span>{text}</li>
          ))}
        </ul>
      </aside>

      <main className="tf-auth-main">
        <div className="tf-auth-main-inner">
          <AuthPanel auth={auth} />
        </div>
        {canInstall && (
          <button type="button" className="tf-install-btn" onClick={install}>
            <Download size={16} /> Instalar TripFlow en este dispositivo
          </button>
        )}
        <p className="tf-auth-foot">TripFlow · Tus datos se guardan de forma privada en tu cuenta.</p>
      </main>
    </div>
  );
}
