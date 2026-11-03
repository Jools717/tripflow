import React, { useState, useEffect } from 'react';
import { Calendar, Wallet, CheckCircle2, ArrowRightLeft, RefreshCw, ChevronDown, User, Sparkles } from 'lucide-react';
import { formatCurrency, parseCurrencyNumber, getCurrencyFlag, getCurrencySymbol } from '../../utils/helpers';
import { Trip } from '../../types/trip';
import { UserProfile } from '../../types/user';
import { fetchLiveExchangeRate } from '../../services/fxRatesService';

interface HeaderProps {
  activitiesCount: number;
  completedCount: number;
  totalSpentARS: number;
  exchangeRate?: number;
  onUpdateExchangeRate: (rate: number) => void;
  cloudSyncStatus?: string;
  onNavigateToBudget: () => void;
  activeTrip?: Trip;
  onOpenTripSelector?: () => void;
  user?: UserProfile | null;
  onOpenAuthModal?: () => void;
  onOpenWhatsNew?: () => void;
}

export default function Header({
  activitiesCount,
  completedCount,
  totalSpentARS,
  exchangeRate = 1540,
  onUpdateExchangeRate,
  cloudSyncStatus = 'offline',
  onNavigateToBudget,
  activeTrip,
  onOpenTripSelector,
  user,
  onOpenAuthModal,
  onOpenWhatsNew
}: HeaderProps) {
  const baseCurrency = activeTrip?.baseCurrency || 'USD';
  const localCurrency = activeTrip?.localCurrency || 'ARS';
  const countryCode = activeTrip?.countryCode || 'AR';

  const baseFlag = getCurrencyFlag(baseCurrency, baseCurrency === 'USD' ? 'US' : undefined);
  const localFlag = getCurrencyFlag(localCurrency, countryCode);
  const localSymbol = getCurrencySymbol(localCurrency);

  const [rateInput, setRateInput] = useState(exchangeRate ? exchangeRate.toString() : '1540');
  const [isFetchingRate, setIsFetchingRate] = useState(false);
  const [rateFeedback, setRateFeedback] = useState<string | null>(null);

  const budgetCap = activeTrip?.budgetTotalBase || 1000;
  const safeRate = exchangeRate && exchangeRate > 0 ? exchangeRate : 1540;
  const totalSpentUSD = totalSpentARS / safeRate;
  const remainingUSD = Math.max(0, budgetCap - totalSpentUSD);
  const budgetPercentage = Math.min(100, Math.round((totalSpentUSD / budgetCap) * 100));

  useEffect(() => {
    if (exchangeRate && exchangeRate > 0) {
      setRateInput(exchangeRate.toString());
    }
  }, [exchangeRate]);

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRateInput(val);
    const parsed = parseCurrencyNumber(val);
    if (parsed > 0 && onUpdateExchangeRate) {
      onUpdateExchangeRate(parsed);
    }
  };

  const handleRateBlur = () => {
    const parsed = parseCurrencyNumber(rateInput);
    if (!parsed || parsed <= 0) {
      const fallback = (exchangeRate && exchangeRate > 0) ? exchangeRate : 1540;
      setRateInput(fallback.toString());
      if (onUpdateExchangeRate) onUpdateExchangeRate(fallback);
    } else if (onUpdateExchangeRate) {
      onUpdateExchangeRate(parsed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleQuickPreset = (rate: number) => {
    setRateInput(rate.toString());
    if (onUpdateExchangeRate) {
      onUpdateExchangeRate(rate);
    }
  };

  const handleFetchLive = async () => {
    setIsFetchingRate(true);
    setRateFeedback(null);
    try {
      const res = await fetchLiveExchangeRate(baseCurrency, localCurrency, countryCode);
      if (res.rate && res.rate > 0) {
        handleQuickPreset(res.rate);
        setRateFeedback(`${localFlag} Actualizado: 1 ${baseCurrency} = ${res.rate} ${localCurrency}`);
        setTimeout(() => setRateFeedback(null), 3500);
      }
    } catch {
      // offline fallback
    } finally {
      setIsFetchingRate(false);
    }
  };

  const getBudgetMeterClass = () => {
    if (budgetPercentage >= 90) return 'danger';
    if (budgetPercentage >= 70) return 'warning';
    return 'healthy';
  };

  return (
    <header className="app-header">
      <div className="header-backdrop-pattern"></div>
      <div className="header-container">
        {/* Brand & Title */}
        <div className="header-brand">
          <div className="brand-logo">
            <span className="arg-flag-indicator">
              <span className="flag-stripe sky"></span>
              <span className="flag-sun">{activeTrip?.flagEmoji || localFlag}</span>
              <span className="flag-stripe sky"></span>
            </span>
          </div>
          <div>
            <div className="brand-badge-row">
              {/* Trip Switcher Pill */}
              <button
                type="button"
                className="trip-switcher-badge-btn"
                onClick={onOpenTripSelector}
                title="Cambiar o crear viaje"
              >
                <span className="trip-flag-icon">{activeTrip?.flagEmoji || localFlag}</span>
                <span className="trip-title-text">{activeTrip?.title || 'Buenos Aires 2026'}</span>
                <ChevronDown size={13} className="trip-chevron" />
              </button>

              {onOpenWhatsNew && (
                <button
                  type="button"
                  className="btn-whats-new-badge"
                  onClick={onOpenWhatsNew}
                  title="Ver novedades de la versión v2.0"
                >
                  <Sparkles size={11} className="text-amber" />
                  <span>Novedades v2.0</span>
                </button>
              )}

              {cloudSyncStatus === 'connected' && (
                <span className="cloud-badge connected" title="Sincronizado en tiempo real con Supabase">
                  🟢 Nube en Vivo
                </span>
              )}
              {cloudSyncStatus === 'saving' && (
                <span className="cloud-badge syncing" title="Guardando cambios">
                  💾 Guardando...
                </span>
              )}
              {cloudSyncStatus === 'syncing' && (
                <span className="cloud-badge syncing" title="Sincronizando datos">
                  🔄 Sincronizando...
                </span>
              )}
              {cloudSyncStatus === 'offline' && (
                <span className="cloud-badge offline" title="Guardando en la memoria del dispositivo">
                  💾 Local
                </span>
              )}
            </div>

            <div className="brand-title-flow-row">
              <span className="brand-app-name">TripFlow</span>
              <span className="brand-dot-separator">•</span>
              <h1 className="brand-title">{activeTrip?.destinationCity ? `${activeTrip.destinationCity}` : 'Buenos Aires'}</h1>
            </div>
            <p className="brand-subtitle">
              {activeTrip 
                ? `${activeTrip.startDate} al ${activeTrip.endDate} • ${activeTrip.flagEmoji || localFlag} ${activeTrip.title}` 
                : '10 al 23 de Octubre • 🇦🇷 Buenos Aires 2026'}
            </p>
          </div>
        </div>

        {/* Stats Badges + Interactive Wallet Widget ($1,000 USD Cap) */}
        <div className="header-stats">
          <div className="stat-pill">
            <Calendar className="stat-icon text-sky" size={16} />
            <div className="stat-text">
              <span className="stat-label">Llegada</span>
              <span className="stat-value">{activeTrip ? activeTrip.startDate : '10 Oct · 05:30 AM'}</span>
            </div>
          </div>

          <div className="stat-pill">
            <CheckCircle2 className="stat-icon text-emerald" size={16} />
            <div className="stat-text">
              <span className="stat-label">Planes</span>
              <span className="stat-value">{completedCount}/{activitiesCount} listos</span>
            </div>
          </div>

          <div
            className={`stat-pill wallet-header-pill ${getBudgetMeterClass()}`}
            onClick={onNavigateToBudget}
            title="Haz clic para ver el desglose en Gastos & Billetera"
            role="button"
            tabIndex={0}
          >
            <div className="wallet-icon-wrapper">
              <Wallet size={18} className="wallet-icon" />
            </div>
            <div className="stat-text wallet-stat-text">
              <div className="wallet-labels-row">
                <span className="stat-label">
                  Billetera ({baseFlag} Tope ${budgetCap} {baseCurrency})
                </span>
                <span className="wallet-remaining-tag">
                  Quedan {baseFlag} ${Math.round(remainingUSD)} {baseCurrency}
                </span>
              </div>
              <div className="wallet-values-row">
                <span className="wallet-usd-val">
                  {baseFlag} ${Math.round(totalSpentUSD)} <small className="usd-cap">/ ${budgetCap} {baseCurrency}</small>
                </span>
                <span className="wallet-ars-val">
                  ({localFlag} {formatCurrency(totalSpentARS, localCurrency)})
                </span>
              </div>
              <div className="header-budget-track">
                <div
                  className={`header-budget-bar ${getBudgetMeterClass()}`}
                  style={{ width: `${budgetPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* User Profile / Auth Button */}
          <button
            type="button"
            className={`header-auth-btn ${user ? 'logged-in' : ''} ${user?.role === 'admin' ? 'admin' : ''}`}
            onClick={onOpenAuthModal}
            title={user ? `Sesión iniciada como: ${user.displayName || user.email}` : 'Iniciar sesión para sincronizar'}
          >
            <User size={15} />
            <span className="auth-btn-label">
              {user ? (user.displayName || user.email?.split('@')[0]) : 'Iniciar Sesión'}
            </span>
          </button>
        </div>

        {/* Input de Cotización de Moneda con Banderas */}
        <div className="header-currency-widget">
          <div className="currency-widget-top">
            <div className="currency-widget-title">
              <ArrowRightLeft size={13} className="text-sky" />
              <span>
                Cotización: {baseFlag} {baseCurrency} ➔ {localFlag} {localCurrency}
                {countryCode === 'AR' && ' (Dólar Blue)'}
              </span>
            </div>
            
            <button
              type="button"
              className="btn-header-live-rate"
              onClick={handleFetchLive}
              disabled={isFetchingRate}
              title={`Consultar precio en vivo de ${baseCurrency} a ${localCurrency}`}
            >
              <RefreshCw size={11} className={isFetchingRate ? 'spin-icon' : ''} />
              <span>{isFetchingRate ? 'Consultando...' : 'En vivo'}</span>
            </button>
          </div>

          {rateFeedback && (
            <div className="rate-feedback-toast animate-fade-in">
              <span>{rateFeedback}</span>
            </div>
          )}

          <div className="currency-widget-inputs-row">
            <div className="fixed-usd-tag">
              <span className="usd-flag">{baseFlag}</span>
              <span className="usd-text">1 {baseCurrency}</span>
              <span className="currency-equals-sign">=</span>
            </div>

            <div className="currency-input-pill ars-pill">
              <span className="pill-currency-flag">{localFlag}</span>
              <span className="pill-currency-symbol">{localSymbol}</span>
              <input
                type="text"
                inputMode="decimal"
                value={rateInput}
                onChange={handleRateChange}
                onBlur={handleRateBlur}
                onKeyDown={handleKeyDown}
                placeholder="1"
                className="currency-input-field ars"
                title={`Ajusta el valor en ${localCurrency} de 1 ${baseCurrency}`}
                aria-label={`${localCurrency} por 1 ${baseCurrency}`}
              />
              <span className="pill-currency-code">{localCurrency}</span>
            </div>
          </div>

          {countryCode === 'AR' && (
            <div className="currency-widget-presets">
              <button
                type="button"
                className={`widget-preset-chip ${Number(exchangeRate) === 1540 ? 'active' : ''}`}
                onClick={() => handleQuickPreset(1540)}
                title="Precio de compra en cuevas (cambiar USD a ARS)"
              >
                🇦🇷 1.540 (Compra)
              </button>
              <button
                type="button"
                className={`widget-preset-chip ${Number(exchangeRate) === 1560 ? 'active' : ''}`}
                onClick={() => handleQuickPreset(1560)}
                title="Precio de venta en cuevas"
              >
                🇦🇷 1.560 (Venta)
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
