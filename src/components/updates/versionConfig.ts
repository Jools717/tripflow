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
  version: '2.2.0',
  releaseDate: 'Noviembre 2026',
  title: 'Versión 2.2: Cómo llegar y Exportar',
  subtitle: 'Llega a cada plan desde donde estés y lleva tu itinerario a cualquier parte.',
  features: [
    {
      id: 'directions',
      icon: 'Globe',
      badge: 'Nuevo',
      badgeColor: '#0284c7',
      title: 'Cómo llegar desde tu ubicación',
      description: 'Toca "¿Cómo llegar?" en un plan o en el mapa: ve la ruta de Google Maps desde donde estás sin salir de la app, con transporte, a pie, auto o bici.'
    },
    {
      id: 'export-pdf',
      icon: 'Receipt',
      badge: 'Nuevo',
      badgeColor: '#ef4444',
      title: 'Informe PDF',
      description: 'Itinerario día por día con resumen financiero y gastos, listo para imprimir o guardar offline. Botón "Exportar" en el Itinerario.'
    },
    {
      id: 'export-ics-share',
      icon: 'Zap',
      badge: 'Nuevo',
      badgeColor: '#10b981',
      title: 'Calendario y WhatsApp',
      description: 'Añade tus planes a Google Calendar, Apple Calendar u Outlook (.ics) o comparte un resumen del viaje por WhatsApp.'
    },
    {
      id: 'fixes-201',
      icon: 'ShieldCheck',
      badge: 'Corrección',
      badgeColor: '#8b5cf6',
      title: 'Viajes nuevos más fiables',
      description: 'Cada viaje tiene su propia cotización, las fechas son exactas, el asistente ya no se salta pasos y verás un aviso si algo no se guarda en la nube.'
    }
  ]
};
