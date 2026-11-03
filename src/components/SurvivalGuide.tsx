import React, { useState, useEffect } from 'react';
import { Compass, Globe, Sparkles, MapPin } from 'lucide-react';
import { Trip, GLOBAL_DESTINATIONS } from '../types/trip';
import { getDestinationGuide } from '../data/destinationGuides';
import EmergencyCard from './guide/EmergencyCard';
import TransitGuideCard from './guide/TransitGuideCard';
import PlugsAndMoneyCard from './guide/PlugsAndMoneyCard';
import CityTipsList from './guide/CityTipsList';

interface SurvivalGuideProps {
  activeTrip?: Trip | null;
}

export default function SurvivalGuide({ activeTrip }: SurvivalGuideProps) {
  const initialCountry = activeTrip?.countryCode || 'AR';
  const initialCity = activeTrip?.destinationCity || 'Buenos Aires';

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(initialCountry);
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);

  // Sync if activeTrip changes
  useEffect(() => {
    if (activeTrip?.countryCode) {
      setSelectedCountryCode(activeTrip.countryCode);
      setSelectedCity(activeTrip.destinationCity);
    }
  }, [activeTrip?.countryCode, activeTrip?.destinationCity]);

  const guide = getDestinationGuide(selectedCountryCode, selectedCity);

  const handleCountryChange = (code: string) => {
    setSelectedCountryCode(code);
    const country = GLOBAL_DESTINATIONS.find(c => c.code === code);
    if (country) {
      setSelectedCity(country.suggestedCities[0] || country.name);
    }
  };

  return (
    <div className="survival-guide-container animate-fade-in">
      {/* HERO BANNER WITH DESTINATION SELECTOR */}
      <div className="survival-hero-card">
        <div className="survival-hero-top">
          <div className="hero-flag-display">
            <span className="hero-flag-emoji">{guide.flagEmoji}</span>
          </div>

          <div className="hero-title-group">
            <div className="hero-eyebrow-row">
              <span className="hero-eyebrow">
                <Compass size={14} />
                <span>{guide.tagline}</span>
              </span>
              {activeTrip && activeTrip.countryCode === selectedCountryCode && (
                <span className="guide-active-trip-pill">
                  ⭐ Destino de tu viaje activo
                </span>
              )}
            </div>

            <h2 className="guide-hero-city-title">
              {guide.city}, {guide.countryName}
            </h2>
            <p className="guide-hero-description">{guide.intro}</p>
          </div>
        </div>

        {/* Global Destination Switcher Bar */}
        <div className="guide-destination-switcher-bar">
          <div className="switcher-label-group">
            <Globe size={15} className="text-sky" />
            <span>Ver guía de otro destino:</span>
          </div>
          <div className="switcher-select-wrapper">
            <select
              value={selectedCountryCode}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="guide-country-select"
            >
              {GLOBAL_DESTINATIONS.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name} ({c.suggestedCities[0] || c.name})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* CORE GUIDE MODULES */}
      <div className="guide-modules-layout">
        {/* 1. Emergency Numbers */}
        <EmergencyCard
          countryName={guide.countryName}
          flagEmoji={guide.flagEmoji}
          services={guide.emergency}
        />

        {/* 2. Public Transit & Metro Lines */}
        <TransitGuideCard
          transit={guide.transit}
          metroLines={guide.metroLines}
          cityName={guide.city}
        />

        {/* 3. Plugs, Voltage & Tipping */}
        <PlugsAndMoneyCard
          plugs={guide.plugs}
          money={guide.money}
          countryName={guide.countryName}
        />

        {/* 4. Smartphone Apps & Local Secrets */}
        <CityTipsList
          apps={guide.apps}
          tips={guide.customTips}
          cityName={guide.city}
        />
      </div>
    </div>
  );
}
