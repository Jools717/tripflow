import React, { useState } from 'react';
import { Activity } from '../../types/activity';
import { Expense, MediaReceipt } from '../../types/expense';
import { ExpenseCategory } from '../../types/category';
import {
  parseCurrencyNumber,
  getExpensePaymentMethod,
  isActivityTrackedInExpenses
} from '../../utils/helpers';
import DynamicExpenseSection from './DynamicExpenseSection';
import NewCategoryModal from '../modals/NewCategoryModal';
import ReceiptViewerModal from '../ReceiptViewerModal';
import EditExpenseModal from '../modals/EditExpenseModal';
import CategoryToolbar from './CategoryToolbar';
import WalletHero from './WalletHero';
import LiquidityTracker from './LiquidityTracker';
import AddExpenseForm from './AddExpenseForm';
import ExpenseList from './ExpenseList';
import { WalletExpenseItem } from './ExpenseRow';

interface BudgetTrackerProps {
  expenses?: Expense[];
  activities?: Activity[];
  receipts?: MediaReceipt[];
  categories?: ExpenseCategory[];
  onAddExpense: (expense: Expense, mediaItem?: MediaReceipt) => void;
  onDeleteExpense: (id: string, expItem?: Expense) => void;
  onUpdateActivityCost?: (activityId: string, newCost: number) => void;
  onAddCategory: (newCat: ExpenseCategory) => void;
  onDeleteCategory: (catId: string) => void;
  exchangeRate?: number;
  onUpdateExchangeRate: (rate: number) => void;
  onUpdateExpense?: (updated: Expense) => void;
}

