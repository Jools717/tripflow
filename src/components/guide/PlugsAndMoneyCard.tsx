import React from 'react';
import { Zap, Coins, CreditCard, Banknote, HelpCircle } from 'lucide-react';
import { ElectricalInfo, MoneyEtiquette } from '../../types/guide';

interface PlugsAndMoneyCardProps {
  plugs: ElectricalInfo;
  money: MoneyEtiquette;
  countryName: string;
}

export default function PlugsAndMoneyCard({ plugs, money, countryName }: PlugsAndMoneyCardProps) {
  return (
    <div className="guide-split-grid animate-fade-in">
      {/* Plugs & Electricity Card */}
      <div className="guide-card-box plug-card">
        <div className="guide-box-header">
          <div className="box-icon-badge text-amber">
            <Zap size={18} />
          </div>
          <div>
            <h4 className="box-title">Enchufes & Voltaje</h4>
            <span className="box-subtitle">Norma eléctrica en {countryName}</span>
          </div>
        </div>

        <div className="plug-badges-row">
          {plugs.plugTypes.map((type, idx) => (
            <span key={idx} className="plug-pill-badge">
              🔌 {type}
            </span>
          ))}
        </div>

        <div className="voltage-meta-row">
          <div className="voltage-meta-item">
            <span className="meta-label">Voltaje:</span>
            <span className="meta-value">{plugs.voltage}</span>
          </div>
          <div className="voltage-meta-item">
            <span className="meta-label">Frecuencia:</span>
            <span className="meta-value">{plugs.frequency}</span>
          </div>
        </div>

        <div className="plug-advice-note">
          <HelpCircle size={13} className="text-sky" />
          <span>{plugs.adapterNeeded}</span>
        </div>
      </div>

      {/* Money & Tipping Etiquette Card */}
      <div className="guide-card-box money-card">
        <div className="guide-box-header">
          <div className="box-icon-badge text-emerald">
            <Coins size={18} />
          </div>
          <div>
            <h4 className="box-title">Dinero & Propinas</h4>
            <span className="box-subtitle">Cultura de pago y efectivo</span>
          </div>
        </div>

        <div className="tipping-highlight-box">
          <span className="tipping-label">🍽️ Política de Propinas:</span>
          <p className="tipping-text">{money.tippingPolicy}</p>
        </div>

        <div className="card-cash-split">
          <div className="split-item">
            <CreditCard size={14} className="text-sky" />
            <div>
              <strong>Tarjeta vs. Efectivo:</strong>
              <p>{money.cardVsCash}</p>
            </div>
          </div>
          <div className="split-item">
            <Banknote size={14} className="text-emerald" />
            <div>
              <strong>Consejo de Cajeros / Cambio:</strong>
              <p>{money.cashAdvice}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

