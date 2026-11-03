import React, { useState } from 'react';
import {
  Calculator, CheckCircle2, Sparkles, Check, Delete, Equal, Wallet
} from 'lucide-react';
import { ExpenseCategory } from '../../types/category';
import { PaymentMethod } from '../../types/expense';
import { formatCurrencyARS } from '../../utils/helpers';
import {
  CATEGORY_PRESETS,
  GENERIC_PRESETS,
  CategoryPresetItem,
  safeEvaluateExpression
} from './categoryPresets';

export interface CartTapeItem {
  id: number;
  name: string;
  price: number;
  icon?: string;
}

interface CategoryCalculatorProps {
  category: ExpenseCategory;
  safeRate: number;
  budgetCapUsd: number;
  onApprove: (data: {
    finalAmount: number;
    concept: string;
    note: string;
    paymentMethod: PaymentMethod;
    date: string;
    items: { name: string; price: number; currency: string }[];
  }) => void;
}

export default function CategoryCalculator({
  category,
  safeRate,
  budgetCapUsd,
  onApprove
}: CategoryCalculatorProps) {
  const [calcExpression, setCalcExpression] = useState('');
  const [cartTape, setCartTape] = useState<CartTapeItem[]>([]);
  const [storeConcept, setStoreConcept] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const computedARS = safeEvaluateExpression(calcExpression);
  const computedUSD = safeRate > 0 ? computedARS / safeRate : 0;
  const presets: CategoryPresetItem[] = CATEGORY_PRESETS[category.id] || GENERIC_PRESETS;

  const handleKeyClick = (val: string) => {
    if (val === 'C') {
      setCalcExpression('');
      return;
    }
    if (val === 'DEL') {
      setCalcExpression(prev => prev.slice(0, -1));
      return;
    }
    if (val === '=') {
      const evaluated = safeEvaluateExpression(calcExpression);
      if (evaluated > 0) setCalcExpression(evaluated.toString());
      return;
    }

    const isOperator = ['+', '-', '×', '÷'].includes(val);
    const lastChar = calcExpression.slice(-1);
    const lastCharIsOperator = ['+', '-', '×', '÷'].includes(lastChar);

    if (isOperator && lastCharIsOperator) {
      setCalcExpression(prev => prev.slice(0, -1) + val);
      return;
    }

    setCalcExpression(prev => prev + val);
  };

  const handleAddPreset = (item: CategoryPresetItem) => {
    const priceStr = item.defaultPrice.toString();
    setCalcExpression(prev => {
      if (!prev || prev === '0') return priceStr;
      const lastChar = prev.slice(-1);
      if (['+', '-', '×', '÷'].includes(lastChar)) return prev + priceStr;
      return `${prev} + ${priceStr}`;
    });

    setCartTape(prev => [
      ...prev,
      { id: Date.now() + Math.random(), name: item.name, price: item.defaultPrice, icon: item.icon }
    ]);
  };

  const handleRemoveTapeItem = (itemToRemove: CartTapeItem) => {
    const updated = cartTape.filter(i => i.id !== itemToRemove.id);
    setCartTape(updated);
    if (updated.length > 0) {
      setCalcExpression(updated.map(i => i.price).join(' + '));
    } else {
      setCalcExpression('');
    }
  };

  const handleClearTape = () => {
    setCartTape([]);
    setCalcExpression('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = Math.round(computedARS);
    if (finalAmount <= 0) {
      alert('Ingresa una operación o monto válido mayor a $0');
      return;
    }

    const itemsSummary = cartTape.length > 0 ? ` [${cartTape.map(i => i.name.split(' ')[0]).join(', ')}]` : '';
    const fullConcept = storeConcept.trim() || `${category.name}`;
    const fullNote = note ? `${note}${itemsSummary}` : (itemsSummary ? `Items:${itemsSummary}` : 'Registro con calculadora');

    const structuredItems = cartTape.map(i => ({
      name: i.name,
      price: i.price,
      currency: 'ARS'
    }));

    onApprove({
      finalAmount,
      concept: fullConcept,
      note: fullNote,
      paymentMethod,
      date: purchaseDate,
      items: structuredItems
    });

    setCalcExpression('');
    setCartTape([]);
    setStoreConcept('');
    setNote('');
  };

  return (
    <div className="calculator-box-card">
      <div className="calc-card-header">
        <div className="calc-header-title">
          <Calculator size={20} className="text-emerald" />
          <h4>Calculadora de {category.name}</h4>
        </div>
        <span className="calc-helper-tag">
          Suma operaciones en pesos y visualiza en USD Blue
        </span>
      </div>

      <div className="calc-screen">
        <div className="calc-formula-line">
          {calcExpression || '0'}
        </div>

        <div className="calc-main-result-row">
          <div className="calc-ars-total">
            <span className="ars-symbol">$</span>
            <span className="ars-value">
              {computedARS > 0 ? Number(computedARS.toFixed(2)).toLocaleString('es-AR') : '0'}
            </span>
            <span className="ars-badge">ARS</span>
          </div>

          <div className="calc-usd-conversion-tag">
            <span>≈ ${computedUSD.toFixed(2)} USD Blue</span>
          </div>
        </div>

        {computedARS > 0 && (
          <div className="calc-budget-impact">
            <Wallet size={12} />
            <span>
              Representa el {((computedUSD / budgetCapUsd) * 100).toFixed(1)}% de tu tope de $1.000 USD
            </span>
          </div>
        )}
      </div>

      <div className="calc-keypad-grid">
        <button type="button" onClick={() => handleKeyClick('C')} className="calc-btn btn-clear">C</button>
        <button type="button" onClick={() => handleKeyClick('DEL')} className="calc-btn btn-del"><Delete size={17} /></button>
        <button type="button" onClick={() => handleKeyClick('(')} className="calc-btn btn-op">(</button>
        <button type="button" onClick={() => handleKeyClick(')')} className="calc-btn btn-op">)</button>

        <button type="button" onClick={() => handleKeyClick('7')} className="calc-btn btn-num">7</button>
        <button type="button" onClick={() => handleKeyClick('8')} className="calc-btn btn-num">8</button>
        <button type="button" onClick={() => handleKeyClick('9')} className="calc-btn btn-num">9</button>
        <button type="button" onClick={() => handleKeyClick('÷')} className="calc-btn btn-op">÷</button>

        <button type="button" onClick={() => handleKeyClick('4')} className="calc-btn btn-num">4</button>
        <button type="button" onClick={() => handleKeyClick('5')} className="calc-btn btn-num">5</button>
        <button type="button" onClick={() => handleKeyClick('6')} className="calc-btn btn-num">6</button>
        <button type="button" onClick={() => handleKeyClick('×')} className="calc-btn btn-op">×</button>

        <button type="button" onClick={() => handleKeyClick('1')} className="calc-btn btn-num">1</button>
        <button type="button" onClick={() => handleKeyClick('2')} className="calc-btn btn-num">2</button>
        <button type="button" onClick={() => handleKeyClick('3')} className="calc-btn btn-num">3</button>
        <button type="button" onClick={() => handleKeyClick('-')} className="calc-btn btn-op">-</button>

        <button type="button" onClick={() => handleKeyClick('0')} className="calc-btn btn-num">0</button>
        <button type="button" onClick={() => handleKeyClick('00')} className="calc-btn btn-num">00</button>
        <button type="button" onClick={() => handleKeyClick('.')} className="calc-btn btn-num">.</button>
        <button type="button" onClick={() => handleKeyClick('+')} className="calc-btn btn-op">+</button>
      </div>

      <div className="calc-equal-row">
        <button type="button" onClick={() => handleKeyClick('=')} className="calc-btn btn-equals">
          <Equal size={18} />
          <span>Calcular Total</span>
        </button>
      </div>

      {presets.length > 0 && (
        <div className="quick-presets-section">
          <div className="quick-presets-label">
            <Sparkles size={14} className="text-amber" />
            <span>Atajos rápidos habituales en BA:</span>
          </div>
          <div className="quick-presets-chips">
            {presets.map((item, idx) => (
              <button
                key={idx}
                type="button"
                className="quick-item-chip"
                onClick={() => handleAddPreset(item)}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
                <span className="item-price">+${(item.defaultPrice / 1000).toFixed(1)}k</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {cartTape.length > 0 && (
        <div className="cart-tape-box">
          <div className="tape-header">
            <span>🛒 Items añadidos ({cartTape.length}):</span>
            <button type="button" onClick={handleClearTape} className="btn-clear-tape">Limpiar</button>
          </div>
          <div className="tape-items-list">
            {cartTape.map(it => (
              <div key={it.id} className="tape-item-row">
                <span>{it.icon} {it.name}</span>
                <strong>{formatCurrencyARS(it.price)}</strong>
                <button
                  type="button"
                  onClick={() => handleRemoveTapeItem(it)}
                  className="btn-remove-tape"
                  title="Quitar item y recalcular total"
                >×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="calc-approval-panel">
        <div className="approval-title-row">
          <CheckCircle2 size={18} className="text-emerald" />
          <h5>Aprobar y Sumar a la Billetera</h5>
        </div>

        <form onSubmit={handleSubmit} className="approval-form-grid">
          <div className="approval-field">
            <label>Lugar / Comercio / Concepto *</label>
            <input
              type="text"
              placeholder={`Ej: Compra en ${category.name}...`}
              value={storeConcept}
              onChange={(e) => setStoreConcept(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="approval-row-two-col">
            <div className="approval-field">
              <label>Método de Pago</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('efectivo')}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: paymentMethod === 'efectivo' ? '2px solid #10b981' : '1px solid var(--border-color, #e2e8f0)',
                    background: paymentMethod === 'efectivo' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    color: paymentMethod === 'efectivo' ? '#10b981' : 'inherit',
                    fontWeight: paymentMethod === 'efectivo' ? '700' : '500',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  💵 Efectivo
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('tarjeta')}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: paymentMethod === 'tarjeta' ? '2px solid #3b82f6' : '1px solid var(--border-color, #e2e8f0)',
                    background: paymentMethod === 'tarjeta' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    color: paymentMethod === 'tarjeta' ? '#3b82f6' : 'inherit',
                    fontWeight: paymentMethod === 'tarjeta' ? '700' : '500',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  💳 Tarjeta
                </button>
              </div>
            </div>

            <div className="approval-field">
              <label>Fecha</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="approval-field">
            <label>Nota / Detalle (Opcional)</label>
            <input
              type="text"
              placeholder="Ej: Para compartir o regalo especial..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={computedARS <= 0}
            className={`btn-approve-grocery ${computedARS > 0 ? 'ready' : 'disabled'}`}
          >
            <Check size={20} />
            <span>
              Aprobar e Incluir en Billetera (
              {computedARS > 0 ? formatCurrencyARS(computedARS) : '$0 ARS'}
              {' '}• ${computedUSD.toFixed(1)} USD Blue)
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}

