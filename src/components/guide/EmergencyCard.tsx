import React from 'react';
import { PhoneCall, ShieldAlert, AlertTriangle } from 'lucide-react';
import { EmergencyService } from '../../types/guide';

interface EmergencyCardProps {
  countryName: string;
  flagEmoji: string;
  services: EmergencyService[];
}

export default function EmergencyCard({ countryName, flagEmoji, services }: EmergencyCardProps) {
  return (
    <div className="guide-emergency-card animate-fade-in">
      <div className="guide-card-header">
        <div className="guide-card-icon-title">
          <div className="emergency-icon-badge">
            <ShieldAlert size={20} className="text-rose" />
          </div>
          <div>
            <h3 className="guide-card-title">Teléfonos de Emergencia</h3>
            <p className="guide-card-subtitle">Asistencia rápida 24/7 en {flagEmoji} {countryName}</p>
          </div>
        </div>
      </div>

      <div className="emergency-numbers-grid">
        {services.map((item, idx) => (
          <div key={idx} className="emergency-number-item">
            <div className="emergency-item-left">
              <span className="emergency-item-label">{item.label}</span>
              <span className="emergency-item-desc">{item.desc}</span>
            </div>
            <a
              href={`tel:${item.number}`}
              className="emergency-call-btn"
              title={`Llamar al ${item.number}`}
            >
              <PhoneCall size={14} />
              <span className="emergency-digits">{item.number}</span>
            </a>
          </div>
        ))}
      </div>

      <div className="emergency-tip-banner">
        <AlertTriangle size={14} className="text-amber" />
        <span>En caso de urgencia médica en el extranjero, comunícate primero con la central telefónica de tu seguro de viaje.</span>
      </div>
    </div>
  );
}

