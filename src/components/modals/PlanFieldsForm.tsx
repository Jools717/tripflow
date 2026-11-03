import React from 'react';
import { parseCurrencyNumber } from '../../utils/helpers';

interface PlanFieldsFormProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  exchangeRate: number;
}

export default function PlanFieldsForm({
  formData,
  setFormData,
  exchangeRate
}: PlanFieldsFormProps) {
  return (
    <>
      <div className="form-row">
        <div className="form-group">
          <label>Categoría</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="form-select"
          >
            <option value="gastronomia">Gastronomía & Cafés</option>
            <option value="cultura">Cultura & Monumentos</option>
            <option value="naturaleza">Parques & Naturaleza</option>
            <option value="vida_nocturna">Vida Nocturna & Bares</option>
            <option value="transporte">Transporte & Traslados</option>
            <option value="mercado">Mercado Casa de Amiga</option>
            <option value="compras">Compras & Alfajores</option>
            <option value="relax">Descanso & Hogar</option>
          </select>
        </div>
        <div className="form-group">
          <label>Barrio / Zona</label>
          <input
            type="text"
            placeholder="Ej: San Telmo, Palermo, Recoleta..."
            value={formData.barrio}
            onChange={(e) => setFormData({ ...formData, barrio: e.target.value })}
            className="form-input"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Dirección o Nombre del Lugar en Buenos Aires</label>
        <input
          type="text"
          placeholder="Ej: Av. Corrientes 1368, Cerrito 628..."
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="form-input"
        />
        <small className="form-hint">
          Esta dirección se usará para abrir la ruta en Google Maps con transporte público.
        </small>
      </div>

      <div className="form-group">
        <label>Descripción / Detalles</label>
        <textarea
          rows={2}
          placeholder="¿Qué vamos a hacer? Detalles de reserva, horarios, etc."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="form-textarea"
        />
      </div>

      <div className="form-group">
        <label>Tip o Recomendación Porteña</label>
        <input
          type="text"
          placeholder="Ej: Pedir porción de fugazzeta de parado, llevar efectivo..."
          value={formData.tip}
          onChange={(e) => setFormData({ ...formData, tip: e.target.value })}
          className="form-input"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Costo Estimado (ARS)</label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="Ej: 19.741 (Dejar en $0 si es gratis)"
            value={formData.costEstimatedARS || ''}
            onChange={(e) => setFormData({ ...formData, costEstimatedARS: e.target.value })}
            className="form-input"
          />
          {parseCurrencyNumber(formData.costEstimatedARS) > 0 && (
            <div className="live-currency-hint">
              ≈ <strong>${(parseCurrencyNumber(formData.costEstimatedARS) / exchangeRate).toFixed(1)} USD Blue</strong>
            </div>
          )}
        </div>

        <div className="form-group toggle-group-wrapper">
          <label>¿Va mi amiga?</label>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={formData.withFriend}
              onChange={(e) => setFormData({ ...formData, withFriend: e.target.checked })}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label">
              {formData.withFriend ? 'Sí, vamos juntos' : 'Solo / En solitario'}
            </span>
          </label>
        </div>
      </div>
    </>
  );
}

