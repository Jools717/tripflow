import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Expense, PaymentMethod } from '../../types/expense';
import { ExpenseCategory } from '../../types/category';
import { formatCurrencyARS, convertUsdToArs, parseCurrencyNumber } from '../../utils/helpers';

interface AddExpenseFormProps {
  categories: ExpenseCategory[];
  mergedExpenses: Expense[];
  totalARS: number;
  safeRate: number;
  onAddExpense: (expense: Expense) => void;
}

export default function AddExpenseForm({
  categories,
  mergedExpenses,
  totalARS,
  safeRate,
  onAddExpense
}: AddExpenseFormProps) {
  const [newConcept, setNewConcept] = useState('');
  const [newCategory, setNewCategory] = useState('mercado');
  const [newPaymentMethod, setNewPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [inputCurrency, setInputCurrency] = useState<'ARS' | 'USD'>('ARS');
  const [rawAmount, setRawAmount] = useState('');
  const [newNote, setNewNote] = useState('');

  const parsedRawAmount = parseCurrencyNumber(rawAmount);
  const computedARS = inputCurrency === 'ARS' ? parsedRawAmount : convertUsdToArs(parsedRawAmount, safeRate);
  const computedUSD = inputCurrency === 'USD' ? parsedRawAmount : parsedRawAmount / safeRate;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConcept.trim() || !rawAmount || computedARS <= 0) {
      alert('Ingresa el concepto y un monto válido');
      return;
    }

    const expenseItem: Expense = {
      id: 'exp-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      concept: newConcept.trim(),
      category: newCategory,
      amountARS: Math.round(computedARS),
      paymentMethod: newPaymentMethod,
      paidBy: newPaymentMethod === 'tarjeta' ? 'Tarjeta' : 'Efectivo',
      note: newNote.trim()
    };

    onAddExpense(expenseItem);
    setNewConcept('');
    setRawAmount('');
    setNewNote('');
  };

  return (
    <div className="budget-form-column">
      <div className="form-card">
        <div className="form-card-title">
          <Plus size={18} />
          <h4>Registrar Nuevo Gasto General</h4>
        </div>

        <form onSubmit={handleAddSubmit} className="add-expense-form">
          <div className="form-group">
            <label>Concepto del Gasto *</label>
            <input
              type="text"
              placeholder="Ej: Almuerzo parrilla, SUBE, entrada museo..."
              value={newConcept}
              onChange={(e) => setNewConcept(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <div className="currency-selector-label-row">
              <label>Monto a Registrar *</label>
              <div className="currency-toggle-chips">
                <button
                  type="button"
                  className={`curr-btn ${inputCurrency === 'ARS' ? 'active' : ''}`}
                  onClick={() => setInputCurrency('ARS')}
                >
                  En Pesos (ARS)
                </button>
                <button
                  type="button"
                  className={`curr-btn ${inputCurrency === 'USD' ? 'active' : ''}`}
                  onClick={() => setInputCurrency('USD')}
                >
                  En Dólares (USD Blue)
                </button>
              </div>
            </div>

            <div className="currency-input-wrapper">
              <span className="curr-symbol">{inputCurrency === 'ARS' ? '$ ARS' : '$ USD'}</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder={inputCurrency === 'ARS' ? 'Ej: 19.741' : 'Ej: 15'}
                value={rawAmount}
                onChange={(e) => setRawAmount(e.target.value)}
                className="form-input"
                required
              />
            </div>

            {rawAmount && (
              <div className="conversion-preview-box">
                <span>Equivalente simultáneo:</span>
                <strong>{formatCurrencyARS(computedARS)} ARS</strong>
                <span>=</span>
                <strong>${computedUSD.toFixed(1)} USD Blue</strong>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Categoría</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="form-select"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Método de Pago</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setNewPaymentMethod('efectivo')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: newPaymentMethod === 'efectivo' ? '2px solid #10b981' : '1px solid var(--border-color, #e2e8f0)',
                    background: newPaymentMethod === 'efectivo' ? 'rgba(16, 185, 129, 0.14)' : 'transparent',
                    color: newPaymentMethod === 'efectivo' ? '#10b981' : 'inherit',
                    fontWeight: newPaymentMethod === 'efectivo' ? '700' : '500',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>💵</span>
                  <span>Efectivo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewPaymentMethod('tarjeta')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: newPaymentMethod === 'tarjeta' ? '2px solid #3b82f6' : '1px solid var(--border-color, #e2e8f0)',
                    background: newPaymentMethod === 'tarjeta' ? 'rgba(59, 130, 246, 0.14)' : 'transparent',
                    color: newPaymentMethod === 'tarjeta' ? '#3b82f6' : 'inherit',
                    fontWeight: newPaymentMethod === 'tarjeta' ? '700' : '500',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>💳</span>
                  <span>Tarjeta</span>
                </button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Nota / Detalle (Opcional)</label>
            <input
              type="text"
              placeholder="Ej: Incluyó propina del 10%"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="form-input"
            />
          </div>

          <button type="submit" className="btn-primary full-width">
            <Plus size={16} />
            <span>Agregar a la Billetera</span>
          </button>
        </form>
      </div>

      {/* Category Breakdown */}
      <div className="category-breakdown-card">
        <h4>Distribución por Categorías</h4>
        <div className="breakdown-list">
          {categories.map(cat => {
            const amount = mergedExpenses
              .filter(e => e.category === cat.id)
              .reduce((sum, e) => sum + (Number(e.amountARS) || 0), 0);
            const pct = totalARS > 0 ? Math.round((amount / totalARS) * 100) : 0;

            return (
              <div key={cat.id} className="breakdown-row">
                <div className="breakdown-info">
                  <span className="cat-color-dot" style={{ backgroundColor: cat.color }}></span>
                  <span className="cat-name">{cat.name}</span>
                  <div className="cat-amounts-dual">
                    <span className="cat-amount-ars">{formatCurrencyARS(amount)}</span>
                    <span className="cat-amount-usd">≈ ${(amount / safeRate).toFixed(1)} USD</span>
                  </div>
                  <span className="cat-pct">{pct}%</span>
                </div>
                <div className="breakdown-bar-track">
                  <div
                    className="breakdown-bar-fill"
                    style={{ width: `${pct}%`, backgroundColor: cat.color }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

