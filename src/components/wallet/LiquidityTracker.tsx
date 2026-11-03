import React from 'react';
import {
  ShoppingCart, Utensils, Bus, ShoppingBag, TrendingUp,
  Gift, CreditCard, Banknote
} from 'lucide-react';
import { Expense } from '../../types/expense';
import { formatCurrencyARS, getExpensePaymentMethod } from '../../utils/helpers';
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
}

export default function LiquidityTracker({
  mergedExpenses,
  totalARS,
  totalUSD,
  safeRate,
  budgetCapUsd,
  paymentFilter,
  setPaymentFilter,
  setActiveSubTab
}: LiquidityTrackerProps) {
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
              <Banknote size={16} /> Efectivo en Mano (Bolsillo)
            </span>
            <span className="liquidity-pct-chip cash">
              {cashPercentUsed}% del efectivo gastado
            </span>
          </div>
          <div className="liquidity-amount-row">
            <h3 className="liquidity-ars">{formatCurrencyARS(cashAvailableNow)}</h3>
            <span className="liquidity-usd">≈ ${Math.round(cashAvailableNow / safeRate)} USD Blue</span>
          </div>
          <p className="liquidity-subtitle">
            Saldo real disponible para gastar de los <strong>{formatCurrencyARS(cashReceivedTotal)}</strong> entregados en mano.
          </p>
          <div className="liquidity-breakdown">
            <div className="breakdown-row">
              <span>Total pactado (USD 500 cambiados):</span>
              <strong>{formatCurrencyARS(cashAgreedTotal)}</strong>
            </div>
            <div className="breakdown-row">
              <span>Gastado en efectivo ({cashExpensesCount} compras):</span>
              <strong className="text-red">-{formatCurrencyARS(totalCashARS)}</strong>
            </div>
            {cashPendingDelivery > 0 && (
              <div className="breakdown-row">
                <span>Remanente por recibir:</span>
                <strong className="text-amber">{formatCurrencyARS(cashPendingDelivery)}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Pagos con Tarjeta */}
        <div className="liquidity-card card-card">
          <div className="liquidity-card-header">
            <span className="liquidity-badge-title card">
              <CreditCard size={16} /> Pagos con Tarjeta
            </span>
            <span className="liquidity-pct-chip card">
              {cardExpensesCount} transacciones
            </span>
          </div>
          <div className="liquidity-amount-row">
            <h3 className="liquidity-ars">{formatCurrencyARS(totalTarjetaARS)}</h3>
            <span className="liquidity-usd">≈ ${Math.round(totalTarjetaARS / safeRate)} USD</span>
          </div>
          <p className="liquidity-subtitle">
            Total facturado en tu tarjeta de crédito/débito durante el viaje.
          </p>
          <div className="liquidity-breakdown">
            <div className="breakdown-row">
              <span>Ecoparque, Bellgamba, salidas:</span>
              <strong>{formatCurrencyARS(totalTarjetaARS)}</strong>
            </div>
            <div className="breakdown-row">
              <span>Impacto en tope global de $1.000 USD:</span>
              <strong className="text-indigo">{((totalTarjetaARS / (safeRate * budgetCapUsd)) * 100).toFixed(1)}% del presupuesto</strong>
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
              {paymentFilter === 'all' && `Vista General: ${formatCurrencyARS(totalARS)} (Todos los gastos)`}
              {paymentFilter === 'efectivo' && `Solo Pagos en Efectivo: ${formatCurrencyARS(totalCashARS)} (${cashExpensesCount} gastos)`}
              {paymentFilter === 'tarjeta' && `Solo Pagos con Tarjeta: ${formatCurrencyARS(totalTarjetaARS)} (${cardExpensesCount} gastos)`}
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
              💵 Efectivo ({formatCurrencyARS(totalCashARS)})
            </button>
            <button
              type="button"
              onClick={() => setPaymentFilter('tarjeta')}
              className={`btn-payment-filter ${paymentFilter === 'tarjeta' ? 'active-card' : ''}`}
            >
              💳 Tarjeta ({formatCurrencyARS(totalTarjetaARS)})
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
            <div className="kpi-ars-highlight">{formatCurrencyARS(totalARS)}</div>
            <div className="kpi-usd-sub">≈ ${totalUSD.toFixed(1)} USD Blue</div>
          </div>
        </div>

        <div className="kpi-card compras-card interactive-link" onClick={() => setActiveSubTab('compras')} role="button" tabIndex={0} title="Abrir sección de Compras & Outlets">
          <div className="kpi-header">
            <span className="kpi-label">Compras & Outlets</span>
            <ShoppingBag size={18} className="kpi-icon text-purple" />
          </div>
          <div className="kpi-dual-values">
            <div className="kpi-ars-highlight">{formatCurrencyARS(comprasTotalARS)}</div>
            <div className="kpi-usd-sub">≈ ${(comprasTotalARS / safeRate).toFixed(1)} USD Blue</div>
          </div>
          <div className="kpi-quick-nav-pill"><span>🛍️ Ver Compras →</span></div>
        </div>

        <div className="kpi-card mercado-card interactive-link" onClick={() => setActiveSubTab('mercado')} role="button" tabIndex={0} title="Abrir sección de Mercado con Calculadora y Escáner">
          <div className="kpi-header">
            <span className="kpi-label">Mercado para Casa</span>
            <ShoppingCart size={18} className="kpi-icon" />
          </div>
          <div className="kpi-dual-values">
            <div className="kpi-ars-highlight">{formatCurrencyARS(mercadoTotalARS)}</div>
            <div className="kpi-usd-sub">≈ ${(mercadoTotalARS / safeRate).toFixed(1)} USD Blue</div>
          </div>
          <div className="kpi-quick-nav-pill"><span>🛒 Calculadora & Escáner →</span></div>
        </div>

        <div className="kpi-card gastronomia-card interactive-link" onClick={() => setActiveSubTab('gastronomia')} role="button" tabIndex={0} title="Abrir sección de Restaurantes & Bares">
          <div className="kpi-header">
            <span className="kpi-label">Restaurantes & Bares</span>
            <Utensils size={18} className="kpi-icon text-amber" />
          </div>
          <div className="kpi-dual-values">
            <div className="kpi-ars-highlight">{formatCurrencyARS(gastronomiaTotalARS)}</div>
            <div className="kpi-usd-sub">≈ ${(gastronomiaTotalARS / safeRate).toFixed(1)} USD Blue</div>
          </div>
          <div className="kpi-quick-nav-pill"><span>🍽️ Ver Bares & Restos →</span></div>
        </div>

        <div className="kpi-card regalos-card interactive-link" onClick={() => setActiveSubTab('regalos')} role="button" tabIndex={0} title="Abrir sección de Regalos del Viaje">
          <div className="kpi-header">
            <span className="kpi-label">Regalos & Recuerdos</span>
            <Gift size={18} className="kpi-icon text-rose" />
          </div>
          <div className="kpi-dual-values">
            <div className="kpi-ars-highlight">{formatCurrencyARS(regalosTotalARS)}</div>
            <div className="kpi-usd-sub">≈ ${(regalosTotalARS / safeRate).toFixed(1)} USD Blue</div>
          </div>
          <div className="kpi-quick-nav-pill"><span>🎁 Ver Regalos →</span></div>
        </div>

        <div className="kpi-card transport-card interactive-link" onClick={() => setActiveSubTab('transporte')} role="button" tabIndex={0} title="Abrir sección de Transporte & SUBE">
          <div className="kpi-header">
            <span className="kpi-label">Transporte & SUBE</span>
            <Bus size={18} className="kpi-icon text-sky" />
          </div>
          <div className="kpi-dual-values">
            <div className="kpi-ars-highlight">{formatCurrencyARS(transporteTotalARS)}</div>
            <div className="kpi-usd-sub">≈ ${(transporteTotalARS / safeRate).toFixed(1)} USD Blue</div>
          </div>
          <div className="kpi-quick-nav-pill"><span>🚇 Ver Transporte →</span></div>
        </div>
      </div>
    </>
  );
}

