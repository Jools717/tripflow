import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Expense, PaymentMethod } from '../../types/expense';
import { ExpenseCategory } from '../../types/category';
import { formatCurrency, parseCurrencyNumber, getCurrencyFlag, getCurrencySymbol } from '../../utils/helpers';

interface AddExpenseFormProps {
  categories: ExpenseCategory[];
  mergedExpenses: Expense[];
  totalARS: number;
  safeRate: number;
  onAddExpense: (expense: Expense) => void;
  localCurrency?: string;
  baseCurrency?: string;
  countryCode?: string;
}

export default function AddExpenseForm({
  categories,
  safeRate,
  onAddExpense,
  localCurrency = 'ARS',
  baseCurrency = 'USD',
  countryCode = 'AR'
}: AddExpenseFormProps) {
  const localFlag = getCurrencyFlag(localCurrency, countryCode);
  const baseFlag = getCurrencyFlag(baseCurrency, baseCurrency === 'USD' ? 'US' : undefined);
  const localSymbol = getCurrencySymbol(localCurrency);

  const [newConcept, setNewConcept] = useState('');
  const [newCategory, setNewCategory] = useState('mercado');
  const [newPaymentMethod, setNewPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [currencyMode, setCurrencyMode] = useState<'LOCAL' | 'BASE'>('LOCAL');
  const [rawAmount, setRawAmount] = useState('');
  const [newNote, setNewNote] = useState('');

  const parsedRawAmount = parseCurrencyNumber(rawAmount);
  const computedLocal = currencyMode === 'LOCAL' ? parsedRawAmount : Math.round(parsedRawAmount * safeRate);
  const computedBase = currencyMode === 'BASE' ? parsedRawAmount : (safeRate > 0 ? parsedRawAmount / safeRate : 0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConcept.trim() || !rawAmount || computedLocal <= 0) {
      alert('Ingresa el concepto y un monto válido');
      return;
    }

    const expenseItem: Expense = {
      id: 'exp-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      concept: newConcept.trim(),
      category: newCategory,
      amountARS: Math.round(computedLocal),
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
          <h4>Registrar Nuevo Gasto ({localFlag} {localCurrency})</h4>
        </div>

        <form onSubmit={handleAddSubmit} className="add-expense-form">
          <div className="form-group">
            <label>Concepto del Gasto *</label>
            <input
              type="text"
              placeholder="Ej: Almuerzo, transporte, souvenir..."
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
                  className={`curr-btn ${currencyMode === 'LOCAL' ? 'active' : ''}`}
                  onClick={() => setCurrencyMode('LOCAL')}
                >
                  {localFlag} En {localCurrency}
                </button>
                <button
                  type="button"
                  className={`curr-btn ${currencyMode === 'BASE' ? 'active' : ''}`}
                  onClick={() => setCurrencyMode('BASE')}
                >
                  {baseFlag} En {baseCurrency}
                </button>
              </div>
            </div>

            <div className="currency-input-wrapper">
              <span className="curr-symbol">
                {currencyMode === 'LOCAL' ? `${localFlag} ${localSymbol}` : `${baseFlag} $`}
              </span>
              <input
                type="text"
                inputMode="decimal"
                placeholder={currencyMode === 'LOCAL' ? `Monto en ${localCurrency}` : `Monto en ${baseCurrency}`}
                value={rawAmount}
                onChange={(e) => setRawAmount(e.target.value)}
                className="form-input"
                required
              />
            </div>

            {rawAmount && (
              <div className="conversion-preview-box">
                <span>Equivalente simultáneo:</span>
                <strong>{localFlag} {formatCurrency(computedLocal, localCurrency)}</strong>
                <span>=</span>
                <strong>{baseFlag} {formatCurrency(computedBase, baseCurrency)}</strong>
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
              <label>Medio de Pago</label>
              <select
                value={newPaymentMethod}
                onChange={(e) => setNewPaymentMethod(e.target.value as PaymentMethod)}
                className="form-select"
              >
                <option value="efectivo">💵 Efectivo Físico</option>
                <option value="tarjeta">💳 Tarjeta Débito / Crédito</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Nota o Detalle (Opcional)</label>
            <input
              type="text"
              placeholder="Detalle o lugar de compra..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="form-input"
            />
          </div>

          <button type="submit" className="btn-primary btn-submit-expense">
            <Plus size={18} />
            <span>Guardar Gasto ({localFlag} {localCurrency})</span>
          </button>
        </form>
      </div>
    </div>
  );
}
