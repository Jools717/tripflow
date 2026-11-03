import React from 'react';
import { ShoppingBag, Plus, Trash2 } from 'lucide-react';
import { formatCurrencyARS } from '../../utils/helpers';

export interface ScannedItem {
  id: string;
  name: string;
  quantity: number | string;
  unitPrice: number | string;
  total: number | string;
}

interface ScannerItemsTableProps {
  itemsList: ScannedItem[];
  amountARS: string;
  itemsSumARS: number;
  onAddItem: () => void;
  onItemChange: (id: string, field: 'name' | 'quantity' | 'unitPrice' | 'total', value: string) => void;
  onDeleteItem: (id: string) => void;
  onSyncTotalFromItems: () => void;
}

export default function ScannerItemsTable({
  itemsList,
  amountARS,
  itemsSumARS,
  onAddItem,
  onItemChange,
  onDeleteItem,
  onSyncTotalFromItems
}: ScannerItemsTableProps) {
  return (
    <div className="scanner-items-section">
      <div className="scanner-items-header">
        <div className="scanner-items-title">
          <ShoppingBag size={16} className="text-emerald" />
          <strong>Desglose de Productos / Ítems Detectados</strong>
          <span className="items-count-pill">
            {itemsList.length} {itemsList.length === 1 ? 'producto' : 'productos'}
          </span>
        </div>

        <button
          type="button"
          onClick={onAddItem}
          className="btn-add-item-row"
        >
          <Plus size={14} />
          <span>Agregar Ítem</span>
        </button>
      </div>

      {itemsList.length > 0 ? (
        <div className="scanner-items-table-wrapper">
          <table className="scanner-items-table">
            <thead>
              <tr>
                <th>Detalle / Producto</th>
                <th style={{ width: '105px' }}>Precio Unit.</th>
                <th style={{ width: '75px' }}>Cant.</th>
                <th style={{ width: '110px' }}>Valor ($)</th>
                <th style={{ width: '38px' }}></th>
              </tr>
            </thead>
            <tbody>
              {itemsList.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => onItemChange(item.id, 'name', e.target.value)}
                      placeholder="Ej: Frijol Cáscara..."
                      className="item-table-input"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={item.unitPrice}
                      onChange={(e) => onItemChange(item.id, 'unitPrice', e.target.value)}
                      className="item-table-input text-right"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={item.quantity}
                      onChange={(e) => onItemChange(item.id, 'quantity', e.target.value)}
                      className="item-table-input text-center"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={item.total}
                      onChange={(e) => onItemChange(item.id, 'total', e.target.value)}
                      className="item-table-input text-right font-bold"
                    />
                  </td>
                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => onDeleteItem(item.id)}
                      className="btn-delete-item-row"
                      title="Eliminar ítem"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="scanner-items-footer">
            <div className="items-sum-info">
              <span>Suma de ítems:</span>
              <strong className="text-emerald">{formatCurrencyARS(itemsSumARS)}</strong>
              {Number(amountARS) > 0 && Math.abs(itemsSumARS - Number(amountARS)) > 1 && (
                <button
                  type="button"
                  onClick={onSyncTotalFromItems}
                  className="btn-sync-total"
                  title="Actualizar el Monto Total con la suma de los productos"
                >
                  ⚡ Ajustar Total al valor de ítems ({formatCurrencyARS(itemsSumARS)})
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="scanner-items-empty">
          <p>
            No se detectaron líneas de productos automáticamente. Puedes hacer clic en{' '}
            <strong>+ Agregar Ítem</strong> si deseas detallar los productos de la compra.
          </p>
        </div>
      )}
    </div>
  );
}

