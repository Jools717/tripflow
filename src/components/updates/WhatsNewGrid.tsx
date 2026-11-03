import React from 'react';
import { Globe, User, Zap, Receipt, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { CURRENT_RELEASE, ReleaseFeature } from './versionConfig';

interface WhatsNewGridProps {
  onContinue: () => void;
  isBackgroundUpdate?: boolean;
}

export default function WhatsNewGrid({
  onContinue,
  isBackgroundUpdate = false
}: WhatsNewGridProps) {
  const getFeatureIcon = (iconName: ReleaseFeature['icon']) => {
    switch (iconName) {
      case 'Globe':
        return <Globe size={20} className="text-emerald" />;
      case 'User':
        return <User size={20} className="text-sky" />;
      case 'Zap':
        return <Zap size={20} className="text-amber" />;
      case 'Receipt':
        return <Receipt size={20} className="text-purple" />;
      case 'ShieldCheck':
      default:
        return <ShieldCheck size={20} className="text-sky" />;
    }
  };

  return (
    <div className="whats-new-container animate-fade-in">
      
      {/* Header */}
      <div className="whats-new-header">
        <div className="whats-new-version-pill">
          <Sparkles size={14} />
          <span>Novedades v{CURRENT_RELEASE.version} · {CURRENT_RELEASE.releaseDate}</span>
        </div>
        <h2 className="whats-new-title">{CURRENT_RELEASE.title}</h2>
        <p className="whats-new-subtitle">
          {isBackgroundUpdate
            ? 'Una nueva versión fue desplegada mientras usabas la app. Descubre las nuevas mejoras integradas:'
            : CURRENT_RELEASE.subtitle}
        </p>
      </div>

      {/* Grid of New Features */}
      <div className="whats-new-cards-grid">
        {CURRENT_RELEASE.features.map((feature) => (
          <div key={feature.id} className="whats-new-feature-card">
            
            <div className="feature-card-top-row">
              <div className="feature-icon-bubble">
                {getFeatureIcon(feature.icon)}
              </div>
              <span
                className="feature-badge-pill"
                style={{
                  backgroundColor: `${feature.badgeColor}18`,
                  color: feature.badgeColor,
                  borderColor: `${feature.badgeColor}40`
                }}
              >
                {feature.badge}
              </span>
            </div>

            <div className="feature-card-content">
              <h4 className="feature-title">{feature.title}</h4>
              <p className="feature-desc">{feature.description}</p>
            </div>

          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="whats-new-footer">
        <div className="update-safety-guarantee-banner">
          <span>🔒</span>
          <span>Tus viajes, itinerarios y gastos están 100% protegidos y respaldados automáticamente.</span>
        </div>

        <button
          type="button"
          className="btn-primary btn-block btn-whats-new-continue"
          onClick={onContinue}
        >
          <span>{isBackgroundUpdate ? 'Actualizar Aplicación y Continuar' : 'Continuar a mi Viaje'}</span>
          <ArrowRight size={18} />
        </button>
      </div>

    </div>
  );
}
