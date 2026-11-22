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
  version: '2.7.0',
  releaseDate: 'Noviembre 2026',
  title: 'Versión 2.7: Lista para cualquier destino',
  subtitle: 'Nuevo logo, la app se actualiza sola y todo se adapta a tu viaje: días, presupuesto y moneda.',
  features: [
    {
      id: 'brand-autoupdate',
      icon: 'Zap',
      badge: 'Nuevo',
      badgeColor: '#0284c7',
      title: 'Nuevo logo y actualización automática',
      description: 'La T de TripFlow ahora es un avión. Al abrir la app se actualiza sola y te avisa de lo nuevo.'
    },
    {
      id: 'any-destination',
      icon: 'Globe',
      badge: 'Mejora',
      badgeColor: '#10b981',
      title: 'Hecha para cualquier destino',
      description: 'Los días, el presupuesto y la moneda de cada viaje se usan en todo: nuevo plan, mover de día, vista día a día y billetera.'
    },
    {
      id: 'fixes-27',
      icon: 'ShieldCheck',
      badge: 'Corrección',
      badgeColor: '#8b5cf6',
      title: 'Checklist y Mis Viajes',
      description: 'El checklist conserva todos tus ítems al añadir uno nuevo, y Mis Viajes muestra los días y el gasto exactos.'
    },
    {
      id: 'accounts-offline',
      icon: 'User',
      badge: 'Recuerda',
      badgeColor: '#f59e0b',
      title: 'Tu cuenta y sin conexión',
      description: 'Entra con Google, con tu correo o como invitado. Sin internet, tus cambios se guardan y se envían al volver la señal.'
    }
  ]
};
