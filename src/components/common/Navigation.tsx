import React from 'react';
import { Plane, CalendarDays, MapPin, Wallet, Compass, CheckSquare } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const tabs = [
    { id: 'viajes', label: 'Mis Viajes', icon: Plane, badge: 'Hub' },
    { id: 'itinerario', label: 'Itinerario', icon: CalendarDays, badge: 'Días' },
    { id: 'mapa', label: 'Mapa', icon: MapPin, badge: 'Pines' },
    { id: 'gastos', label: 'Billetera', icon: Wallet, badge: 'Hub' },
    { id: 'tips', label: 'Guía', icon: Compass, badge: 'Tips' },
    { id: 'checklist', label: 'Checklist', icon: CheckSquare, badge: 'Equipaje' },
  ];

  return (
    <nav className="app-nav">
      <div className="nav-container">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-tab-btn ${isActive ? 'active' : ''}`}
              aria-selected={isActive}
            >
              <div className="nav-icon-wrapper">
                <Icon size={20} className="nav-icon" />
              </div>
              <span className="nav-label">{tab.label}</span>
              {isActive && <span className="nav-indicator-pill"></span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
