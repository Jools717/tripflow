import React from 'react';
import { Bus, CreditCard, Sparkles, MapPin, Layers } from 'lucide-react';
import { TransitPassInfo, MetroLineInfo } from '../../types/guide';

interface TransitGuideCardProps {
  transit: TransitPassInfo;
  metroLines?: MetroLineInfo[];
  cityName: string;
}

export default function TransitGuideCard({ transit, metroLines, cityName }: TransitGuideCardProps) {
  return (
    <div className="guide-transit-card animate-fade-in">
      <div className="guide-card-header">
        <div className="guide-card-icon-title">
          <div className="transit-icon-badge">
            <Bus size={20} className="text-sky" />
          </div>
          <div>
            <h3 className="guide-card-title">Transporte Público & Tarjetas</h3>
            <p className="guide-card-subtitle">Cómo moverte en {cityName}</p>
          </div>
        </div>
      </div>

      <div className="transit-pass-highlight-box">
        <div className="transit-pass-title-row">
          <div className="pass-chip">
            <CreditCard size={15} />
            <strong>{transit.name}</strong>
          </div>
          <span className="transit-type-tag">{transit.type}</span>
        </div>
        <p className="transit-pass-description">{transit.description}</p>

        <div className="transit-details-grid">
          <div className="transit-detail-block">
            <span className="detail-label">💳 ¿Cómo se recarga o paga?</span>
            <p className="detail-text">{transit.rechargeMethod}</p>
          </div>
          <div className="transit-detail-block">
            <span className="detail-label">💡 Tarifa & Descuentos</span>
            <p className="detail-text">{transit.howToPay}</p>
          </div>
        </div>
      </div>

      {metroLines && metroLines.length > 0 && (
        <div className="guide-metro-lines-section">
          <div className="metro-section-title">
            <Layers size={16} className="text-sky" />
            <h4>Líneas Clave de Metro / Subte</h4>
          </div>
          <div className="metro-lines-grid">
            {metroLines.map((line) => (
              <div key={line.code} className="metro-line-badge-item">
                <span className="line-circle-badge" style={{ backgroundColor: line.color }}>
                  {line.code}
                </span>
                <div className="line-text-info">
                  <strong className="line-name">{line.name}</strong>
                  <span className="line-route">{line.route}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

