import React, { Suspense, lazy } from 'react';
import { BrandMark } from './components/common/Logo';
import { useAuth } from './hooks/useAuth';
import AuthPage from './components/auth/AuthPage';

// La app de viajes se descarga y se monta solo con una sesión iniciada
const TripApp = lazy(() => import('./TripApp'));

function Splash() {
  return (
    <div className="tf-splash" role="status" aria-label="Cargando TripFlow">
      <BrandMark size={56} className="tf-splash-mark" />
    </div>
  );
}

/** Puerta de entrada: sin sesión solo existe la página de acceso; con sesión, la app. */
export default function App() {
  const auth = useAuth();

  if (auth.isLoading) return <Splash />;
  if (!auth.user) return <AuthPage auth={auth} />;

  return (
    <Suspense fallback={<Splash />}>
      <TripApp key={auth.user.id} auth={auth} />
    </Suspense>
  );
}
