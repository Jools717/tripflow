import React, { useState } from 'react';
import { Calculator, Camera, Receipt, Check } from 'lucide-react';
import { ExpenseCategory } from '../../types/category';
import { Expense, MediaReceipt, PaymentMethod } from '../../types/expense';
import { formatCurrencyARS, getExpensePaymentMethod } from '../../utils/helpers';
import CategorySectionHero from './CategorySectionHero';
import CategoryCalculator from './CategoryCalculator';
import ManualExpenseForm from './ManualExpenseForm';
import CategoryExpenseHistory from './CategoryExpenseHistory';
import ReceiptScanner from '../scanner/ReceiptScanner';
import { WalletExpenseItem } from './ExpenseRow';

interface DynamicExpenseSectionProps {
  category: ExpenseCategory;
  expenses?: WalletExpenseItem[];
  onAddExpense: (expense: Expense, mediaItem?: MediaReceipt) => void;
  onDeleteExpense: (id: string, exp: WalletExpenseItem) => void;
  onEditExpense?: (exp: WalletExpenseItem) => void;
  exchangeRate?: number;
  onViewReceipt: (exp: WalletExpenseItem) => void;
}

export default function DynamicExpenseSection({
  category,
  expenses = [],
  onAddExpense,
  onDeleteExpense,
  onEditExpense,
  exchangeRate = 1540,
  onViewReceipt
}: DynamicExpenseSectionProps) {
  const BUDGET_CAP_USD = 1000;
  const safeRate = (Number(exchangeRate) && Number(exchangeRate) >= 100) ? Number(exchangeRate) : 1540;

  const [activeTool, setActiveTool] = useState<'calculator' | 'scanner' | 'manual'>('calculator');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'efectivo' | 'tarjeta'>('all');
  const [showToast, setShowToast] = useState(false);
  const [lastSaved, setLastSaved] = useState<Expense | null>(null);

  // Category totals
  const allCategoryExpenses = expenses.filter(e => e.category === category.id);
  const totalCatARS = allCategoryExpenses.reduce((sum, e) => sum + (Number(e.amountARS) || 0), 0);
  const totalCatUSD = totalCatARS / safeRate;

  const totalCatCashARS = allCategoryExpenses
    .filter(e => getExpensePaymentMethod(e) === 'efectivo')
    .reduce((sum, e) => sum + (Number(e.amountARS) || 0), 0);

  const totalCatCardARS = allCategoryExpenses
    .filter(e => getExpensePaymentMethod(e) === 'tarjeta')
    .reduce((sum, e) => sum + (Number(e.amountARS) || 0), 0);

  const categoryExpenses = allCategoryExpenses.filter(e => {
    if (paymentFilter === 'efectivo') return getExpensePaymentMethod(e) === 'efectivo';
    if (paymentFilter === 'tarjeta') return getExpensePaymentMethod(e) === 'tarjeta';
    return true;
  });

  // Global wallet totals
  const totalAllARS = expenses.reduce((sum, e) => sum + (Number(e.amountARS) || 0), 0);
  const totalAllUSD = totalAllARS / safeRate;
  const remainingUSD = Math.max(0, BUDGET_CAP_USD - totalAllUSD);

  const handleApproveCalculator = (data: {
    finalAmount: number;
    concept: string;
    note: string;
    paymentMethod: PaymentMethod;
    date: string;
    items: { name: string; price: number; currency: string }[];
  }) => {
    const newExpense: Expense = {
      id: 'exp-' + Date.now(),
      date: data.date,
      concept: data.concept,
      category: category.id,
      amountARS: data.finalAmount,
      paymentMethod: data.paymentMethod,
      paidBy: data.paymentMethod === 'tarjeta' ? 'Tarjeta' : 'Efectivo',
      note: data.note,
      type: data.items.length > 0 ? 'compras' : 'plan',
      items: data.items.map((i, idx) => ({ id: `it-${Date.now()}-${idx}`, name: i.name, price: i.price }))
    };

    onAddExpense(newExpense);
    setLastSaved(newExpense);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4500);
  };

  const handleApproveManual = (data: {
    finalARS: number;
    concept: string;
    note: string;
    paymentMethod: PaymentMethod;
    date: string;
  }) => {
    const newExpense: Expense = {
      id: 'exp-' + Date.now(),
      date: data.date,
      concept: data.concept,
      category: category.id,
      amountARS: data.finalARS,
      paymentMethod: data.paymentMethod,
      paidBy: data.paymentMethod === 'tarjeta' ? 'Tarjeta' : 'Efectivo',
      note: data.note
    };

    onAddExpense(newExpense);
    setLastSaved(newExpense);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4500);
  };

  const handleSaveScannedReceipt = (expenseItem: Expense, mediaItem?: MediaReceipt) => {
    onAddExpense(expenseItem, mediaItem);
    setLastSaved(expenseItem);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4500);
  };

  return (
    <div className="dynamic-section-view">
      <CategorySectionHero
        category={category}
        totalCatUSD={totalCatUSD}
        totalCatARS={totalCatARS}
        recordsCount={categoryExpenses.length}
        remainingUSD={remainingUSD}
      />

      {showToast && lastSaved && (
        <div className="grocery-success-toast animate-slide-in">
          <div className="toast-icon-check">
            <Check size={20} />
          </div>
          <div className="toast-text">
            <strong>¡Gasto aprobado e incluido en la Billetera!</strong>
            <span>
              {lastSaved.concept}: <strong>{formatCurrencyARS(lastSaved.amountARS)}</strong>
              {' '}(≈ ${(lastSaved.amountARS / safeRate).toFixed(1)} USD Blue)
            </span>
          </div>
        </div>
      )}

      {/* Internal Sub-Tools Bar: Calculator vs Scanner vs Manual */}
      <div className="section-tools-tab-bar">
        <button
          type="button"
          className={`tool-tab-btn ${activeTool === 'calculator' ? 'active' : ''}`}
          onClick={() => setActiveTool('calculator')}
        >
          <Calculator size={17} />
          <span className="tab-btn-text-full">Calculadora de Gastos</span>
          <span className="tab-btn-text-mobile">Calculadora</span>
        </button>

        <button
          type="button"
          className={`tool-tab-btn ${activeTool === 'scanner' ? 'active' : ''}`}
          onClick={() => setActiveTool('scanner')}
        >
          <Camera size={17} />
          <span className="tab-btn-text-full">Escáner de Facturas (Foto & OCR)</span>
          <span className="tab-btn-text-mobile">Escáner</span>
        </button>

        <button
          type="button"
          className={`tool-tab-btn ${activeTool === 'manual' ? 'active' : ''}`}
          onClick={() => setActiveTool('manual')}
        >
          <Receipt size={17} />
          <span className="tab-btn-text-full">Ingreso Directo de Ticket</span>
          <span className="tab-btn-text-mobile">Directo</span>
        </button>
      </div>

      <div className="dynamic-workspace-layout">
        <div className="dynamic-tool-col">
          {activeTool === 'calculator' && (
            <CategoryCalculator
              category={category}
              safeRate={safeRate}
              budgetCapUsd={BUDGET_CAP_USD}
              onApprove={handleApproveCalculator}
            />
          )}

          {activeTool === 'scanner' && (
            <ReceiptScanner
              defaultCategory={category.id}
              categoryName={category.name}
              exchangeRate={safeRate}
              onSaveExpenseWithReceipt={handleSaveScannedReceipt}
            />
          )}

          {activeTool === 'manual' && (
            <ManualExpenseForm
              category={category}
              exchangeRate={safeRate}
              onApprove={handleApproveManual}
            />
          )}
        </div>

        <CategoryExpenseHistory
          category={category}
          categoryExpenses={categoryExpenses}
          allCategoryExpenses={allCategoryExpenses}
          totalCatARS={totalCatARS}
          totalCatUSD={totalCatUSD}
          totalCatCashARS={totalCatCashARS}
          totalCatCardARS={totalCatCardARS}
          paymentFilter={paymentFilter}
          setPaymentFilter={setPaymentFilter}
          safeRate={safeRate}
          onEditExpense={onEditExpense}
          onDeleteExpense={onDeleteExpense}
          onViewReceipt={onViewReceipt}
        />
      </div>
    </div>
  );
}
