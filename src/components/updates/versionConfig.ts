export interface ReleaseFeature {
  id: string;
  icon: 'Globe' | 'User' | 'Zap' | 'Receipt' | 'ShieldCheck';
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
}

export interface AppRelease {
  version: string;
  releaseDate: string;
  title: string;
  subtitle: string;
  features: ReleaseFeature[];
}

export const CURRENT_RELEASE: AppRelease = {
  version: '2.5.0',
  releaseDate: 'Noviembre 2026',
  title: 'Versión 2.5: Tu cuenta TripFlow',
  subtitle: 'Crea tu cuenta con Google o con tu correo, y usa la app sin internet.',
  features: [
    {
      id: 'accounts',
      icon: 'User',
      badge: 'Nuevo',
      badgeColor: '#0284c7',
      title: 'Cuentas con Google o correo',
      description: 'Regístrate con Google o con tu correo y una contraseña. Si la olvidas, te enviamos un enlace para crear una nueva.'
    },
    {
      id: 'offline',
      icon: 'Zap',
      badge: 'Nuevo',
      badgeColor: '#f59e0b',
      title: 'Modo sin conexión',
      description: 'La app abre sin internet y lo que anotes se envía a la nube al recuperar la señal. Verás "Sin conexión" y los cambios pendientes en la cabecera.'
    },
    {
      id: 'compact-header',
      icon: 'User',
      badge: 'Nuevo',
      badgeColor: '#6d28d9',
      title: 'Cabecera y menú de cuenta',
      description: 'Más espacio para tu itinerario. Toca tu avatar para ver tu cuenta, las novedades o cerrar sesión, y la cotización para editarla.'
    },
    {
      id: 'directions',
      icon: 'Globe',
      badge: 'Nuevo',
      badgeColor: '#0284c7',
      title: 'Cómo llegar desde tu ubicación',
      description: 'Toca "¿Cómo llegar?" en un plan o en el mapa: ve la ruta de Google Maps desde donde estás sin salir de la app, con transporte, a pie, auto o bici.'
    },
    {
      id: 'export',
      icon: 'Receipt',
      badge: 'Nuevo',
      badgeColor: '#ef4444',
      title: 'Exportar: PDF con mapa, calendario y WhatsApp',
      description: 'Botón "Exportar" en el Itinerario: informe PDF con mapa de planes, archivo para tu calendario o resumen por WhatsApp.'
    }
  ]
};
