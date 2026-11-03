// Definición de tipos para las Guías de Supervivencia y Destino
export interface EmergencyService {
  label: string;
  number: string;
  desc: string;
}

export interface TransitPassInfo {
  name: string;
  type: string;
  description: string;
  rechargeMethod: string;
  howToPay: string;
}

export interface ElectricalInfo {
  plugTypes: string[];
  voltage: string;
  frequency: string;
  adapterNeeded: string;
}

export interface MoneyEtiquette {
  tippingPolicy: string;
  cardVsCash: string;
  cashAdvice: string;
}

export interface RecommendedApp {
  name: string;
  desc: string;
  category: 'transporte' | 'pagos' | 'mapas' | 'general';
}

export interface MetroLineInfo {
  code: string;
  name: string;
  color: string;
  route: string;
}

export interface GuideCustomTip {
  category: string;
  title: string;
  content: string;
  badge: string;
}

export interface DestinationGuide {
  countryCode: string;
  countryName: string;
  flagEmoji: string;
  city: string;
  tagline: string;
  intro: string;
  emergency: EmergencyService[];
  transit: TransitPassInfo;
  metroLines?: MetroLineInfo[];
  plugs: ElectricalInfo;
  money: MoneyEtiquette;
  apps: RecommendedApp[];
  customTips: GuideCustomTip[];
}

