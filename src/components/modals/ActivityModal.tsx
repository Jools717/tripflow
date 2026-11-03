import React, { useState, useEffect } from 'react';
import { X, MapPin, Sparkles, ShoppingBag, StickyNote } from 'lucide-react';
import { Activity, ActivityType, PurchaseItem } from '../../types/activity';
import { INITIAL_DAYS } from '../../data/initialData';
import { parseCurrencyNumber } from '../../utils/helpers';
import ComprasItemsBuilder, { EditablePurchaseItem } from './ComprasItemsBuilder';
import PlanFieldsForm from './PlanFieldsForm';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  editingActivity: Activity | null;
  currentDayNumber: number;
  exchangeRate?: number;
}

export default function ActivityModal({
  isOpen,
  onClose,
  onSave,
  editingActivity,
  currentDayNumber,
  exchangeRate = 1520
}: ActivityModalProps) {
  const [entryType, setEntryType] = useState<ActivityType>('plan');

  const [formData, setFormData] = useState<any>({
    dayNumber: currentDayNumber || 1,
    time: '11:00',
    period: 'mañana',
    title: '',
    barrio: 'Palermo',
    category: 'gastronomia',
    address: '',
    coords: [-34.5880, -58.4300],
    description: '',
    note: '',
    tip: '',
    withFriend: false,
    costEstimatedARS: 0,
    completed: false,
    items: []
  });

  const [itemsList, setItemsList] = useState<EditablePurchaseItem[]>([
    { id: 'it-1', name: '', price: '' }
  ]);

  useEffect(() => {
    if (editingActivity) {
      const type: ActivityType = editingActivity.type || (editingActivity.category === 'compras' && editingActivity.items && editingActivity.items.length > 0 ? 'compras' : 'plan');
      setEntryType(type);
      setFormData({
        ...editingActivity,
        dayNumber: Number(editingActivity.dayNumber || currentDayNumber || 1),
        costEstimatedARS: editingActivity.costEstimatedARS || 0,
        items: editingActivity.items || []
      });

      if (Array.isArray(editingActivity.items) && editingActivity.items.length > 0) {
        setItemsList(editingActivity.items.map((it, idx) => ({
          id: it.id || `it-${idx + 1}`,
          name: it.name || '',
          price: it.price != null ? it.price.toString() : ''
        })));
      } else {
        setItemsList([{ id: 'it-1', name: '', price: '' }]);
      }
    } else {
      setEntryType('plan');
      setFormData({
        dayNumber: currentDayNumber || 1,
        time: '11:00',
        period: 'mañana',
        title: '',
        barrio: 'San Telmo',
        category: 'gastronomia',
        address: '',
        coords: [-34.5880, -58.4300],
        description: '',
        note: '',
        tip: '',
        withFriend: false,
        costEstimatedARS: 0,
        completed: false,
        items: []
      });
      setItemsList([{ id: 'it-1', name: '', price: '' }]);
    }
  }, [editingActivity, currentDayNumber, isOpen]);

  if (!isOpen) return null;

  const totalItemsARS = itemsList.reduce((sum, item) => sum + (parseCurrencyNumber(item.price) || 0), 0);

  const handleAddItem = () => {
    setItemsList(prev => [...prev, { id: `it-${Date.now()}`, name: '', price: '' }]);
  };

  const handleRemoveItem = (id: string) => {
    if (itemsList.length <= 1) {
      setItemsList([{ id: 'it-1', name: '', price: '' }]);
      return;
    }
    setItemsList(prev => prev.filter(it => it.id !== id));
  };

  const handleItemChange = (id: string, field: 'name' | 'price', value: string) => {
    setItemsList(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Por favor ingresa un título.');
      return;
    }

    let finalCost = 0;
    let finalCategory = formData.category;
    let cleanItems: PurchaseItem[] = [];

    if (entryType === 'compras') {
      cleanItems = itemsList
        .filter(it => it.name.trim() || parseCurrencyNumber(it.price) > 0)
        .map(it => ({
          id: it.id,
          name: it.name.trim() || 'Artículo',
          price: parseCurrencyNumber(it.price) || 0
        }));
      finalCost = cleanItems.reduce((s, it) => s + it.price, 0);
      finalCategory = formData.category || 'compras';
    } else if (entryType === 'nota') {
      finalCost = 0;
      finalCategory = 'relax';
    } else {
      finalCost = Math.max(0, parseCurrencyNumber(formData.costEstimatedARS) || 0);
    }

    onSave({
      ...formData,
      type: entryType,
      category: finalCategory,
      items: cleanItems,
      dayNumber: Number(formData.dayNumber || currentDayNumber || 1),
      costEstimatedARS: finalCost
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container activity-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <span className={`modal-icon-badge badge-${entryType}`}>
              {entryType === 'compras' ? <ShoppingBag size={20} /> : entryType === 'nota' ? <StickyNote size={20} /> : <Sparkles size={20} />}
            </span>
            <div>
              <span className={`modal-type-chip chip-${entryType}`}>
                Día {formData.dayNumber} · {entryType === 'compras' ? 'Lote de Compras' : entryType === 'nota' ? 'Nota / Recordatorio' : 'Plan de Itinerario'}
              </span>
              <h3>
                {editingActivity ? 'Editar Elemento' : 'Agregar al Itinerario'}
              </h3>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        {/* Entry Type Selector Tabs */}
        {!editingActivity && (
          <div className="entry-type-selector-tabs">
            <button
              type="button"
              className={`entry-type-tab-btn tab-plan ${entryType === 'plan' ? 'active' : ''}`}
              onClick={() => {
                setEntryType('plan');
                setFormData((prev: any) => ({ ...prev, category: 'gastronomia' }));
              }}
            >
              <MapPin size={16} />
              <span>Plan / Visita</span>
            </button>

            <button
              type="button"
              className={`entry-type-tab-btn tab-compras ${entryType === 'compras' ? 'active' : ''}`}
              onClick={() => {
                setEntryType('compras');
                setFormData((prev: any) => ({ ...prev, category: 'compras', title: prev.title || 'Compras en San Telmo' }));
              }}
            >
              <ShoppingBag size={16} />
              <span>Compras (Multi-ítem)</span>
            </button>

            <button
              type="button"
              className={`entry-type-tab-btn tab-nota ${entryType === 'nota' ? 'active' : ''}`}
              onClick={() => {
                setEntryType('nota');
                setFormData((prev: any) => ({ ...prev, category: 'relax', title: prev.title || 'Nota del día' }));
              }}
            >
              <StickyNote size={16} />
              <span>Nota / Aviso</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Día del Viaje</label>
            <select
              value={formData.dayNumber}
              onChange={(e) => setFormData({ ...formData, dayNumber: Number(e.target.value) })}
              className="form-select"
            >
              {INITIAL_DAYS.map((d) => (
                <option key={d.dayNumber} value={d.dayNumber}>
                  Día {d.dayNumber} · {d.dateFormatted} ({d.barrioPrincipal})
                </option>
              ))}
            </select>
          </div>

          {entryType !== 'nota' && (
            <div className="form-row">
              <div className="form-group">
                <label>Hora Estimada</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Momento del Día</label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  className="form-select"
                >
                  <option value="mañana">Mañana</option>
                  <option value="tarde">Tarde</option>
                  <option value="noche">Noche</option>
                </select>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>
              {entryType === 'compras' ? 'Título del Lote de Compras *' : entryType === 'nota' ? 'Título de la Nota / Recordatorio *' : 'Nombre del Plan / Lugar *'}
            </label>
            <input
              type="text"
              placeholder={entryType === 'compras' ? 'Ej: Compras en Feria de San Telmo' : entryType === 'nota' ? 'Ej: Recordar llevar efectivo sencillo' : 'Ej: Visita al Teatro Colón, Almuerzo en Güerrin...'}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="form-input"
              required
            />
          </div>

          {entryType === 'compras' && (
            <ComprasItemsBuilder
              itemsList={itemsList}
              totalItemsARS={totalItemsARS}
              exchangeRate={exchangeRate}
              category={formData.category}
              barrio={formData.barrio}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              onItemChange={handleItemChange}
              onCategoryChange={(cat) => setFormData({ ...formData, category: cat })}
              onBarrioChange={(barrio) => setFormData({ ...formData, barrio })}
            />
          )}

          {entryType === 'nota' && (
            <div className="nota-builder-box">
              <div className="nota-tip-hint">
                <StickyNote size={16} />
                <span>Las notas son recordatorios útiles para tu día ($0 de costo y sin ruta de transporte).</span>
              </div>
              <div className="form-group">
                <label>Detalle de la Nota / Aviso *</label>
                <textarea
                  rows={4}
                  placeholder="Escribe aquí recomendaciones, advertencias de seguridad, cosas pendientes por comprar o llevar..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea nota-textarea"
                  required
                />
              </div>
            </div>
          )}

          {entryType === 'plan' && (
            <PlanFieldsForm
              formData={formData}
              setFormData={setFormData}
              exchangeRate={exchangeRate}
            />
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {editingActivity ? 'Guardar Cambios' : entryType === 'compras' ? 'Guardar Lote de Compras' : entryType === 'nota' ? 'Guardar Nota' : 'Crear Actividad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

