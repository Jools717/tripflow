import React from 'react';
import { ChevronDown, CheckCircle2, Wallet } from 'lucide-react';
import { BrandMark, Wordmark } from './Logo';
import { formatCurrency, parseLocalDate, countTripDays } from '../../utils/helpers';
import { Trip } from '../../types/trip';
import { UserProfile } from '../../types/user';
import UserMenu from './header/UserMenu';
import RateEditor from './header/RateEditor';

interface HeaderProps {
  activitiesCount: number;
  completedCount: number;
  totalSpentARS: number;
  exchangeRate?: number;
  onUpdateExchangeRate: (rate: number) => void;
  cloudSyncStatus?: string;
  cloudError?: string | null;
  isOnline?: boolean;
  pendingCount?: number;
  onNavigateToBudget: () => void;
  activeTrip?: Trip;
  onOpenTripSelector?: () => void;
  user?: UserProfile | null;
  onOpenAuthModal?: () => void;
  onSignOut?: () => Promise<unknown> | void;
  onOpenWhatsNew?: () => void;
}

const SYNC_LABELS: Record<string, { label: string; tone: string; title: string }> = {
  connected: { label: 'En la nube', tone: 'ok', title: 'Sincronizado en tiempo real con Supabase' },
  saving: { label: 'Guardando…', tone: 'busy', title: 'Guardando cambios' },
  syncing: { label: 'Sincronizando…', tone: 'busy', title: 'Sincronizando datos' },
  offline: { label: 'Local', tone: 'idle', title: 'Guardando en la memoria del dispositivo' }
};

/** "10–23 oct 2026" o "28 feb – 5 mar 2027" */
const formatDateRange = (startIso: string, endIso: string): string => {
  const s = parseLocalDate(startIso);
  const e = parseLocalDate(endIso);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return `${startIso} – ${endIso}`;
  const month = (d: Date) => d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    return `${s.getDate()}–${e.getDate()} ${month(e)} ${e.getFullYear()}`;
  }
  const yearS = s.getFullYear() !== e.getFullYear() ? ` ${s.getFullYear()}` : '';
  return `${s.getDate()} ${month(s)}${yearS} – ${e.getDate()} ${month(e)} ${e.getFullYear()}`;
};

export default function Header({
  activitiesCount,
  completedCount,
  totalSpentARS,
  exchangeRate = 1540,
  onUpdateExchangeRate,
  cloudSyncStatus = 'offline',
  cloudError = null,
  isOnline = true,
  pendingCount = 0,
  onNavigateToBudget,
  activeTrip,
  onOpenTripSelector,
  user,
  onOpenAuthModal,
  onSignOut,
  onOpenWhatsNew
}: HeaderProps) {
  const baseCurrency = activeTrip?.baseCurrency || 'USD';
  const localCurrency = activeTrip?.localCurrency || 'ARS';
  const countryCode = activeTrip?.countryCode || 'AR';

  const safeRate = exchangeRate && exchangeRate > 0 ? exchangeRate : 1540;
  const budgetCap = activeTrip?.budgetTotalBase || 1000;
  const totalSpentBase = totalSpentARS / safeRate;
  const remainingBase = budgetCap - totalSpentBase;
  const budgetPct = Math.min(100, Math.round((totalSpentBase / budgetCap) * 100));
  const meter = budgetPct >= 90 ? 'danger' : budgetPct >= 70 ? 'warning' : 'healthy';
  const plansPct = activitiesCount > 0 ? Math.round((completedCount / activitiesCount) * 100) : 0;

  const money = (n: number) => formatCurrency(n, baseCurrency, { maximumFractionDigits: 0 });
  const sync = SYNC_LABELS[cloudSyncStatus] || SYNC_LABELS.offline;
  const days = activeTrip ? countTripDays(activeTrip.startDate, activeTrip.endDate) : 0;

  return (
    <header className="app-header tf-header">
      <div className="tf-header-inner">
        {/* Barra superior: marca · selector de viaje · estado · cuenta */}
        <div className="tf-topbar">
          <div className="tf-brand">
            <BrandMark size={34} className="tf-show-xs" />
            <Wordmark className="tf-hide-xs" />
          </div>

          <button type="button" className="tf-trip-switcher" onClick={onOpenTripSelector} title="Cambiar o crear viaje">
            <span className="tf-trip-flag">{activeTrip?.flagEmoji || '✈️'}</span>
            <span className="tf-trip-name">{activeTrip?.title || 'Mi viaje'}</span>
            <ChevronDown size={15} />
          </button>

          <div className="tf-topbar-end">
            {cloudError ? (
              <span className="tf-sync error" title={cloudError} role="alert">
                <span className="tf-sync-dot" /> <span>Error al guardar</span>
              </span>
            ) : !isOnline ? (
              <span className="tf-sync no-connection" title="Sin internet: los cambios se guardan en el teléfono y se enviarán al volver la señal">
                <span className="tf-sync-dot" /> <span>Sin conexión{pendingCount > 0 ? ` · ${pendingCount}` : ''}</span>
              </span>
            ) : pendingCount > 0 ? (
              <span className="tf-sync busy" title="Enviando a la nube los cambios hechos sin conexión">
                <span className="tf-sync-dot" /> <span>Enviando {pendingCount}…</span>
              </span>
            ) : (
              <span className={`tf-sync ${sync.tone}`} title={sync.title}>
                <span className="tf-sync-dot" /> <span className="tf-hide-sm">{sync.label}</span>
              </span>
            )}
            <UserMenu user={user} onOpenAuthModal={onOpenAuthModal} onSignOut={onSignOut} onOpenWhatsNew={onOpenWhatsNew} />
          </div>
        </div>

        {/* Destino, fechas e indicadores */}
        <div className="tf-trip-row">
          <div className="tf-trip-info">
            <h1>{activeTrip?.destinationCity || 'Mi viaje'}</h1>
            {activeTrip && (
              <p>{formatDateRange(activeTrip.startDate, activeTrip.endDate)} · {days} {days === 1 ? 'día' : 'días'}</p>
            )}
          </div>

          <div className="tf-stats">
            <div className="tf-stat">
              <span className="tf-stat-label"><CheckCircle2 size={12} /> Planes</span>
              <span className="tf-stat-value">{completedCount}<small>/{activitiesCount}</small></span>
              <span className="tf-stat-bar"><span className="healthy" style={{ width: `${plansPct}%` }} /></span>
            </div>

            <button type="button" className={`tf-stat tf-stat-wallet ${meter}`} onClick={onNavigateToBudget} title="Ver Billetera">
              <span className="tf-stat-label"><Wallet size={12} /> Billetera</span>
              <span className="tf-stat-value">{money(totalSpentBase)}<small> / {money(budgetCap)}</small></span>
              <span className="tf-stat-bar"><span className={meter} style={{ width: `${budgetPct}%` }} /></span>
              <span className="tf-stat-sub">
                {remainingBase >= 0 ? `Quedan ${money(remainingBase)}` : `Excedido ${money(-remainingBase)}`}
              </span>
            </button>

            <RateEditor
              exchangeRate={safeRate}
              baseCurrency={baseCurrency}
              localCurrency={localCurrency}
              countryCode={countryCode}
              onUpdateExchangeRate={onUpdateExchangeRate}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
