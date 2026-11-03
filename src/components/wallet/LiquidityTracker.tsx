import React from 'react';
import {
  ShoppingCart, Utensils, Bus, ShoppingBag, TrendingUp,
  Gift, CreditCard, Banknote
} from 'lucide-react';
import { Expense } from '../../types/expense';
import { formatCurrency, getExpensePaymentMethod, getCurrencyFlag } from '../../utils/helpers';
import { CASH_EXCHANGE_INFO } from '../../data/initialData';

interface LiquidityTrackerProps {
  mergedExpenses: Expense[];
  totalARS: number;
  totalUSD: number;
  safeRate: number;
  budgetCapUsd: number;
  paymentFilter: 'all' | 'efectivo' | 'tarjeta';
  setPaymentFilter: (filter: 'all' | 'efectivo' | 'tarjeta') => void;
  setActiveSubTab: (tab: string) => void;
  localCurrency?: string;
  baseCurrency?: string;
  countryCode?: string;
}

export default function LiquidityTracker({
  mergedExpenses,
  totalARS,
  totalUSD,
  safeRate,
  budgetCapUsd,
  paymentFilter,
  setPaymentFilter,
  setActiveSubTab,
  localCurrency = 'ARS',
  baseCurrency = 'USD',
  countryCode = 'AR'
}: LiquidityTrackerProps) {
  const localFlag = getCurrencyFlag(localCurrency, countryCode);
  const baseFlag = getCurrencyFlag(baseCurrency, baseCurrency === 'USD' ? 'US' : undefined);

  const sumByCategory = (catId: string) =>
    mergedExpenses.filter(e => e.category === catId).reduce((sum, e) => sum + (Number(e.amountARS) || 0), 0);

  const mercadoTotalARS = sumByCategory('mercado');
  const regalosTotalARS = sumByCategory('regalos');
  const comprasTotalARS = sumByCategory('compras');
  const gastronomiaTotalARS = sumByCategory('gastronomia');
  const transporteTotalARS = sumByCategory('transporte');

  const totalTarjetaARS = mergedExpenses
    .filter(e => getExpensePaymentMethod(e) === 'tarjeta')
    .reduce((sum, e) => sum + (Number(e.amountARS) || 0), 0);

  const totalCashARS = mergedExpenses
    .filter(e => getExpensePaymentMethod(e) === 'efectivo')
    .reduce((sum, e) => sum + (Number(e.amountARS) || 0), 0);

  const cardExpensesCount = mergedExpenses.filter(e => getExpensePaymentMethod(e) === 'tarjeta').length;
  const cashExpensesCount = mergedExpenses.filter(e => getExpensePaymentMethod(e) === 'efectivo').length;

  const isArgentina = countryCode === 'AR' || localCurrency === 'ARS';
  const cashAgreedTotal = CASH_EXCHANGE_INFO?.totalArsAgreed || 760000;
  const cashReceivedTotal = CASH_EXCHANGE_INFO?.totalCashReceived || 490000;
  const cashPendingDelivery = Math.max(0, cashAgreedTotal - cashReceivedTotal);
  const cashAvailableNow = Math.max(0, cashReceivedTotal - totalCashARS);
  const cashPercentUsed = cashReceivedTotal > 0 ? Math.min(100, Math.round((totalCashARS / cashReceivedTotal) * 100)) : 0;

  return (
    <>
      {/* CONTROL DE LIQUIDEZ Y SEGUIMIENTO: EFECTIVO EN MANO VS TARJETA */}
      <div className="liquidity-cards-grid">
        {/* Card 1: Efectivo Físico en Mano */}
        <div className="liquidity-card cash-card">
          <div className="liquidity-card-header">
            <span className="liquidity-badge-title cash">
              <Banknote size={16} /> 💵 Efectivo en Mano ({localFlag} {localCurrency})
            </span>
            <span className="liquidity-pct-chip cash">
              {isArgentina ? `${cashPercentUsed}% del efectivo gastado` : `${cashExpensesCount} pagos`}
            </span>
          </div>

          <div className="liquidity-amount-row">
            <h3 className="liquidity-ars">
              {isArgentina ? formatCurrency(cashAvailableNow, localCurrency) : formatCurrency(totalCashARS, localCurrency)}
            </h3>
            <span className="liquidity-usd">
              ≈ {baseFlag} ${Math.round((isArgentina ? cashAvailableNow : totalCashARS) / safeRate)} {baseCurrency}
            </span>
          </div>

          <p className="liquidity-subtitle">
            {isArgentina 
              ? `Saldo real disponible para gastar de los ${formatCurrency(cashReceivedTotal, localCurrency)} entregados en mano.`
              : `Total desembolsado en billetes físicos para este viaje.`}
          </p>

          <div className="liquidity-breakdown">
            {isArgentina ? (
              <>
                <div className="breakdown-row">
                  <span>Total pactado (USD 500 cambiados):</span>
                  <strong>{formatCurrency(cashAgreedTotal, localCurrency)}</strong>
                </div>
                <div className="breakdown-row">
                  <span>Gastado en efectivo ({cashExpensesCount} compras):</span>
                  <strong className="text-red">-{formatCurrency(totalCashARS, localCurrency)}</strong>
                </div>
                {cashPendingDelivery > 0 && (
                  <div className="breakdown-row">
                    <span>Remanente por recibir:</span>
                    <strong className="text-amber">{formatCurrency(cashPendingDelivery, localCurrency)}</strong>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="breakdown-row">
                  <span>Compras pagadas en billetes:</span>
                  <strong>{cashExpensesCount} transacciones</strong>
                </div>
                <div className="breakdown-row">
                  <span>Total efectivo gastado:</span>
                  <strong className="text-emerald">{formatCurrency(totalCashARS, localCurrency)}</strong>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Card 2: Pagos con Tarjeta */}
        <div className="liquidity-card card-card">
          <div className="liquidity-card-header">
            <span className="liquidity-badge-title card">
              <CreditCard size={16} /> 💳 Pagos con Tarjeta ({localFlag} {localCurrency})
            </span>
            <span className="liquidity-pct-chip card">
              {cardExpensesCount} transacciones
            </span>
          </div>

          <div className="liquidity-amount-row">
            <h3 className="liquidity-ars">{formatCurrency(totalTarjetaARS, localCurrency)}</h3>
            <span className="liquidity-usd">≈ {baseFlag} ${Math.round(totalTarjetaARS / safeRate)} {baseCurrency}</span>
          </div>

          <p className="liquidity-subtitle">
            Total facturado en tu tarjeta de crédito o débito durante el viaje.
          </p>

          <div className="liquidity-breakdown">
            <div className="breakdown-row">
              <span>Registros con tarjeta:</span>
              <strong>{cardExpensesCount} gastos ({formatCurrency(totalTarjetaARS, localCurrency)})</strong>
            </div>
            <div className="breakdown-row">
              <span>Impacto en presupuesto global:</span>
              <strong className="text-indigo">{((totalTarjetaARS / (safeRate * budgetCapUsd)) * 100).toFixed(1)}% del total</strong>
            </div>
          </div>
        </div>
      </div>

      {/* SWITCH DE CONTROL DE PAGO: GENERAL / EFECTIVO / TARJETA */}
      <div className="payment-filter-banner">
        <div className="payment-filter-banner-content">
          <div className="payment-filter-title-group">
            <span className="filter-super-label">Filtro de Gastos por Medio de Pago</span>
            <h4 className="filter-main-heading">
              {paymentFilter === 'all' && `Vista General: ${formatCurrency(totalARS, localCurrency)} (Todos los gastos)`}
              {paymentFilter === 'efectivo' && `Solo Pagos en Efectivo: ${formatCurrency(totalCashARS, localCurrency)} (${cashExpensesCount} gastos)`}
              {paymentFilter === 'tarjeta' && `Solo Pagos con Tarjeta: ${formatCurrency(totalTarjetaARS, localCurrency)} (${cardExpensesCount} gastos)`}
            </h4>
          </div>

          <div className="payment-filter-switch">
            <button
              type="button"
              onClick={() => setPaymentFilter('all')}
              className={`btn-payment-filter ${paymentFilter === 'all' ? 'active-all' : ''}`}
            >
              🌐 General ({mergedExpenses.length})
            </button>
            <button
              type="button"
              onClick={() => setPaymentFilter('efectivo')}
              className={`btn-payment-filter ${paymentFilter === 'efectivo' ? 'active-cash' : ''}`}
            >
              💵 Efectivo ({formatCurrency(totalCashARS, localCurrency)})
            </button>
            <button
              type="button"
              onClick={() => setPaymentFilter('tarjeta')}
              className={`btn-payment-filter ${paymentFilter === 'tarjeta' ? 'active-card' : ''}`}
            >
              💳 Tarjeta ({formatCurrency(totalTarjetaARS, localCurrency)})
            </button>
          </div>
        </div>
      </div>

      {/* KPI CARDS WITH SHORTCUTS TO SECTIONS */}
      <div className="budget-kpis-grid">
        <div className="kpi-card total-card">
          <div className="kpi-header">
            <span className="kpi-label">Gasto Total Facturado</span>
            <TrendingUp size={18} className="kpi-icon" />
          </div>
          <div className="kpi-dual-values">
            <div className="kpi-ars-highlight">{formatCurrency(totalARS, localCurrency)}</div>
            <div className="kpi-usd-sub">≈ {baseFlag} ${totalUSD.toFixed(1)} {baseCurrency}</div>
          </div>
        </div>

        <div className="kpi-card compras-card interactive-link" onClick={() => setActiveSubTab('compras')} role="button" tabIndex={0} title="Abrir sección de Compras & Outlets">
          <div className="kpi-header">
            <span className="kpi-label">Compras & Outlets</span>
            <ShoppingBag size={18} className="kpi-icon text-purple" />
          </div>
          <div className="kpi-dual-values">
            <div className="kpi-ars-highlight">{formatCurrency(comprasTotalARS, localCurrency)}</div>
            <div className="kpi-usd-sub">≈ {baseFlag} ${(comprasTotalARS / safeRate).toFixed(1)} {baseCurrency}</div>
          </div>
          <div className="kpi-quick-nav-pill"><span>🛍️ Ver Compras →</span></div>
        </div>

        <div className="kpi-card mercado-card interactive-link" onClick={() => setActiveSubTab('mercado')} role="button" tabIndex={0} title="Abrir sección de Mercado con Calculadora y Escáner">
          <div className="kpi-header">
            <span className="kpi-label">Mercado para Casa</span>
            <ShoppingCart size={18} className="kpi-icon" />
          </div>
          <div className="kpi-dual-values">
            <div className="kpi-ars-highlight">{formatCurrency(mercadoTotalARS, localCurrency)}</div>
            <div className="kpi-usd-sub">≈ {baseFlag} ${(mercadoTotalARS / safeRate).toFixed(1)} {baseCurrency}</div>
          </div>
          <div className="kpi-quick-nav-pill"><span>🛒 Calculadora & Escáner →</span></div>
        </div>

        <div className="kpi-card gastronomia-card interactive-link" onClick={() => setActiveSubTab('gastronomia')} role="button" tabIndex={0} title="Abrir sección de Restaurantes & Bares">
          <div className="kpi-header">
            <span className="kpi-label">Restaurantes & Bares</span>
            <Utensils size={18} className="kpi-icon text-amber" />
          </div>
          <div className="kpi-dual-values">
            <div className="kpi-ars-highlight">{formatCurrency(gastronomiaTotalARS, localCurrency)}</div>
            <div className="kpi-usd-sub">≈ {baseFlag} ${(gastronomiaTotalARS / safeRate).toFixed(1)} {baseCurrency}</div>
          </div>
          <div className="kpi-quick-nav-pill"><span>🍽️ Ver Bares & Restos →</span></div>
        </div>

        <div className="kpi-card regalos-card interactive-link" onClick={() => setActiveSubTab('regalos')} role="button" tabIndex={0} title="Abrir sección de Regalos del Viaje">
          <div className="kpi-header">
            <span className="kpi-label">Regalos & Recuerdos</span>
            <Gift size={18} className="kpi-icon text-rose" />
          </div>
          <div className="kpi-dual-values">
            <div className="kpi-ars-highlight">{formatCurrency(regalosTotalARS, localCurrency)}</div>
            <div className="kpi-usd-sub">≈ {baseFlag} ${(regalosTotalARS / safeRate).toFixed(1)} {baseCurrency}</div>
          </div>
          <div className="kpi-quick-nav-pill"><span>🎁 Ver Regalos →</span></div>
        </div>

        <div className="kpi-card transport-card interactive-link" onClick={() => setActiveSubTab('transporte')} role="button" tabIndex={0} title="Abrir sección de Transporte">
          <div className="kpi-header">
            <span className="kpi-label">Transporte Local</span>
            <Bus size={18} className="kpi-icon text-sky" />
          </div>
          <div className="kpi-dual-values">
            <div className="kpi-ars-highlight">{formatCurrency(transporteTotalARS, localCurrency)}</div>
            <div className="kpi-usd-sub">≈ {baseFlag} ${(transporteTotalARS / safeRate).toFixed(1)} {baseCurrency}</div>
          </div>
          <div className="kpi-quick-nav-pill"><span>🚇 Ver Transporte →</span></div>
        </div>
      </div>
    </>
  );
}
