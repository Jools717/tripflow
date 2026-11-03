import React, { useState } from 'react';
import { Receipt, Check } from 'lucide-react';
import { ExpenseCategory } from '../../types/category';
import { PaymentMethod } from '../../types/expense';
import { parseCurrencyNumber } from '../../utils/helpers';

interface ManualExpenseFormProps {
  category: ExpenseCategory;
  exchangeRate: number;
  onApprove: (data: {
    finalARS: number;
    concept: string;
    note: string;
    paymentMethod: PaymentMethod;
    date: string;
  }) => void;
}

export default function ManualExpenseForm({
  category,
  exchangeRate,
  onApprove
}: ManualExpenseFormProps) {
  const [manualConcept, setManualConcept] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualCurrency, setManualCurrency] = useState<'ARS' | 'USD'>('ARS');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [manualNote, setManualNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = parseCurrencyNumber(manualAmount) || 0;
    if (raw <= 0 || !manualConcept.trim()) {
      alert('Ingresa un concepto y un monto válido');
      return;
    }

    const finalARS = manualCurrency === 'ARS' ? raw : Math.round(raw * exchangeRate);

    onApprove({
      finalARS,
      concept: manualConcept.trim(),
      note: manualNote.trim() || 'Ingreso directo',
      paymentMethod,
      date: purchaseDate
    });

    setManualConcept('');
    setManualAmount('');
    setManualNote('');
  };

  return (
    <div className="calculator-box-card">
      <div className="calc-card-header">
        <div className="calc-header-title">
          <Receipt size={20} className="text-emerald" />
          <h4>Ingreso Directo de Ticket</h4>
        </div>
        <span className="calc-helper-tag">Ingresa la cifra final de tu ticket de compra</span>
      </div>

      <form onSubmit={handleSubmit} className="manual-grocery-form">
        <div className="form-group">
          <label>Comercio / Concepto *</label>
          <input
            type="text"
            placeholder={`Ej: Compra ${category.name}...`}
            value={manualConcept}
            onChange={(e) => setManualConcept(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <div className="currency-selector-label-row">
            <label>Monto del Gasto *</label>
            <div className="currency-toggle-chips">
              <button
                type="button"
                className={`curr-btn ${manualCurrency === 'ARS' ? 'active' : ''}`}
                onClick={() => setManualCurrency('ARS')}
              >
                En Pesos (ARS)
              </button>
              <button
                type="button"
                className={`curr-btn ${manualCurrency === 'USD' ? 'active' : ''}`}
                onClick={() => setManualCurrency('USD')}
              >
                En Dólares (USD Blue)
              </button>
            </div>
          </div>

          <div className="currency-input-wrapper">
            <span className="curr-symbol">{manualCurrency === 'ARS' ? '$ ARS' : '$ USD'}</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder={manualCurrency === 'ARS' ? 'Ej: 19.741' : 'Ej: 15'}
              value={manualAmount}
              onChange={(e) => setManualAmount(e.target.value)}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Método de Pago</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
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

          <div className="form-group">
            <label>Fecha</label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Nota (Opcional)</label>
          <input
            type="text"
            placeholder="Ej: Pagado en efectivo"
            value={manualNote}
            onChange={(e) => setManualNote(e.target.value)}
            className="form-input"
          />
        </div>

        <button type="submit" className="btn-approve-grocery ready">
          <Check size={18} />
          <span>Aprobar e Incluir en Billetera</span>
        </button>
      </form>
    </div>
  );
}

