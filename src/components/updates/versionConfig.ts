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
  version: '2.0.0',
  releaseDate: 'Noviembre 2026',
  title: '¡Bienvenido a la Versión 2.0!',
  subtitle: 'Hemos transformado la aplicación en una plataforma global más rápida, segura y con soporte multi-destino.',
  features: [
    {
      id: 'multi-trip',
      icon: 'Globe',
      badge: 'Nuevo',
      badgeColor: '#10b981',
      title: 'Plataforma Multi-Viaje',
      description: 'Crea y gestiona viajes a cualquier parte del mundo (Tokio, París, Madrid, EE.UU.) con selector de destino y monedas locales automáticas.'
    },
    {
      id: 'auth-cloud',
      icon: 'User',
      badge: 'Nuevo',
      badgeColor: '#0ea5e9',
      title: 'Inicio de Sesión & Nube',
      description: 'Conéctate con Google o enlace mágico para respaldar tus itinerarios, compras y gastos en tiempo real entre todos tus dispositivos.'
    },
    {
      id: 'perf-engine',
      icon: 'Zap',
      badge: 'Potencia',
      badgeColor: '#f59e0b',
      title: 'Motor TypeScript 100%',
      description: 'Código reestructurado en microcomponentes con React 19 y TypeScript: cero latencia, cálculos de liquidez al milisegundo y máxima fluidez.'
    },
    {
      id: 'ocr-scanner',
      icon: 'Receipt',
      badge: 'Mejora',
      badgeColor: '#8b5cf6',
      title: 'Escáner OCR Avanzado',
      description: 'Aplanador de perspectiva de 4 esquinas para tickets arrugados, zoom interactivo y desglose automático de productos y precios.'
    }
  ]
};
