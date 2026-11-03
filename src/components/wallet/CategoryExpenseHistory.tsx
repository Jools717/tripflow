import React, { useState } from 'react';
import { Receipt, Camera, Edit3, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { ExpenseCategory } from '../../types/category';
import { formatCurrencyARS, getExpensePaymentMethod } from '../../utils/helpers';
import { renderCategoryIcon } from './categoryPresets';
import { WalletExpenseItem } from './ExpenseRow';

interface CategoryExpenseHistoryProps {
  category: ExpenseCategory;
  categoryExpenses: WalletExpenseItem[];
  allCategoryExpenses: WalletExpenseItem[];
  totalCatARS: number;
  totalCatUSD: number;
  totalCatCashARS: number;
  totalCatCardARS: number;
  paymentFilter: 'all' | 'efectivo' | 'tarjeta';
  setPaymentFilter: (filter: 'all' | 'efectivo' | 'tarjeta') => void;
  safeRate: number;
  onEditExpense?: (exp: WalletExpenseItem) => void;
  onDeleteExpense: (id: string, exp: WalletExpenseItem) => void;
  onViewReceipt: (exp: WalletExpenseItem) => void;
}

export default function CategoryExpenseHistory({
  category,
  categoryExpenses,
  allCategoryExpenses,
  totalCatARS,
  totalCatUSD,
  totalCatCashARS,
  totalCatCardARS,
  paymentFilter,
  setPaymentFilter,
  safeRate,
  onEditExpense,
  onDeleteExpense,
  onViewReceipt
}: CategoryExpenseHistoryProps) {
  const [expandedExpenses, setExpandedExpenses] = useState<Record<string, boolean>>({});

  const toggleExpandExpense = (id: string) => {
    setExpandedExpenses(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="dynamic-history-col">
      <div className="grocery-history-card">
        <div className="history-card-header">
          <div>
            <h4>Historial de {category.name}</h4>
            <span className="history-subtitle">
              {categoryExpenses.length} de {allCategoryExpenses.length} productos / gastos
            </span>
          </div>

          <div className="history-total-badge">
            <span className="badge-ars">{formatCurrencyARS(totalCatARS)}</span>
            <span className="badge-usd">≈ ${totalCatUSD.toFixed(1)} USD Blue</span>
          </div>
        </div>

        {/* Switch de Pago: General / Solo Efectivo / Solo Tarjeta */}
        <div className="category-payment-filter-bar">
          <span className="cat-filter-label">Filtrar por:</span>
          <div className="category-payment-filter-buttons">
            <button
              type="button"
              onClick={() => setPaymentFilter('all')}
              className={`btn-cat-filter ${paymentFilter === 'all' ? 'active-all' : ''}`}
            >
              🌐 General ({allCategoryExpenses.length})
            </button>
            <button
              type="button"
              onClick={() => setPaymentFilter('efectivo')}
              className={`btn-cat-filter ${paymentFilter === 'efectivo' ? 'active-cash' : ''}`}
            >
              💵 Efectivo ({formatCurrencyARS(totalCatCashARS)})
            </button>
            <button
              type="button"
              onClick={() => setPaymentFilter('tarjeta')}
              className={`btn-cat-filter ${paymentFilter === 'tarjeta' ? 'active-card' : ''}`}
            >
              💳 Tarjeta ({formatCurrencyARS(totalCatCardARS)})
            </button>
          </div>
        </div>

        {/* List */}
        <div className="grocery-expenses-list">
          {categoryExpenses.length === 0 ? (
            <div className="empty-grocery-state">
              <Receipt size={38} className="text-muted" />
              <h5>No hay gastos registrados en {category.name}</h5>
              <p>
                Usa la calculadora o toma foto a tu primer ticket con el escáner para sumarlo a la billetera.
              </p>
            </div>
          ) : (
            categoryExpenses.map(exp => {
              const expUSD = (Number(exp.amountARS) || 0) / safeRate;
              const hasReceipt = Boolean(exp.receipt_id);
              const isCard = getExpensePaymentMethod(exp) === 'tarjeta';

              return (
                <div key={exp.id} className="grocery-expense-item">
                  <div className="expense-cart-icon" style={{ backgroundColor: `${category.color}20`, color: category.color }}>
                    {renderCategoryIcon(category.icon || category.id, 16)}
                  </div>

                  <div className="expense-main-info">
                    <div className="expense-concept-row">
                      <span className="concept-title">{exp.concept}</span>
                      {exp.isFromItinerary ? (
                        <span className="itinerary-source-pill">
                          📅 Día {exp.dayNumber} · Itinerario
                        </span>
                      ) : (
                        <span className="paid-by-pill" style={{
                          background: isCard ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: isCard ? '#3b82f6' : '#10b981',
                          fontWeight: 700,
                          borderRadius: '12px',
                          padding: '2px 8px',
                          fontSize: '0.74rem'
                        }}>
                          {isCard ? '💳 Tarjeta' : '💵 Efectivo'}
                        </span>
                      )}

                      {hasReceipt && (
                        <button
                          type="button"
                          onClick={() => onViewReceipt(exp)}
                          className="btn-view-receipt-pill"
                          title="Ver foto del ticket y transcripción"
                        >
                          <Camera size={12} />
                          <span>Foto Comprobante</span>
                        </button>
                      )}
                    </div>

                    <div className="expense-meta-row">
                      <span className="meta-date">{exp.date}</span>
                      {exp.note && <span className="meta-note">• {exp.note}</span>}
                    </div>

                    {exp.items && exp.items.length > 0 && (
                      <div className="expense-items-preview-block">
                        <button
                          type="button"
                          className="btn-toggle-items-preview"
                          onClick={() => toggleExpandExpense(exp.id)}
                          title="Ver desglose de productos"
                        >
                          <span>🛍️ {exp.items.length} productos incluidos</span>
                          <span className="toggle-chevron">
                            {expandedExpenses[exp.id] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </span>
                        </button>
                        {expandedExpenses[exp.id] && (
                          <div className="expense-items-expanded-table">
                            {exp.items.map((prod, pIdx) => (
                              <div key={pIdx} className="expanded-item-row">
                                <span className="item-prod-name">• {prod.name}</span>
                                <span className="item-prod-price">{formatCurrencyARS(prod.price)}</span>
                              </div>
                            ))}
                            <div className="expanded-item-total-row">
                              <span>Total compra:</span>
                              <strong>{formatCurrencyARS(exp.amountARS)}</strong>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="expense-amounts-box">
                    <span className="amount-ars">{formatCurrencyARS(exp.amountARS)}</span>
                    <span className="amount-usd">≈ ${expUSD.toFixed(1)} <small>USD Blue</small></span>
                  </div>

                  <div className="grocery-item-actions">
                    {onEditExpense && (
                      <button
                        type="button"
                        onClick={() => onEditExpense(exp)}
                        className="btn-edit-grocery"
                        title="Editar precio y sincronizar"
                      >
                        <Edit3 size={15} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (exp.isFromItinerary) {
                          if (window.confirm(`¿Quitar el costo estimado de "${exp.concept}"? Se pondrá en $0 en la tarjeta del itinerario.`)) {
                            onDeleteExpense(exp.id, exp);
                          }
                        } else if (window.confirm(`¿Eliminar gasto "${exp.concept}" de ${formatCurrencyARS(exp.amountARS)}? Se restará de la billetera.`)) {
                          onDeleteExpense(exp.id, exp);
                        }
                      }}
                      className="btn-trash-grocery"
                      title={exp.isFromItinerary ? 'Poner costo en $0 en la tarjeta del itinerario' : 'Eliminar gasto'}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {categoryExpenses.length > 0 && (
          <div className="history-footer-summary">
            <span>Total en {category.name}:</span>
            <div className="footer-dual-totals">
              <strong>{formatCurrencyARS(totalCatARS)}</strong>
              <span>(≈ ${totalCatUSD.toFixed(1)} USD Blue)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

