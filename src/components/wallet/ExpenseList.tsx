import React from 'react';
import { Receipt } from 'lucide-react';
import { ExpenseCategory } from '../../types/category';
import ExpenseRow, { WalletExpenseItem } from './ExpenseRow';

interface ExpenseListProps {
  filteredExpenses: WalletExpenseItem[];
  categories: ExpenseCategory[];
  filterCat: string;
  setFilterCat: (cat: string) => void;
  safeRate: number;
  onOpenReceipt: (exp: WalletExpenseItem) => void;
  onEditExpense: (exp: WalletExpenseItem) => void;
  onDeleteExpense: (id: string, exp: WalletExpenseItem) => void;
  onUpdateActivityCost?: (activityId: string, newCost: number) => void;
  localCurrency?: string;
  baseCurrency?: string;
  countryCode?: string;
}

export default function ExpenseList({
  filteredExpenses,
  categories,
  filterCat,
  setFilterCat,
  safeRate,
  onOpenReceipt,
  onEditExpense,
  onDeleteExpense,
  onUpdateActivityCost,
  localCurrency = 'ARS',
  baseCurrency = 'USD',
  countryCode = 'AR'
}: ExpenseListProps) {
  return (
    <div className="budget-list-column">
      <div className="list-card-header">
        <h4>Historial Completo de Gastos ({filteredExpenses.length})</h4>
        <div className="category-filter-chips">
          <button
            className={`filter-chip ${filterCat === 'all' ? 'active' : ''}`}
            onClick={() => setFilterCat('all')}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`filter-chip ${filterCat === cat.id ? 'active' : ''}`}
              onClick={() => setFilterCat(cat.id)}
            >
              {cat.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="expenses-list">
        {filteredExpenses.length === 0 ? (
          <div className="empty-expenses">
            <Receipt size={36} className="text-muted" />
            <p>No hay gastos registrados en esta categoría.</p>
          </div>
        ) : (
          filteredExpenses.map(exp => (
            <ExpenseRow
              key={exp.id}
              exp={exp}
              categories={categories}
              safeRate={safeRate}
              onOpenReceipt={onOpenReceipt}
              onEditExpense={onEditExpense}
              onDeleteExpense={onDeleteExpense}
              onUpdateActivityCost={onUpdateActivityCost}
              localCurrency={localCurrency}
              baseCurrency={baseCurrency}
              countryCode={countryCode}
            />
          ))
        )}
      </div>
    </div>
  );
}
