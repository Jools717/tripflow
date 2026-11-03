import React, { useState, useMemo } from 'react';
import { X, Plane, Calendar, DollarSign, MapPin, Sparkles, Search } from 'lucide-react';
import { Trip, GLOBAL_DESTINATIONS } from '../../types/trip';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip: (trip: Trip) => void;
  currentUserId?: string | null;
}

export default function CreateTripModal({
  isOpen,
  onClose,
  onCreateTrip,
  currentUserId
}: CreateTripModalProps) {
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('JP');
  const [city, setCity] = useState('Tokio');
  const [title, setTitle] = useState('Aventura en Tokio');
  const [startDate, setStartDate] = useState('2026-11-15');
  const [endDate, setEndDate] = useState('2026-11-28');
  const [budgetBase, setBudgetBase] = useState('1500');
  const baseCurrency = 'USD';
  const [localCurrency, setLocalCurrency] = useState('JPY');
  const [approxRate, setApproxRate] = useState('155');

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return GLOBAL_DESTINATIONS;
    const query = countrySearch.toLowerCase().trim();
    return GLOBAL_DESTINATIONS.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.code.toLowerCase().includes(query) ||
      c.suggestedCities.some(city => city.toLowerCase().includes(query))
    );
  }, [countrySearch]);

  if (!isOpen) return null;

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountryCode(countryCode);
    const country = GLOBAL_DESTINATIONS.find(c => c.code === countryCode);
    if (country) {
      const defaultCity = country.suggestedCities[0] || country.name;
      setCity(defaultCity);
      setTitle(`Viaje a ${defaultCity}`);
      setLocalCurrency(country.defaultCurrency);
      setApproxRate(country.approxRateUSD.toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const country = GLOBAL_DESTINATIONS.find(c => c.code === selectedCountryCode);

    const newTrip: Trip = {
      id: 'trip-' + Date.now(),
      userId: currentUserId || 'user-admin-jools',
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
              <p>Top 50 países con moneda y configuración inteligente</p>
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
          
          {/* Country Selection with Search */}
          <div className="form-group">
            <div className="country-search-header-row">
              <label className="form-label mb-0">
                <span>Selecciona tu País ({GLOBAL_DESTINATIONS.length} disponibles):</span>
              </label>
              <div className="country-search-input-wrapper">
                <Search size={14} className="country-search-icon" />
                <input
                  type="text"
                  placeholder="Buscar país o ciudad..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="country-search-input"
                />
              </div>
            </div>

            <div className="country-chips-grid">
              {filteredCountries.map(c => (
                <button
                  key={c.code}
                  type="button"
                  className={`country-chip-btn ${selectedCountryCode === c.code ? 'active' : ''}`}
                  onClick={() => handleCountryChange(c.code)}
                  title={`${c.name} • Moneda: ${c.defaultCurrency}`}
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
                placeholder="Ej: Tokio, París, Madrid"
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
                <span>Cotización x 1 {baseCurrency}:</span>
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
