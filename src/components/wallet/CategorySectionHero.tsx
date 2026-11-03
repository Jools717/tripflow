import React from 'react';
import { ExpenseCategory } from '../../types/category';
import { formatCurrencyARS } from '../../utils/helpers';
import { renderCategoryIcon } from './categoryPresets';

interface CategorySectionHeroProps {
  category: ExpenseCategory;
  totalCatUSD: number;
  totalCatARS: number;
  recordsCount: number;
  remainingUSD: number;
}

export default function CategorySectionHero({
  category,
  totalCatUSD,
  totalCatARS,
  recordsCount,
  remainingUSD
}: CategorySectionHeroProps) {
  return (
    <div className="dynamic-section-hero" style={{ borderColor: `${category.color}40` }}>
      <div className="section-hero-top">
        <div className="section-avatar" style={{ backgroundColor: `${category.color}20`, color: category.color }}>
          {renderCategoryIcon(category.icon || category.id, 26)}
        </div>

        <div className="section-titles">
          <div className="section-tag-pill" style={{ backgroundColor: `${category.color}20`, color: category.color }}>
            <span>Categoría del Viaje</span>
          </div>
          <h2>{category.name}</h2>
          <p className="section-subtitle">
            Calcula, escanea tickets y registra gastos específicos de {category.name}.
            Todos los gastos se acumulan en tu <strong>Billetera de $1.000 USD Blue</strong>.
          </p>
        </div>
      </div>

      <div className="section-kpis-grid">
        <div className="section-kpi-pill">
          <span className="kpi-pill-title">Gasto en {category.name}</span>
          <div className="kpi-pill-dual">
            <span className="kpi-usd">${totalCatUSD.toFixed(1)} <small>USD Blue</small></span>
            <span className="kpi-ars">({formatCurrencyARS(totalCatARS)})</span>
          </div>
        </div>

        <div className="section-kpi-pill">
          <span className="kpi-pill-title">Registros</span>
          <div className="kpi-pill-dual">
            <span className="kpi-usd text-emerald">{recordsCount}</span>
            <span className="kpi-ars">comprobantes / gastos</span>
          </div>
        </div>

        <div className="section-kpi-pill highlight">
          <span className="kpi-pill-title">Disponible en Billetera</span>
          <div className="kpi-pill-dual">
            <span className="kpi-usd text-emerald">${Math.round(remainingUSD)} <small>USD</small></span>
            <span className="kpi-ars">de $1.000 USD</span>
          </div>
        </div>
      </div>
    </div>
  );
}

