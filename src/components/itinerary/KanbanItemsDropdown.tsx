import React from 'react';
import { ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import { PurchaseItem } from '../../types/activity';
import { formatCurrencyARS } from '../../utils/helpers';

interface KanbanItemsDropdownProps {
  activityId: string;
  items?: PurchaseItem[];
  totalCostARS: number;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
}

export default function KanbanItemsDropdown({
  activityId,
  items = [],
  totalCostARS,
  isExpanded,
  onToggleExpand
}: KanbanItemsDropdownProps) {
  return (
    <div className="kcard-items-block">
      <button
        type="button"
        className="btn-kcard-toggle-items"
        onClick={(e) => {
          e.stopPropagation();
          onToggleExpand(activityId);
        }}
        title="Ver u ocultar productos de este lote"
      >
        <ShoppingBag size={12} className="text-purple" />
        <span>{items.length} {items.length === 1 ? 'artículo' : 'artículos'}</span>
        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {isExpanded && items.length > 0 && (
        <div className="kcard-items-dropdown animate-fade-in" onClick={(e) => e.stopPropagation()}>
          {items.map((it, idx) => (
            <div key={it.id || idx} className="kcard-item-row">
              <span className="it-name">• {it.name || 'Artículo'}</span>
              <span className="it-price">{formatCurrencyARS(it.price || 0)}</span>
            </div>
          ))}
          <div className="kcard-item-sum-row">
            <span>Total lote:</span>
            <strong>{formatCurrencyARS(totalCostARS)}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

