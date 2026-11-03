import React from 'react';
import { Trash2, Camera, Edit3 } from 'lucide-react';
import { Expense } from '../../types/expense';
import { ExpenseCategory } from '../../types/category';
import { formatCurrency, getExpensePaymentMethod, getCurrencyFlag } from '../../utils/helpers';

export interface WalletExpenseItem extends Expense {
  dayNumber?: number;
  completed?: boolean;
}

interface ExpenseRowProps {
  exp: WalletExpenseItem;
  categories: ExpenseCategory[];
  safeRate: number;
  onOpenReceipt: (exp: WalletExpenseItem) => void;
  onEditExpense: (exp: WalletExpenseItem) => void;
  onDeleteExpense: (id: string, exp: WalletExpenseItem) => void;
  onUpdateActivityCost?: (activityId: string, newCost: number) => void;
  localCurrency?: string;
  baseCurrency?: string;
  countryCode?: string;
}

export default function ExpenseRow({
  exp,
  categories,
  safeRate,
  onOpenReceipt,
  onEditExpense,
  onDeleteExpense,
  onUpdateActivityCost,
  localCurrency = 'ARS',
  baseCurrency = 'USD',
  countryCode = 'AR'
}: ExpenseRowProps) {
  const localFlag = getCurrencyFlag(localCurrency, countryCode);
  const baseFlag = getCurrencyFlag(baseCurrency, baseCurrency === 'USD' ? 'US' : undefined);

  const catObj = categories.find(c => c.id === exp.category) || { name: 'Varios', color: '#64748b' };
  const expUSD = (Number(exp.amountARS) || 0) / safeRate;
  const hasReceipt = Boolean(exp.receipt_id);
  const isCard = getExpensePaymentMethod(exp) === 'tarjeta';

  return (
    <div className={`expense-item-row ${exp.isFromItinerary ? 'from-itinerary' : ''}`}>
      <div className="expense-cat-badge" style={{ backgroundColor: `${catObj.color}20`, color: catObj.color }}>
        <span className="cat-dot" style={{ backgroundColor: catObj.color }}></span>
        <span>{catObj.name}</span>
      </div>

      <div className="expense-details">
        <div className="expense-concept-row">
          <span className="expense-concept">{exp.concept}</span>
          {exp.items && exp.items.length > 0 && (
            <span
              className="expense-items-pill-tag"
              title={exp.items.map(i => `• ${i.name}: ${formatCurrency(i.price || 0, localCurrency)}`).join('\n')}
            >
              🛍️ {exp.items.length} {exp.items.length === 1 ? 'artículo' : 'artículos'}
            </span>
          )}
          {exp.isFromItinerary && (
            <span className="itinerary-source-pill">
              📅 Día {exp.dayNumber} · Itinerario
            </span>
          )}
          {exp.isFromItinerary && exp.completed && (
            <span className="itinerary-completed-tag">
              ✓ Realizado
            </span>
          )}
          {hasReceipt && (
            <button
              type="button"
              onClick={() => onOpenReceipt(exp)}
              className="btn-view-receipt-pill"
              title="Ver foto del comprobante escaneado"
            >
              <Camera size={12} />
              <span>Ver Factura</span>
            </button>
          )}
        </div>
        <div className="expense-meta">
          <span>{exp.date}</span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.74rem',
            fontWeight: 700,
            background: isCard ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            color: isCard ? '#3b82f6' : '#10b981'
          }}>
            {isCard ? '💳 Tarjeta' : '💵 Efectivo'}
          </span>
          {exp.note && <span>• {exp.note}</span>}
        </div>
      </div>

      <div className="expense-amount-group">
        <div className="expense-amount-ars-badge">
          {localFlag} {formatCurrency(exp.amountARS, localCurrency)}
        </div>
        <div className="expense-amount-usd-badge">
          ≈ {baseFlag} ${expUSD.toFixed(1)} <small>{baseCurrency}</small>
        </div>
      </div>

      <div className="expense-row-actions">
        <button
          type="button"
          className="btn-edit-expense"
          onClick={() => onEditExpense(exp)}
          title="Editar precio y sincronizar"
        >
          <Edit3 size={14} />
        </button>

        <button
          className="btn-delete-expense"
          onClick={() => {
            if (exp.isFromItinerary) {
              if (window.confirm(`¿Quitar el costo estimado de "${exp.concept}" en el Día ${exp.dayNumber}? Se pondrá en $0 en la tarjeta del itinerario.`)) {
                if (onUpdateActivityCost && exp.activityId) {
                  onUpdateActivityCost(exp.activityId, 0);
                } else {
                  onDeleteExpense(exp.id, exp);
                }
              }
            } else {
              if (window.confirm(`¿Eliminar gasto "${exp.concept}"? Se restará de la billetera.`)) {
                onDeleteExpense(exp.id, exp);
              }
            }
          }}
          title={exp.isFromItinerary ? 'Poner costo en $0 en la tarjeta del itinerario' : 'Eliminar gasto'}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
