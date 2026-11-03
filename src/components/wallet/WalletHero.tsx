import React, { useState, useEffect } from 'react';
import { Wallet, ArrowRightLeft, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { formatCurrencyARS, parseCurrencyNumber } from '../../utils/helpers';

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
  percentUsed
}: WalletHeroProps) {
  const [rateInput, setRateInput] = useState(exchangeRate ? exchangeRate.toString() : '1540');
  const [isFetchingRate, setIsFetchingRate] = useState(false);
  const [lastRateUpdate, setLastRateUpdate] = useState<{ compra: number; venta: number; time: string } | null>(null);

  useEffect(() => {
    if (exchangeRate && exchangeRate >= 100) {
      setRateInput(exchangeRate.toString());
    }
  }, [exchangeRate]);

  const handleRateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRateInput(val);
    const parsed = parseCurrencyNumber(val);
    if (parsed >= 100 && onUpdateExchangeRate) {
      onUpdateExchangeRate(parsed);
    }
  };

  const handleRateInputBlur = () => {
    const parsed = parseCurrencyNumber(rateInput);
    if (!parsed || parsed < 100) {
      const fallback = (exchangeRate && exchangeRate >= 100) ? exchangeRate : 1540;
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

  const fetchLiveDolarBlue = async () => {
    setIsFetchingRate(true);
    try {
      const res = await fetch('https://dolarapi.com/v1/dolares/blue');
      if (res.ok) {
        const data = await res.json();
        const live = Number(data.compra) || Number(data.venta);
        if (live && live >= 100 && onUpdateExchangeRate) {
          onUpdateExchangeRate(live);
          setRateInput(live.toString());
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setLastRateUpdate({ compra: data.compra, venta: data.venta, time: timeStr });
        }
      }
    } catch (err) {
      console.warn('No se pudo obtener cotización automática:', err);
    } finally {
      setIsFetchingRate(false);
    }
  };

  const getStatusBadge = () => {
    if (percentUsed >= 90) {
      return { label: '¡Atención! Cerca del tope de $1.000 USD', class: 'danger', icon: AlertTriangle };
    }
    if (percentUsed >= 70) {
      return { label: 'Gastado más del 70% del presupuesto', class: 'warning', icon: AlertTriangle };
    }
    return { label: '¡Ritmo excelente! Por debajo del tope', class: 'healthy', icon: CheckCircle2 };
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
              <h3>Billetera del Viaje (Tope $1.000 USD Blue)</h3>
              <span className={`wallet-status-chip ${status.class}`}>
                <StatusIcon size={14} />
                <span>{status.label}</span>
              </span>
            </div>
            <p className="wallet-subtitle">
              Hospedaje en casa de tu amiga ($0). Se suman automáticamente los valores de tus <strong>cards del itinerario</strong> y tus <strong>gastos/tickets registrados</strong>.
            </p>
          </div>
        </div>

        {/* Dólar Blue Rate Adjuster */}
        <div className="blue-rate-card">
          <div className="blue-rate-header">
            <div className="blue-rate-title">
              <ArrowRightLeft size={14} className="text-amber" />
              <span>Cotización Dólar Blue</span>
            </div>
            <button
              type="button"
              className="btn-fetch-live-rate"
              onClick={fetchLiveDolarBlue}
              disabled={isFetchingRate}
              title="Consultar precio real de hoy en DolarApi.com"
            >
              <RefreshCw size={12} className={isFetchingRate ? 'spin-icon' : ''} />
              <span>{isFetchingRate ? 'Consultando...' : 'En vivo'}</span>
            </button>
          </div>

          <div className="blue-rate-input-row">
            <span className="rate-prefix">1 USD = $</span>
            <input
              type="text"
              inputMode="decimal"
              value={rateInput}
              onChange={handleRateInputChange}
              onBlur={handleRateInputBlur}
              onKeyDown={handleRateKeyDown}
              placeholder="1540"
              className="blue-rate-field"
              title="Ajusta el valor en Pesos Argentinos (ARS) de 1 Dólar"
              aria-label="Pesos Argentinos por 1 USD"
            />
            <span className="rate-suffix">ARS</span>
          </div>

          {lastRateUpdate && (
            <div className="live-rate-sub-tag">
              ✓ DolarApi ({lastRateUpdate.time}): Compra ${lastRateUpdate.compra} / Venta ${lastRateUpdate.venta}
            </div>
          )}

          <div className="rate-preset-chips">
            <button type="button" onClick={() => onUpdateExchangeRate(1540)} className={`preset-btn ${Number(exchangeRate) === 1540 ? 'active' : ''}`}>1540 (Compra)</button>
            <button type="button" onClick={() => onUpdateExchangeRate(1560)} className={`preset-btn ${Number(exchangeRate) === 1560 ? 'active' : ''}`}>1560 (Venta)</button>
            <button type="button" onClick={() => onUpdateExchangeRate(1500)} className={`preset-btn ${Number(exchangeRate) === 1500 ? 'active' : ''}`}>1500</button>
            <button type="button" onClick={() => onUpdateExchangeRate(1600)} className={`preset-btn ${Number(exchangeRate) === 1600 ? 'active' : ''}`}>1600</button>
          </div>
        </div>
      </div>

      {/* Progress Bar towards $1,000 USD */}
      <div className="budget-cap-progress-section">
        <div className="progress-labels-row">
          <div className="progress-left-label">
            <span>Total facturado en planes/gastos:</span>
            <strong className="spent-val">{formatCurrencyARS(totalARS)}</strong>
            <span className="spent-ars-sub">(Descuenta ≈ ${Math.round(totalUSD)} USD Blue)</span>
            <div className="spent-split-hint">
              <span>Itinerario: {formatCurrencyARS(totalItineraryARS)} (≈ ${Math.round(totalItineraryARS / safeRate)} USD)</span>
              <span>• Compras/Tickets: {formatCurrencyARS(totalDirectARS)} (≈ ${Math.round(totalDirectARS / safeRate)} USD)</span>
            </div>
          </div>
          <div className="progress-center-pct">
            <span>{percentUsed}% del tope</span>
          </div>
          <div className="progress-right-label">
            <span>Efectivo disponible restante:</span>
            <strong className="remaining-val">${Math.round(remainingUSD)} USD Blue</strong>
            <span className="remaining-ars-sub">(Equivale a {formatCurrencyARS(remainingARS)})</span>
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

