import React, { useState, useEffect } from 'react';
import { Wallet, ArrowRightLeft, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { formatCurrency, parseCurrencyNumber, getCurrencyFlag, getCurrencySymbol } from '../../utils/helpers';
import { fetchLiveExchangeRate } from '../../services/fxRatesService';

interface WalletHeroProps {
  exchangeRate: number;
  safeRate: number;
  onUpdateExchangeRate: (rate: number) => void;
  totalARS: number;
  totalUSD: number;
  totalItineraryARS: number;
  totalDirectARS: number;
  remainingUSD: number;
  remainingARS: number;
  percentUsed: number;
  budgetCapUSD?: number;
  baseCurrency?: string;
  localCurrency?: string;
  countryCode?: string;
}

export default function WalletHero({
  exchangeRate,
  safeRate,
  onUpdateExchangeRate,
  totalARS,
  totalUSD,
  totalItineraryARS,
  totalDirectARS,
  remainingUSD,
  remainingARS,
  percentUsed,
  budgetCapUSD = 1000,
  baseCurrency = 'USD',
  localCurrency = 'ARS',
  countryCode = 'AR'
}: WalletHeroProps) {
  const baseFlag = getCurrencyFlag(baseCurrency, baseCurrency === 'USD' ? 'US' : undefined);
  const localFlag = getCurrencyFlag(localCurrency, countryCode);
  const localSymbol = getCurrencySymbol(localCurrency);

  const [rateInput, setRateInput] = useState(exchangeRate ? exchangeRate.toString() : '1540');
  const [isFetchingRate, setIsFetchingRate] = useState(false);
  const [lastRateUpdate, setLastRateUpdate] = useState<string | null>(null);

  useEffect(() => {
    if (exchangeRate && exchangeRate > 0) {
      setRateInput(exchangeRate.toString());
    }
  }, [exchangeRate]);

  const handleRateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRateInput(val);
    const parsed = parseCurrencyNumber(val);
    if (parsed > 0 && onUpdateExchangeRate) {
      onUpdateExchangeRate(parsed);
    }
  };

  const handleRateInputBlur = () => {
    const parsed = parseCurrencyNumber(rateInput);
    if (!parsed || parsed <= 0) {
      const fallback = (exchangeRate && exchangeRate > 0) ? exchangeRate : 1540;
      setRateInput(fallback.toString());
      if (onUpdateExchangeRate) onUpdateExchangeRate(fallback);
    } else if (onUpdateExchangeRate) {
      onUpdateExchangeRate(parsed);
    }
  };

  const handleRateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const fetchLiveRate = async () => {
    setIsFetchingRate(true);
    setLastRateUpdate(null);
    try {
      const res = await fetchLiveExchangeRate(baseCurrency, localCurrency, countryCode);
      if (res.rate && res.rate > 0 && onUpdateExchangeRate) {
        onUpdateExchangeRate(res.rate);
        setRateInput(res.rate.toString());
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastRateUpdate(`${res.source} (${timeStr}): 1 ${baseCurrency} = ${res.rate} ${localCurrency}`);
      }
    } catch (err) {
      console.warn('No se pudo obtener cotización automática:', err);
    } finally {
      setIsFetchingRate(false);
    }
  };

  const getStatusBadge = () => {
    if (percentUsed >= 90) {
      return { label: `¡Atención! Cerca del tope de ${baseFlag} $${budgetCapUSD} ${baseCurrency}`, class: 'danger', icon: AlertTriangle };
    }
    if (percentUsed >= 70) {
      return { label: `Gastado más del 70% del presupuesto`, class: 'warning', icon: AlertTriangle };
    }
    return { label: `¡Ritmo excelente! Por debajo del tope`, class: 'healthy', icon: CheckCircle2 };
  };

  const status = getStatusBadge();
  const StatusIcon = status.icon;

  return (
    <div className={`budget-cap-hero-card ${status.class}`}>
      <div className="budget-cap-top-row">
        <div className="wallet-brand-group">
          <div className="wallet-avatar-badge">
            <Wallet size={26} className="wallet-main-icon" />
          </div>
          <div>
            <div className="wallet-title-row">
              <h3>Billetera del Viaje ({baseFlag} Tope ${budgetCapUSD} {baseCurrency})</h3>
              <span className={`wallet-status-chip ${status.class}`}>
                <StatusIcon size={14} />
                <span>{status.label}</span>
              </span>
            </div>
            <p className="wallet-subtitle">
              Se suman automáticamente los valores de tus <strong>cards del itinerario</strong> y tus <strong>gastos/tickets registrados</strong> en {localFlag} <strong>{localCurrency}</strong>.
            </p>
          </div>
        </div>

        {/* Currency Rate Adjuster with Flags */}
        <div className="blue-rate-card">
          <div className="blue-rate-header">
            <div className="blue-rate-title">
              <ArrowRightLeft size={14} className="text-amber" />
              <span>Cotización {baseFlag} {baseCurrency} ➔ {localFlag} {localCurrency}</span>
            </div>
            <button
              type="button"
              className="btn-fetch-live-rate"
              onClick={fetchLiveRate}
              disabled={isFetchingRate}
              title={`Consultar precio en vivo de ${baseCurrency} a ${localCurrency}`}
            >
              <RefreshCw size={12} className={isFetchingRate ? 'spin-icon' : ''} />
              <span>{isFetchingRate ? 'Consultando...' : 'En vivo'}</span>
            </button>
          </div>

          <div className="blue-rate-input-row">
            <span className="rate-prefix">{baseFlag} 1 {baseCurrency} = {localSymbol}</span>
            <input
              type="text"
              inputMode="decimal"
              value={rateInput}
              onChange={handleRateInputChange}
              onBlur={handleRateInputBlur}
              onKeyDown={handleRateKeyDown}
              placeholder="1"
              className="blue-rate-field"
              title={`Ajusta el valor en ${localCurrency} de 1 ${baseCurrency}`}
              aria-label={`${localCurrency} por 1 ${baseCurrency}`}
            />
            <span className="rate-suffix">{localFlag} {localCurrency}</span>
          </div>

          {lastRateUpdate && (
            <div className="live-rate-sub-tag">
              ✓ {lastRateUpdate}
            </div>
          )}

          {countryCode === 'AR' ? (
            <div className="rate-preset-chips">
              <button type="button" onClick={() => onUpdateExchangeRate(1540)} className={`preset-btn ${Number(exchangeRate) === 1540 ? 'active' : ''}`}>🇦🇷 1540 (Compra)</button>
              <button type="button" onClick={() => onUpdateExchangeRate(1560)} className={`preset-btn ${Number(exchangeRate) === 1560 ? 'active' : ''}`}>🇦🇷 1560 (Venta)</button>
              <button type="button" onClick={() => onUpdateExchangeRate(1500)} className={`preset-btn ${Number(exchangeRate) === 1500 ? 'active' : ''}`}>1500</button>
              <button type="button" onClick={() => onUpdateExchangeRate(1600)} className={`preset-btn ${Number(exchangeRate) === 1600 ? 'active' : ''}`}>1600</button>
            </div>
          ) : (
            <div className="rate-preset-chips">
              <span className="rate-hint-text">
                {localFlag} Moneda oficial del destino: <strong>{localCurrency}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar towards Budget Cap */}
      <div className="budget-cap-progress-section">
        <div className="progress-labels-row">
          <div className="progress-left-label">
            <span>Total gastado en {localFlag} {localCurrency}:</span>
            <strong className="spent-val">{formatCurrency(totalARS, localCurrency)}</strong>
            <span className="spent-ars-sub">(Descuenta ≈ {baseFlag} ${Math.round(totalUSD)} {baseCurrency})</span>
            <div className="spent-split-hint">
              <span>Itinerario: {formatCurrency(totalItineraryARS, localCurrency)} (≈ {baseFlag} ${Math.round(totalItineraryARS / safeRate)} {baseCurrency})</span>
              <span>• Compras/Tickets: {formatCurrency(totalDirectARS, localCurrency)} (≈ {baseFlag} ${Math.round(totalDirectARS / safeRate)} {baseCurrency})</span>
            </div>
          </div>
          <div className="progress-center-pct">
            <span>{percentUsed}% del tope</span>
          </div>
          <div className="progress-right-label">
            <span>Presupuesto restante:</span>
            <strong className="remaining-val">{baseFlag} ${Math.round(remainingUSD)} {baseCurrency}</strong>
            <span className="remaining-ars-sub">(Equivale a {localFlag} {formatCurrency(remainingARS, localCurrency)})</span>
          </div>
        </div>

        <div className="wallet-progress-track">
          <div
            className={`wallet-progress-bar ${status.class}`}
            style={{ width: `${percentUsed}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