export default function BudgetTracker({
  expenses = [],
  activities = [],
  receipts = [],
  categories = [],
  onAddExpense,
  onDeleteExpense,
  onUpdateActivityCost,
  onAddCategory,
  onDeleteCategory,
  exchangeRate = 1540,
  onUpdateExchangeRate,
  onUpdateExpense
}: BudgetTrackerProps) {
  const BUDGET_CAP_USD = 1000;
  const safeRate = (Number(exchangeRate) && Number(exchangeRate) >= 100) ? Number(exchangeRate) : 1540;

  const [activeSubTab, setActiveSubTab] = useState('general');
  const [editingExpenseItem, setEditingExpenseItem] = useState<WalletExpenseItem | null>(null);
  const [isNewCatModalOpen, setIsNewCatModalOpen] = useState(false);
  const [selectedReceiptData, setSelectedReceiptData] = useState<{ receipt: any; expense: WalletExpenseItem } | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'efectivo' | 'tarjeta'>('all');
  const [filterCat, setFilterCat] = useState('all');

  // Deduplicate: Only convert itinerary activities that are NOT already recorded in expenses
  const itineraryExpenses: WalletExpenseItem[] = activities
    .filter(a => {
      const cost = parseCurrencyNumber(a.costEstimatedARS) || 0;
      if (cost <= 0) return false;
      return !isActivityTrackedInExpenses(a, expenses);
    })
    .map(a => {
      const parsedCost = parseCurrencyNumber(a.costEstimatedARS);
      return {
        id: `itinerary-${a.id}`,
        activityId: a.id,
        date: `Día ${a.dayNumber} · ${a.time || '10:00'}`,
        concept: a.title,
        category: a.category || (a.type === 'compras' ? 'compras' : 'gastronomia'),
        amountARS: parsedCost,
        paymentMethod: 'efectivo',
        paidBy: 'Itinerario',
        note: `Plan Día ${a.dayNumber}${a.barrio ? ` (${a.barrio})` : ''}`,
        isFromItinerary: true,
        dayNumber: a.dayNumber,
        completed: Boolean(a.completed),
        type: a.type || 'plan',
        items: a.items || []
      };
    });

  const mergedExpenses: WalletExpenseItem[] = [...itineraryExpenses, ...expenses];

  const totalItineraryARS = itineraryExpenses.reduce((sum, e) => sum + (Number(e.amountARS) || 0), 0);
  const totalDirectARS = expenses.reduce((sum, e) => sum + (Number(e.amountARS) || 0), 0);
  const totalARS = mergedExpenses.reduce((sum, e) => sum + (Number(e.amountARS) || 0), 0);
  const totalUSD = totalARS / safeRate;
  const remainingUSD = Math.max(0, BUDGET_CAP_USD - totalUSD);
  const remainingARS = remainingUSD * safeRate;
  const percentUsed = Math.min(100, Math.round((totalUSD / BUDGET_CAP_USD) * 100));

  const handleOpenReceipt = (expense: WalletExpenseItem) => {
    if (!expense.receipt_id) return;
    const foundReceipt = receipts.find(r => r.uuid === expense.receipt_id);
    setSelectedReceiptData({
      receipt: foundReceipt || { uuid: expense.receipt_id, filename: 'Comprobante', description: expense.note },
      expense
    });
    setIsReceiptModalOpen(true);
  };

  const filteredExpenses = mergedExpenses.filter(e => {
    if (filterCat !== 'all' && e.category !== filterCat) return false;
    const method = getExpensePaymentMethod(e);
    if (paymentFilter === 'efectivo' && method !== 'efectivo') return false;
    if (paymentFilter === 'tarjeta' && method !== 'tarjeta') return false;
    return true;
  });

  const activeCategoryObj = categories.find(c => c.id === activeSubTab);

  return (
    <div className="budget-tracker-view">
      {/* TOP TOOLBAR */}
      <CategoryToolbar
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
        totalUSD={totalUSD}
        categories={categories}
        mergedExpenses={mergedExpenses}
        onDeleteCategory={onDeleteCategory}
        onOpenNewCatModal={() => setIsNewCatModalOpen(true)}
      />

      {/* SUB-TAB VIEW 1: BILLETERA GENERAL */}
      {activeSubTab === 'general' ? (
        <>
          <WalletHero
            exchangeRate={exchangeRate}
            safeRate={safeRate}
            onUpdateExchangeRate={onUpdateExchangeRate}
            totalARS={totalARS}
            totalUSD={totalUSD}
            totalItineraryARS={totalItineraryARS}
            totalDirectARS={totalDirectARS}
            remainingUSD={remainingUSD}
            remainingARS={remainingARS}
            percentUsed={percentUsed}
          />

          <LiquidityTracker
            mergedExpenses={mergedExpenses}
            totalARS={totalARS}
            totalUSD={totalUSD}
            safeRate={safeRate}
            budgetCapUsd={BUDGET_CAP_USD}
            paymentFilter={paymentFilter}
            setPaymentFilter={setPaymentFilter}
            setActiveSubTab={setActiveSubTab}
          />

          <div className="budget-main-layout">
            <AddExpenseForm
              categories={categories}
              mergedExpenses={mergedExpenses}
              totalARS={totalARS}
              safeRate={safeRate}
              onAddExpense={(exp) => onAddExpense(exp)}
            />

            <ExpenseList
              filteredExpenses={filteredExpenses}
              categories={categories}
              filterCat={filterCat}
              setFilterCat={setFilterCat}
              safeRate={safeRate}
              onOpenReceipt={handleOpenReceipt}
              onEditExpense={setEditingExpenseItem}
              onDeleteExpense={onDeleteExpense}
              onUpdateActivityCost={onUpdateActivityCost}
            />
          </div>
        </>
      ) : (
        /* SUB-TAB VIEW 2+: DYNAMIC SECTION */
        activeCategoryObj && (
          <DynamicExpenseSection
            category={activeCategoryObj}
            expenses={mergedExpenses}
            onAddExpense={onAddExpense}
            onDeleteExpense={(id: string, exp: Expense) => onDeleteExpense(id, exp)}
            onEditExpense={(exp: WalletExpenseItem) => setEditingExpenseItem(exp)}
            exchangeRate={exchangeRate}
            onViewReceipt={handleOpenReceipt}
          />
        )
      )}

      {/* Modal: Edit Expense / Mirror Itinerary Activity Price */}
      {editingExpenseItem && (
        <EditExpenseModal
          isOpen={Boolean(editingExpenseItem)}
          onClose={() => setEditingExpenseItem(null)}
          expense={editingExpenseItem}
          activities={activities}
          categories={categories}
          exchangeRate={safeRate}
          onSave={(updated: Expense) => {
            if (onUpdateExpense) onUpdateExpense(updated);
            setEditingExpenseItem(null);
          }}
        />
      )}

      {/* Modal: Add New Custom Category */}
      <NewCategoryModal
        isOpen={isNewCatModalOpen}
        onClose={() => setIsNewCatModalOpen(false)}
        onCreateCategory={(newCat: ExpenseCategory) => {
          onAddCategory(newCat);
          setActiveSubTab(newCat.id);
        }}
      />

      {/* Modal: View Receipt Image & OCR */}
      <ReceiptViewerModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receipt={selectedReceiptData?.receipt}
        expense={selectedReceiptData?.expense}
        exchangeRate={exchangeRate}
      />
    </div>
  );
}

