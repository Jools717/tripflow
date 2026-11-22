import React from 'react';
import { Plane, MapPin, Wallet, CalendarDays } from 'lucide-react';
import { BrandMark, Wordmark } from '../common/Logo';
import { UserProfile } from '../../types/user';
import UserMenu from '../common/header/UserMenu';

interface FirstTripScreenProps {
  user: UserProfile | null;
  onCreateTrip: () => void;
  onOpenAuthModal: () => void;
  onSignOut: () => Promise<unknown> | void;
}

const STEPS = [
  { icon: MapPin, text: 'Elige destino entre 50 países' },
  { icon: CalendarDays, text: 'Pon las fechas y se crean los días' },
  { icon: Wallet, text: 'Define tu presupuesto y moneda' }
];

/** Bienvenida de una cuenta sin viajes (cuentas nuevas e invitados). */
export default function FirstTripScreen({ user, onCreateTrip, onOpenAuthModal, onSignOut }: FirstTripScreenProps) {
  const name = user?.role === 'guest' ? '' : (user?.displayName || '').split(' ')[0];
  return (
    <div className="tf-first-trip">
      <div className="tf-topbar tf-first-trip-bar">
        <div className="tf-brand">
          <Wordmark />
        </div>
        <div className="tf-topbar-end">
          <UserMenu user={user} onOpenAuthModal={onOpenAuthModal} onSignOut={onSignOut} />
        </div>
      </div>

      <main className="tf-first-trip-main">
        <div className="tf-first-trip-card">
          <BrandMark size={56} />
          <h1>{name ? `¡Hola, ${name}!` : '¡Bienvenido a TripFlow!'}</h1>
          <p>Todavía no tienes viajes. Crea el primero en menos de un minuto.</p>
          <ul>
            {STEPS.map(({ icon: Icon, text }) => (
              <li key={text}><span><Icon size={15} /></span>{text}</li>
            ))}
          </ul>
          <button type="button" className="tf-auth-submit" onClick={onCreateTrip}>
            <Plane size={16} /> Crear mi primer viaje
          </button>
        </div>
      </main>
    </div>
  );
}
