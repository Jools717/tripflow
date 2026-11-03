import React, { useState } from 'react';
import { Smartphone, Sparkles, Compass, Lightbulb } from 'lucide-react';
import { RecommendedApp, GuideCustomTip } from '../../types/guide';

interface CityTipsListProps {
  apps: RecommendedApp[];
  tips: GuideCustomTip[];
  cityName: string;
}

export default function CityTipsList({ apps, tips, cityName }: CityTipsListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(tips.map(t => t.category)))];

  const filteredTips = selectedCategory === 'all'
    ? tips
    : tips.filter(t => t.category === selectedCategory);

  return (
    <div className="guide-tips-and-apps-section animate-fade-in">
      {/* Recommended Smartphone Apps */}
      <div className="guide-apps-box">
        <div className="guide-box-header">
          <div className="box-icon-badge text-sky">
            <Smartphone size={18} />
          </div>
          <div>
            <h4 className="box-title">Apps Esenciales para tu Celular</h4>
            <span className="box-subtitle">Descárgalas antes de aterrizar en {cityName}</span>
          </div>
        </div>

        <div className="guide-apps-grid">
          {apps.map((app, idx) => (
            <div key={idx} className="guide-app-card">
              <div className="app-card-title-row">
                <span className="app-name-strong">{app.name}</span>
                <span className="app-category-badge">{app.category}</span>
              </div>
              <p className="app-desc-text">{app.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Local Wisdom & Secrets */}
      <div className="guide-custom-tips-box">
        <div className="tips-box-header-row">
          <div className="guide-box-header">
            <div className="box-icon-badge text-amber">
              <Lightbulb size={18} />
            </div>
            <div>
              <h4 className="box-title">Consejos & Claves Locales</h4>
              <span className="box-subtitle">Secretos para moverte como un local</span>
            </div>
          </div>

          {categories.length > 2 && (
            <div className="tips-filter-pills">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`tip-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'all' ? 'Todos' : cat}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="custom-tips-list">
          {filteredTips.map((tip, idx) => (
            <div key={idx} className="custom-tip-card">
              <div className="tip-header-row">
                <span className="tip-badge-tag">{tip.badge}</span>
                <h5 className="tip-title">{tip.title}</h5>
              </div>
              <p className="tip-content">{tip.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

