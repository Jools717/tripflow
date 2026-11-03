import React, { useState } from 'react';
import { X, Plane, Calendar, DollarSign, MapPin, Sparkles } from 'lucide-react';
import { Trip, GLOBAL_DESTINATIONS } from '../../types/trip';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip: (trip: Trip) => void;
}

export default function CreateTripModal({
  isOpen,
  onClose,
  onCreateTrip
}: CreateTripModalProps) {
  const [selectedCountryCode, setSelectedCountryCode] = useState('JP');
  const [city, setCity] = useState('Tokio');
  const [title, setTitle] = useState('Aventura en Tokio');
  const [startDate, setStartDate] = useState('2026-11-15');
  const [endDate, setEndDate] = useState('2026-11-28');
  const [budgetBase, setBudgetBase] = useState('1500');
  const baseCurrency = 'USD';
  const [localCurrency, setLocalCurrency] = useState('JPY');
  const [approxRate, setApproxRate] = useState('155');

  if (!isOpen) return null;

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountryCode(countryCode);
    const country = GLOBAL_DESTINATIONS.find(c => c.code === countryCode);
    if (country) {
      const defaultCity = country.suggestedCities[0] || country.name;
      setCity(defaultCity);
      setTitle(`Viaje a ${defaultCity}`);
      setLocalCurrency(country.defaultCurrency);
      if (country.defaultCurrency === 'JPY') setApproxRate('155');
      else if (country.defaultCurrency === 'EUR') setApproxRate('0.92');
      else if (country.defaultCurrency === 'GBP') setApproxRate('0.79');
      else if (country.defaultCurrency === 'ARS') setApproxRate('1280');
      else if (country.defaultCurrency === 'COP') setApproxRate('4100');
      else if (country.defaultCurrency === 'MXN') setApproxRate('19.5');
      else setApproxRate('1');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const country = GLOBAL_DESTINATIONS.find(c => c.code === selectedCountryCode);

    const newTrip: Trip = {
      id: 'trip-' + Date.now(),
      title: title.trim() || `Viaje a ${city}`,
      destinationCity: city.trim() || 'Destino',
      countryCode: selectedCountryCode,
      flagEmoji: country?.flag || '✈️',
      startDate,
      endDate,
      baseCurrency,
      localCurrency,
      exchangeRate: Number(approxRate) || 1,
      budgetTotalBase: Number(budgetBase) || 1000,
      isActive: true
    };

    onCreateTrip(newTrip);
    onClose();
  };

  return (
    <div className="modal-backdrop-overlay animate-fade-in" onClick={onClose}>
      <div className="create-trip-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="create-trip-modal-header">
          <div className="create-trip-title-box">
            <div className="create-trip-icon-badge">
              <Plane size={24} className="text-sky" />
            </div>
            <div>
              <h3>Crear Nuevo Viaje</h3>
              <p>Configura tu destino, fechas y presupuesto de forma inteligente</p>
            </div>
          </div>

          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="create-trip-form">
          
          {/* Country Selection Chips */}
          <div className="form-group">
            <label className="form-label">
              <span>Selecciona tu País de Destino:</span>
            </label>
            <div className="country-chips-grid">
              {GLOBAL_DESTINATIONS.map(c => (
                <button
                  key={c.code}
                  type="button"
                  className={`country-chip-btn ${selectedCountryCode === c.code ? 'active' : ''}`}
                  onClick={() => handleCountryChange(c.code)}
                >
                  <span className="chip-flag">{c.flag}</span>
                  <span className="chip-name">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title & City */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">
                <MapPin size={14} />
                <span>Ciudad / Destino:</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ej: Tokio, París, Bariloche"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Nombre del Viaje:</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Vacaciones en Japón"
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Dates */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">
                <Calendar size={14} />
                <span>Fecha de Inicio:</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Calendar size={14} />
                <span>Fecha de Fin:</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Budget & Currencies */}
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">
                <DollarSign size={14} />
                <span>Presupuesto ({baseCurrency}):</span>
              </label>
              <input
                type="number"
                value={budgetBase}
                onChange={(e) => setBudgetBase(e.target.value)}
                placeholder="1000"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Moneda Local:</span>
              </label>
              <input
                type="text"
                value={localCurrency}
                onChange={(e) => setLocalCurrency(e.target.value.toUpperCase())}
                placeholder="EUR, JPY"
                className="form-input"
                maxLength={4}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Cotización aprox:</span>
              </label>
              <input
                type="number"
                step="any"
                value={approxRate}
                onChange={(e) => setApproxRate(e.target.value)}
                placeholder="1"
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Footer */}
          <div className="create-trip-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              <Sparkles size={16} />
              <span>Crear y Comenzar Viaje</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
