import React from 'react';
import { ShoppingBag, Plus, Trash2 } from 'lucide-react';
import { formatCurrencyARS, formatCurrencyUSD } from '../../utils/helpers';

export interface EditablePurchaseItem {
  id: string;
  name: string;
  price: string;
}

interface ComprasItemsBuilderProps {
  itemsList: EditablePurchaseItem[];
  totalItemsARS: number;
  exchangeRate: number;
  category: string;
  barrio: string;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onItemChange: (id: string, field: 'name' | 'price', value: string) => void;
  onCategoryChange: (cat: string) => void;
  onBarrioChange: (barrio: string) => void;
}

export default function ComprasItemsBuilder({
  itemsList,
  totalItemsARS,
  exchangeRate,
  category,
  barrio,
  onAddItem,
  onRemoveItem,
  onItemChange,
  onCategoryChange,
  onBarrioChange
}: ComprasItemsBuilderProps) {
  return (
    <div className="compras-builder-box">
      <div className="compras-builder-header">
        <div className="compras-header-info">
          <div className="compras-header-title">
            <ShoppingBag size={17} className="text-purple" />
            <span>Artículos del Lote de Compras</span>
          </div>
          <p className="compras-header-subtitle">
            Detalla los productos y sus precios. Se sumarán automáticamente en 1 sola tarjeta.
          </p>
        </div>
        <button
          type="button"
          className="btn-add-item-row"
          onClick={onAddItem}
        >
          <Plus size={15} />
          <span>Agregar producto</span>
        </button>
      </div>

      <div className="items-inputs-stack">
        {itemsList.map((item, index) => (
          <div key={item.id} className="item-input-row">
            <span className="item-row-badge">#{index + 1}</span>
            <input
              type="text"
              placeholder="Producto (ej: Pezuña, Imanes, Mate)"
              value={item.name}
              onChange={(e) => onItemChange(item.id, 'name', e.target.value)}
              className="form-input item-input-name"
            />
            <div className="item-price-wrapper">
              <span className="item-price-symbol">ARS $</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={item.price}
                onChange={(e) => onItemChange(item.id, 'price', e.target.value)}
                className="form-input item-input-price"
              />
            </div>
            <button
              type="button"
              className="btn-remove-item"
              onClick={() => onRemoveItem(item.id)}
              title="Eliminar este artículo"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <div className="compras-total-summary-card">
        <div className="summary-col-left">
          <span className="summary-items-count">Total ({itemsList.length} {itemsList.length === 1 ? 'artículo' : 'artículos'}):</span>
          <span className="summary-mirror-hint">Se reflejará este total espejo en tu Billetera</span>
        </div>
        <div className="summary-col-right">
          <span className="summary-total-ars">{formatCurrencyARS(totalItemsARS)}</span>
          <span className="summary-total-usd">≈ {formatCurrencyUSD(totalItemsARS, exchangeRate)} USD Blue</span>
        </div>
      </div>

      <div className="form-row compras-sub-row">
        <div className="form-group">
          <label>Categoría en Billetera</label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="form-select"
          >
            <option value="compras">🛍️ Compras & Outlets</option>
            <option value="mercado">🛒 Mercado de Alimentos</option>
            <option value="regalos">🎁 Regalos del Viaje</option>
            <option value="varios">🏷️ Varios & General</option>
          </select>
        </div>
        <div className="form-group">
          <label>Barrio / Zona</label>
          <input
            type="text"
            placeholder="Ej: San Telmo, Palermo..."
            value={barrio}
            onChange={(e) => onBarrioChange(e.target.value)}
            className="form-input"
          />
        </div>
      </div>
    </div>
  );
}

