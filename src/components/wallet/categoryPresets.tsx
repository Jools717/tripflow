import React from 'react';
import {
  ShoppingCart, Gift, Utensils, Bus, Ticket, ShoppingBag,
  Receipt, Tag, Wallet
} from 'lucide-react';
import { cleanCalcExpression } from '../../utils/helpers';

export interface CategoryPresetItem {
  name: string;
  defaultPrice: number;
  icon: string;
}

export const CATEGORY_PRESETS: Record<string, CategoryPresetItem[]> = {
  mercado: [
    { name: 'Medialunas / Facturas (docena)', defaultPrice: 4800, icon: '🥐' },
    { name: 'Leche, yogur y manteca', defaultPrice: 3600, icon: '🥛' },
    { name: 'Pan fresco / Tostadas', defaultPrice: 1800, icon: '🥖' },
    { name: 'Queso y jamón para picada', defaultPrice: 7500, icon: '🧀' },
    { name: 'Frutas y verduras frescas', defaultPrice: 5200, icon: '🍎' },
    { name: 'Carne / Milanesas / Pollo', defaultPrice: 13500, icon: '🥩' },
    { name: 'Yerba Mate y café molido', defaultPrice: 4500, icon: '🧉' },
    { name: 'Agua mineral y gaseosas', defaultPrice: 3200, icon: '💧' },
    { name: 'Vino Malbec / Cervezas', defaultPrice: 5800, icon: '🍷' }
  ],
  compras: [
    { name: 'Camiseta de fútbol / AFA', defaultPrice: 25000, icon: '👕' },
    { name: 'Botella térmica / Botilito', defaultPrice: 20000, icon: '🍶' },
    { name: 'Mate de alpaca y bombilla', defaultPrice: 18000, icon: '🧉' },
    { name: 'Pack medias de diseño (x3)', defaultPrice: 15000, icon: '🧦' },
    { name: 'Billetera / cinturón de cuero', defaultPrice: 16000, icon: '👛' },
    { name: 'Libros El Ateneo Splendid', defaultPrice: 14500, icon: '📚' },
    { name: 'Imanes y postales San Telmo', defaultPrice: 12000, icon: '🧲' },
    { name: 'Zapatillas / Calzado outlet', defaultPrice: 45000, icon: '👟' },
    { name: 'Mochila / Bolso de cuero', defaultPrice: 32000, icon: '🎒' }
  ],
  regalos: [
    { name: 'Caja Alfajores Havanna (x12)', defaultPrice: 16500, icon: '🍫' },
    { name: 'Mate de calabaza & Bombilla', defaultPrice: 18000, icon: '🧉' },
    { name: 'Frasco Dulce de Leche artesanal', defaultPrice: 4200, icon: '🍯' },
    { name: 'Vino Malbec de Colección', defaultPrice: 12000, icon: '🍷' },
    { name: 'Remera Argentina / AFA', defaultPrice: 22000, icon: '👕' },
    { name: 'Llaveros y recuerdos de San Telmo', defaultPrice: 5000, icon: '🎁' },
    { name: 'Chocolates Rapanui / Fra-nui', defaultPrice: 8500, icon: '🍓' },
    { name: 'Caja Alfajores Cachafaz (x6)', defaultPrice: 9800, icon: '🍪' }
  ],
  gastronomia: [
    { name: 'Café + 2 Medialunas', defaultPrice: 4500, icon: '☕' },
    { name: 'Menú Ejecutivo mediodía', defaultPrice: 12500, icon: '🍽️' },
    { name: 'Asado / Parrilla porteña', defaultPrice: 28000, icon: '🥩' },
    { name: 'Pizza grande + Fainá Güerrín', defaultPrice: 16000, icon: '🍕' },
    { name: 'Docena Empanadas criollas', defaultPrice: 18000, icon: '🥟' },
    { name: "1/4 kg Helado Rapanui / Lucciano's", defaultPrice: 6200, icon: '🍨' },
    { name: 'Trago de autor / Vermut bar', defaultPrice: 9500, icon: '🍸' },
    { name: 'Picada completa para compartir', defaultPrice: 22000, icon: '🧀' }
  ],
  transporte: [
    { name: 'Carga SUBE semanal', defaultPrice: 15000, icon: '💳' },
    { name: 'Viaje individual Subte', defaultPrice: 750, icon: '🚇' },
    { name: 'Cabify / Uber trayecto medio', defaultPrice: 7500, icon: '🚕' },
    { name: 'Taxi nocturno San Telmo/Palermo', defaultPrice: 9000, icon: '🚖' },
    { name: 'Traslado Ezeiza (Tienda León/Taxi)', defaultPrice: 34000, icon: '✈️' },
    { name: 'Traslado Aeroparque Jorge Newbery', defaultPrice: 12000, icon: '🛬' }
  ],
  cultura: [
    { name: 'Visita guiada Teatro Colón', defaultPrice: 34000, icon: '🎭' },
    { name: 'Entrada Museo MALBA', defaultPrice: 8500, icon: '🏛️' },
    { name: 'Entrada Museo Boca / River', defaultPrice: 47000, icon: '⚽' },
    { name: 'Show de Tango + Cena/Copa', defaultPrice: 45000, icon: '💃' },
    { name: 'Entrada Jardín Japonés', defaultPrice: 4500, icon: '🌸' },
    { name: 'Espectáculo Calle Corrientes', defaultPrice: 25000, icon: '🎟️' }
  ],
  varios: [
    { name: 'Farmacia / Protector solar', defaultPrice: 9500, icon: '💊' },
    { name: 'Chip SIM / Prepago celulares', defaultPrice: 12000, icon: '📱' },
    { name: 'Propinas y efectivo del día', defaultPrice: 3000, icon: '💵' },
    { name: 'Servicio Lavandería x kilo', defaultPrice: 11000, icon: '🧺' },
    { name: 'Artículos aseo e higiene', defaultPrice: 6500, icon: '🧼' }
  ]
};

