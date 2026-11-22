import React, { useEffect, useRef, useState } from 'react';
import { ArrowRightLeft, RefreshCw, Pencil } from 'lucide-react';
import { parseCurrencyNumber } from '../../../utils/helpers';
import { fetchLiveExchangeRate } from '../../../services/fxRatesService';

interface RateEditorProps {
  exchangeRate: number;
  baseCurrency: string;
  localCurrency: string;
  countryCode: string;
  onUpdateExchangeRate: (rate: number) => void;
}

const AR_PRESETS = [
  { rate: 1540, label: '1.540 Compra', title: 'Precio de compra en cuevas (cambiar USD a ARS)' },
  { rate: 1560, label: '1.560 Venta', title: 'Precio de venta en cuevas' }
];

/** Indicador de cotización; al tocarlo se abre un panel para editarla o consultarla en vivo. */
export default function RateEditor({
  exchangeRate,
  baseCurrency,
  localCurrency,
  countryCode,
  onUpdateExchangeRate
}: RateEditorProps) {
  const [open, setOpen] = useState(false);
  const [rateInput, setRateInput] = useState(String(exchangeRate || ''));
  const [isFetching, setIsFetching] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const isArgentina = countryCode === 'AR';

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const commit = (value: string) => {
    const parsed = parseCurrencyNumber(value);
    if (parsed > 0) onUpdateExchangeRate(parsed);
    else setRateInput(String(exchangeRate));
  };

  const applyRate = (rate: number) => {
    setRateInput(String(rate));
    onUpdateExchangeRate(rate);
  };

  const handleFetchLive = async () => {
    setIsFetching(true);
    setFeedback(null);
    try {
      const res = await fetchLiveExchangeRate(baseCurrency, localCurrency, countryCode);
      if (res.rate && res.rate > 0) {
        applyRate(res.rate);
        setFeedback(`Actualizado: 1 ${baseCurrency} = ${res.rate.toLocaleString('es-AR')} ${localCurrency}`);
      } else {
        setFeedback('No se pudo consultar ahora. Puedes escribir el valor a mano.');
      }
    } catch {
      setFeedback('Sin conexión. Puedes escribir el valor a mano.');
    } finally {
      setIsFetching(false);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const display = exchangeRate.toLocaleString('es-AR', { maximumFractionDigits: exchangeRate < 10 ? 4 : 2 });

  return (
    <div className="tf-rate" ref={rootRef}>
      <button
        type="button"
        className={`tf-stat tf-stat-rate ${open ? 'open' : ''}`}
        onClick={() => {
          if (!open) setRateInput(String(exchangeRate));
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        title="Editar la cotización"
      >
        <span className="tf-stat-label">
          <ArrowRightLeft size={12} /> {isArgentina ? 'Dólar Blue' : 'Cotización'}
        </span>
        <span className="tf-stat-value">
          {display} <small>{localCurrency}</small>
        </span>
        <span className="tf-stat-sub">
          por 1 {baseCurrency} <Pencil size={11} />
        </span>
      </button>

      {open && (
        <div className="tf-rate-panel animate-scale-up" role="dialog" aria-label="Editar cotización">
          <label className="tf-rate-label" htmlFor="tf-rate-input">1 {baseCurrency} equivale a</label>
          <div className="tf-rate-input-row">
            <input
              id="tf-rate-input"
              type="text"
              inputMode="decimal"
              value={rateInput}
              onChange={(e) => setRateInput(e.target.value)}
              onBlur={(e) => commit(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { commit(rateInput); setOpen(false); } }}
              className="tf-rate-input"
              aria-label={`${localCurrency} por 1 ${baseCurrency}`}
            />
            <span className="tf-rate-code">{localCurrency}</span>
          </div>

          <button type="button" className="tf-rate-live" onClick={handleFetchLive} disabled={isFetching}>
            <RefreshCw size={14} className={isFetching ? 'spin-icon' : ''} />
            <span>{isFetching ? 'Consultando…' : `Consultar ${isArgentina ? 'Dólar Blue' : 'cotización'} en vivo`}</span>
          </button>

          {isArgentina && (
            <div className="tf-rate-presets">
              {AR_PRESETS.map((p) => (
                <button
                  key={p.rate}
                  type="button"
                  title={p.title}
                  className={`tf-rate-chip ${Number(exchangeRate) === p.rate ? 'active' : ''}`}
                  onClick={() => applyRate(p.rate)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {feedback && <p className="tf-rate-feedback" role="status">{feedback}</p>}
        </div>
      )}
    </div>
  );
}
