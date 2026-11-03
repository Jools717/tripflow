import React from 'react';
import {
  Wallet, ShoppingCart, Utensils, Bus, Ticket, ShoppingBag,
  Receipt, Plus, Gift, Tag, X
} from 'lucide-react';
import { Expense } from '../../types/expense';
import { ExpenseCategory } from '../../types/category';
import { formatCurrencyARS } from '../../utils/helpers';

const ICON_COMPONENT_MAP: Record<string, any> = {
  ShoppingCart,
  Gift,
  Utensils,
  Bus,
  Ticket,
  ShoppingBag,
  Receipt,
  Tag,
  Wallet,
  mercado: ShoppingCart,
  regalos: Gift,
  gastronomia: Utensils,
  transporte: Bus,
  cultura: Ticket,
  compras: ShoppingBag,
  varios: Receipt
};

export const getCategoryIcon = (iconNameOrId: string, size = 15, style: React.CSSProperties = {}) => {
  const IconComp = ICON_COMPONENT_MAP[iconNameOrId] || Tag;
  return <IconComp size={size} style={style} />;
};

interface CategoryToolbarProps {
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
  totalUSD: number;
  categories: ExpenseCategory[];
  mergedExpenses: Expense[];
  onDeleteCategory: (catId: string) => void;
  onOpenNewCatModal: () => void;
}

export default function CategoryToolbar({
  activeSubTab,
  setActiveSubTab,
  totalUSD,
  categories,
  mergedExpenses,
  onDeleteCategory,
  onOpenNewCatModal
}: CategoryToolbarProps) {
  return (
    <div className="budget-top-toolbar">
      <div className="toolbar-tabs-scroll">
        {/* Tab 1: Billetera General */}
        <button
          type="button"
          className={`toolbar-tab-btn ${activeSubTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('general')}
        >
          <Wallet size={16} />
          <span>Billetera General</span>
          <span className="toolbar-tab-badge">${Math.round(totalUSD)} / $1.000 USD</span>
        </button>

        {/* Dynamic Category Tabs (Mercado, Regalos, Discotecas...) */}
        {categories.map((cat) => {
          const isActive = activeSubTab === cat.id;
          const catExpenses = mergedExpenses.filter(e => e.category === cat.id);
          const catARS = catExpenses.reduce((sum, e) => sum + (Number(e.amountARS) || 0), 0);

          return (
            <div key={cat.id} className="toolbar-tab-wrapper">
              <button
                type="button"
                className={`toolbar-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveSubTab(cat.id)}
                style={isActive ? { borderBottomColor: cat.color, color: cat.color } : {}}
              >
                {getCategoryIcon(cat.icon || cat.id, 15, { color: cat.color })}
                <span>{cat.name}</span>
                <span className="toolbar-tab-count">{catARS > 0 ? formatCurrencyARS(catARS) : '$0 ARS'}</span>
              </button>

              {!cat.is_default && (
                <button
                  type="button"
                  className="btn-delete-custom-cat"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`¿Eliminar la sección "${cat.name}"? Los gastos asociados seguirán en el historial general.`)) {
                      onDeleteCategory(cat.id);
                      if (activeSubTab === cat.id) setActiveSubTab('general');
                    }
                  }}
                  title="Eliminar esta sección personalizada"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          );
        })}

        {/* The [+] Button: Add New Custom Section */}
        <button
          type="button"
          className="toolbar-add-section-btn"
          onClick={onOpenNewCatModal}
          title="Crear una nueva sección personalizada con calculadora y escáner"
        >
          <Plus size={16} />
          <span>Nueva Sección</span>
        </button>
      </div>
    </div>
  );
}