export const GENERIC_PRESETS: CategoryPresetItem[] = [
  { name: 'Gasto menor / Kiosco', defaultPrice: 3500, icon: '🍬' },
  { name: 'Café / Bebida al paso', defaultPrice: 4500, icon: '☕' },
  { name: 'Almuerzo / Comida rápida', defaultPrice: 12000, icon: '🥪' },
  { name: 'Salida / Paseo recreativo', defaultPrice: 18000, icon: '🎟️' },
  { name: 'Compra en comercio', defaultPrice: 25000, icon: '🛍️' },
  { name: 'Traslado urbano / Taxi', defaultPrice: 8500, icon: '🚕' }
];

const ICON_MAP: Record<string, any> = {
  ShoppingCart,
  Gift,
  Utensils,
  Bus,
  Ticket,
  ShoppingBag,
  Receipt,
  Tag,
  Wallet,
  mercado: ShoppingCart,
  regalos: Gift,
  gastronomia: Utensils,
  transporte: Bus,
  cultura: Ticket,
  compras: ShoppingBag,
  varios: Receipt
};

export const renderCategoryIcon = (iconNameOrId: string, size = 18, style: React.CSSProperties = {}) => {
  const IconComp = ICON_MAP[iconNameOrId] || Tag;
  return <IconComp size={size} style={style} />;
};

export function safeEvaluateExpression(rawExpr: string): number {
  if (!rawExpr || typeof rawExpr !== 'string') return 0;
  let cleaned = cleanCalcExpression(rawExpr);

  cleaned = cleaned.replace(/[+\-*/.]+$/, '').trim();
  if (!cleaned) return 0;

  if (!/^[\d\s+\-*/.()]+$/.test(cleaned)) return 0;

  try {
    const result = new Function(`'use strict'; return (${cleaned})`)();
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return result;
    }
    return 0;
  } catch {
    return 0;
  }
}
