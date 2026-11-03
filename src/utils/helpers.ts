// Utilidades de mapas, enlaces, banderas y formateo de divisas con soporte de Dólar Blue y Top 50 Países
import { Activity } from '../types/activity';
import { Expense } from '../types/expense';

export interface CurrencyInfo {
  code: string;
  flag: string;
  symbol: string;
  name: string;
  locale: string;
  decimals: number;
}

export const COUNTRY_FLAGS: Record<string, string> = {
  AR: '🇦🇷', US: '🇺🇸', MX: '🇲🇽', CO: '🇨🇴', BR: '🇧🇷',
  PE: '🇵🇪', CL: '🇨🇱', CA: '🇨🇦', CR: '🇨🇷', PA: '🇵🇦',
  DO: '🇩🇴', EC: '🇪🇨', UY: '🇺🇾', ES: '🇪🇸', FR: '🇫🇷',
  IT: '🇮🇹', GB: '🇬🇧', DE: '🇩🇪', PT: '🇵🇹', GR: '🇬🇷',
  CH: '🇨🇭', NL: '🇳🇱', AT: '🇦🇹', IE: '🇮🇪', BE: '🇧🇪',
  CZ: '🇨🇿', HU: '🇭🇺', PL: '🇵🇱', HR: '🇭🇷', SE: '🇸🇪',
  NO: '🇳🇴', DK: '🇩🇰', IS: '🇮🇸', JP: '🇯🇵', TH: '🇹🇭',
  TR: '🇹🇷', KR: '🇰🇷', VN: '🇻🇳', ID: '🇮🇩', AE: '🇦🇪',
  SG: '🇸🇬', MY: '🇲🇾', PH: '🇵🇭', IN: '🇮🇳', CN: '🇨🇳',
  SA: '🇸🇦', EG: '🇪🇬', MA: '🇲🇦', ZA: '🇿🇦', AU: '🇦🇺',
  NZ: '🇳🇿'
};

export const CURRENCY_REGISTRY: Record<string, CurrencyInfo> = {
  ARS: { code: 'ARS', flag: '🇦🇷', symbol: '$', name: 'Peso Argentino', locale: 'es-AR', decimals: 0 },
  USD: { code: 'USD', flag: '🇺🇸', symbol: '$', name: 'Dólar Estadounidense', locale: 'en-US', decimals: 2 },
  EUR: { code: 'EUR', flag: '🇪🇺', symbol: '€', name: 'Euro', locale: 'de-DE', decimals: 2 },
  JPY: { code: 'JPY', flag: '🇯🇵', symbol: '¥', name: 'Yen Japonés', locale: 'ja-JP', decimals: 0 },
  GBP: { code: 'GBP', flag: '🇬🇧', symbol: '£', name: 'Libra Esterlina', locale: 'en-GB', decimals: 2 },
  COP: { code: 'COP', flag: '🇨🇴', symbol: '$', name: 'Peso Colombiano', locale: 'es-CO', decimals: 0 },
  MXN: { code: 'MXN', flag: '🇲🇽', symbol: '$', name: 'Peso Mexicano', locale: 'es-MX', decimals: 2 },
  BRL: { code: 'BRL', flag: '🇧🇷', symbol: 'R$', name: 'Real Brasileño', locale: 'pt-BR', decimals: 2 },
  CAD: { code: 'CAD', flag: '🇨🇦', symbol: 'CA$', name: 'Dólar Canadiense', locale: 'en-CA', decimals: 2 },
  AUD: { code: 'AUD', flag: '🇦🇺', symbol: 'A$', name: 'Dólar Australiano', locale: 'en-AU', decimals: 2 },
  CHF: { code: 'CHF', flag: '🇨🇭', symbol: 'CHF', name: 'Franco Suizo', locale: 'de-CH', decimals: 2 },
  CLP: { code: 'CLP', flag: '🇨🇱', symbol: '$', name: 'Peso Chileno', locale: 'es-CL', decimals: 0 },
  PEN: { code: 'PEN', flag: '🇵🇪', symbol: 'S/', name: 'Sol Peruano', locale: 'es-PE', decimals: 2 },
  UYU: { code: 'UYU', flag: '🇺🇾', symbol: '$U', name: 'Peso Uruguayo', locale: 'es-UY', decimals: 0 },
  CRC: { code: 'CRC', flag: '🇨🇷', symbol: '₡', name: 'Colón Costarricense', locale: 'es-CR', decimals: 0 },
  DOP: { code: 'DOP', flag: '🇩🇴', symbol: 'RD$', name: 'Peso Dominicano', locale: 'es-DO', decimals: 2 },
  THB: { code: 'THB', flag: '🇹🇭', symbol: '฿', name: 'Baht Tailandés', locale: 'th-TH', decimals: 0 },
  TRY: { code: 'TRY', flag: '🇹🇷', symbol: '₺', name: 'Lira Turca', locale: 'tr-TR', decimals: 2 },
  KRW: { code: 'KRW', flag: '🇰🇷', symbol: '₩', name: 'Won Surcoreano', locale: 'ko-KR', decimals: 0 },
  VND: { code: 'VND', flag: '🇻🇳', symbol: '₫', name: 'Dong Vietnamita', locale: 'vi-VN', decimals: 0 },
  IDR: { code: 'IDR', flag: '🇮🇩', symbol: 'Rp', name: 'Rupia Indonesia', locale: 'id-ID', decimals: 0 },
  AED: { code: 'AED', flag: '🇦🇪', symbol: 'AED', name: 'Dírham de EAU', locale: 'ar-AE', decimals: 2 },
  SG: { code: 'SGD', flag: '🇸🇬', symbol: 'S$', name: 'Dólar de Singapur', locale: 'en-SG', decimals: 2 },
  MYR: { code: 'MYR', flag: '🇲🇾', symbol: 'RM', name: 'Ringgit Malayo', locale: 'ms-MY', decimals: 2 },
  PHP: { code: 'PHP', flag: '🇵🇭', symbol: '₱', name: 'Peso Filipino', locale: 'fil-PH', decimals: 2 },
  INR: { code: 'INR', flag: '🇮🇳', symbol: '₹', name: 'Rupia India', locale: 'hi-IN', decimals: 2 },
  CNY: { code: 'CNY', flag: '🇨🇳', symbol: '¥', name: 'Yuan Chino', locale: 'zh-CN', decimals: 2 },
  SAR: { code: 'SAR', flag: '🇸🇦', symbol: '﷼', name: 'Riyal Saudí', locale: 'ar-SA', decimals: 2 },
  EGP: { code: 'EGP', flag: '🇪🇬', symbol: 'E£', name: 'Libra Egipcia', locale: 'ar-EG', decimals: 2 },
  MAD: { code: 'MAD', flag: '🇲🇦', symbol: 'DH', name: 'Dírham Marroquí', locale: 'ar-MA', decimals: 2 },
  ZAR: { code: 'ZAR', flag: '🇿🇦', symbol: 'R', name: 'Rand Sudafricano', locale: 'en-ZA', decimals: 2 },
  NZD: { code: 'NZD', flag: '🇳🇿', symbol: 'NZ$', name: 'Dólar Neozelandés', locale: 'en-NZ', decimals: 2 },
  SEK: { code: 'SEK', flag: '🇸🇪', symbol: 'kr', name: 'Corona Sueca', locale: 'sv-SE', decimals: 2 },
  NOK: { code: 'NOK', flag: '🇳🇴', symbol: 'kr', name: 'Corona Noruega', locale: 'nb-NO', decimals: 2 },
  DKK: { code: 'DKK', flag: '🇩🇰', symbol: 'kr', name: 'Corona Danesa', locale: 'da-DK', decimals: 2 },
  CZK: { code: 'CZK', flag: '🇨🇿', symbol: 'Kč', name: 'Corona Checa', locale: 'cs-CZ', decimals: 0 },
  HUF: { code: 'HUF', flag: '🇭🇺', symbol: 'Ft', name: 'Florín Húngaro', locale: 'hu-HU', decimals: 0 },
  PLN: { code: 'PLN', flag: '🇵🇱', symbol: 'zł', name: 'Zloty Polaco', locale: 'pl-PL', decimals: 2 },
  ISK: { code: 'ISK', flag: '🇮🇸', symbol: 'kr', name: 'Corona Islandesa', locale: 'is-IS', decimals: 0 }
};

export const getCurrencyFlag = (currencyCode?: string, countryCode?: string): string => {
  if (countryCode && COUNTRY_FLAGS[countryCode.toUpperCase()]) {
    return COUNTRY_FLAGS[countryCode.toUpperCase()];
  }
  const clean = (currencyCode || '').toUpperCase();
  return CURRENCY_REGISTRY[clean]?.flag || '🌍';
};

export const getCurrencySymbol = (currencyCode?: string): string => {
  const clean = (currencyCode || '').toUpperCase();
  return CURRENCY_REGISTRY[clean]?.symbol || '$';
};

export const getCurrencyName = (currencyCode?: string): string => {
  const clean = (currencyCode || '').toUpperCase();
  return CURRENCY_REGISTRY[clean]?.name || currencyCode || 'Divisa';
};

/**
 * Universal Currency Formatter for any of the Top 50 global destinations.
 */
export const formatCurrency = (
  amount: number | string | null | undefined,
  currencyCode = 'USD',
  options?: {
    showFlag?: boolean;
    showCode?: boolean;
    countryCode?: string;
    maximumFractionDigits?: number;
    minimumFractionDigits?: number;
  }
): string => {
  const cleanAmount = parseCurrencyNumber(amount);
  const code = (currencyCode || 'USD').toUpperCase();
  const info = CURRENCY_REGISTRY[code];

  let formatted = '';
  try {
    const locale = info?.locale || (code === 'USD' ? 'en-US' : 'es-AR');
    const decimals = options?.maximumFractionDigits !== undefined 
      ? options.maximumFractionDigits 
      : (info ? info.decimals : 2);

    formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: decimals,
      minimumFractionDigits: options?.minimumFractionDigits !== undefined ? options.minimumFractionDigits : 0
    }).format(cleanAmount);
  } catch {
    const sym = info?.symbol || '$';
    formatted = `${sym} ${cleanAmount.toLocaleString()}`;
  }

  const parts = [];
  if (options?.showFlag) {
    const flag = getCurrencyFlag(code, options.countryCode);
    parts.push(flag);
  }
  parts.push(formatted);
  if (options?.showCode && !formatted.includes(code)) {
    parts.push(code);
  }

  return parts.join(' ');
};

/**
 * Retained for 100% backward compatibility with original Argentine views
 */
export const formatCurrencyARS = (amount: number | string | null | undefined): string => {
  return formatCurrency(amount, 'ARS');
};

export const formatCurrencyUSD = (amountLocal: number | string | null | undefined, rate = 1540): string => {
  const safeRate = (Number(rate) && Number(rate) > 0) ? Number(rate) : 1540;
  const num = parseCurrencyNumber(amountLocal);
  const usd = num / safeRate;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  }).format(usd);
};

export const convertUsdToArs = (amountUSD: number | string | null | undefined, rate = 1540): number => {
  const safeRate = (Number(rate) && Number(rate) > 0) ? Number(rate) : 1540;
  const num = parseCurrencyNumber(amountUSD);
  return Math.round(num * safeRate);
};

export const getGoogleMapsTransitUrl = (activity: Partial<Activity>): string => {
  if (activity.coords && activity.coords.length === 2) {
    const [lat, lng] = activity.coords;
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=transit`;
  }
  const query = encodeURIComponent(`${activity.address || activity.title || 'Buenos Aires'}, Argentina`);
  return `https://www.google.com/maps/dir/?api=1&destination=${query}&travelmode=transit`;
};

export const getCategoryBadge = (category: string) => {
  const map: Record<string, { label: string; bg: string; color: string; icon: string }> = {
    transporte: { label: "Transporte", bg: "#e0f2fe", color: "#0284c7", icon: "Bus" },
    cultura: { label: "Cultura & Paseo", bg: "#ede9fe", color: "#6d28d9", icon: "Landmark" },
    gastronomia: { label: "Gastronomía", bg: "#fef3c7", color: "#b45309", icon: "Utensils" },
    naturaleza: { label: "Naturaleza & Parques", bg: "#d1fae5", color: "#047857", icon: "Trees" },
    compras: { label: "Compras", bg: "#fce7f3", color: "#be185d", icon: "ShoppingBag" },
    vida_nocturna: { label: "Vida Nocturna", bg: "#e0e7ff", color: "#4338ca", icon: "Moon" },
    relax: { label: "Relax & Casa", bg: "#ccfbf1", color: "#0f766e", icon: "Coffee" },
  };
  return map[category] || { label: "General", bg: "#f1f5f9", color: "#475569", icon: "MapPin" };
};

export const normalizeText = (text: string | null | undefined): string => {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[\p{Emoji}\p{Extended_Pictographic}]/gu, '') // remove emojis
    .replace(/[^a-z0-9]/g, '') // keep only alphanumeric
    .trim();
};

export const isActivityTrackedInExpenses = (activity: Partial<Activity> | null | undefined, expenses: Expense[] = []): boolean => {
  if (!activity) return false;
  const actId = activity.id;
  const cleanActTitle = normalizeText(activity.title);

  // Special case: Feria de San Telmo (act-2-2) is tracked by the individual shopping items (exp-5 to exp-9)
  if (actId === 'act-2-2') {
    const hasSanTelmoItems = expenses.some(e => 
      ['exp-5', 'exp-6', 'exp-7', 'exp-8', 'exp-9'].includes(e.id) ||
      (e.concept && (e.concept.toLowerCase().includes('pezuña') || e.concept.toLowerCase().includes('imanes') || e.concept.toLowerCase().includes('mates')))
    );
    if (hasSanTelmoItems) return true;
  }

  return expenses.some(exp => {
    // 1. Direct activityId match
    if (exp.activityId && (exp.activityId === actId || exp.activityId === actId.replace('itinerary-', ''))) {
      return true;
    }
    // 2. ID match
    if (exp.id === actId || exp.id === `itinerary-${actId}` || exp.id === `exp-${actId}`) {
      return true;
    }
    // 3. Concept title match
    const cleanExpConcept = normalizeText(exp.concept);
    if (!cleanExpConcept || !cleanActTitle) return false;

    if (cleanExpConcept === cleanActTitle) return true;

    // Substring match
    if (cleanActTitle.includes(cleanExpConcept) || cleanExpConcept.includes(cleanActTitle)) {
      return true;
    }

    // Keyword matching for high confidence phrases
    const keywords = ['ecoparque', 'bellgamba', 'alberro', 'recoleta', 'puertomadero', 'sube', 'alfajores', 'discoteca'];
    for (const kw of keywords) {
      if (cleanActTitle.includes(kw) && cleanExpConcept.includes(kw)) {
        return true;
      }
    }

    return false;
  });
};

export const getExpensePaymentMethod = (exp: Expense | null | undefined): 'efectivo' | 'tarjeta' => {
  if (!exp) return 'efectivo';
  if (exp.paymentMethod) {
    return exp.paymentMethod.toLowerCase() === 'tarjeta' ? 'tarjeta' : 'efectivo';
  }
  const text = `${exp.paidBy || ''} ${exp.note || ''} ${exp.concept || ''}`.toLowerCase();
  if (text.includes('tarjeta') || text.includes('nu') || text.includes('credit') || text.includes('debit')) {
    return 'tarjeta';
  }
  return 'efectivo';
};

/**
 * Universal number parser supporting Latin American / European / International notation:
 * - Divisores de miles con punto o coma: "19.741" -> 19741, "19,741" -> 19741, "1.019.741" -> 1019741
 * - Decimales estándar: "19.741,50" -> 19741.5, "19,741.50" -> 19741.5, "19.741.00" -> 19741
 * - Cantidades decimales: "1.25" -> 1.25, "0.50" -> 0.5
 * - Formato simple: "19741" -> 19741
 */
export const parseCurrencyNumber = (val: any): number => {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;

  let s = String(val).replace(/[^0-9.,]/g, '').trim();
  if (!s) return 0;

  // Case 1: Both dot and comma present (e.g. 19.741,50 or 19,741.50)
  if (s.includes('.') && s.includes(',')) {
    const lastDot = s.lastIndexOf('.');
    const lastComma = s.lastIndexOf(',');
    if (lastComma > lastDot) {
      // 19.741,50 -> dot is thousands, comma is decimal
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      // 19,741.50 -> comma is thousands, dot is decimal
      s = s.replace(/,/g, '');
    }
  } 
  // Case 2: Only dots present
  else if (s.includes('.') && !s.includes(',')) {
    const parts = s.split('.');
    if (parts.length > 2) {
      // e.g. 1.019.741 or 19.741.00
      const lastPart = parts[parts.length - 1];
      if (lastPart.length === 2) {
        // e.g. 19.741.00 (POS ticket with .00 cents)
        s = parts.slice(0, -1).join('') + '.' + lastPart;
      } else {
        // 1.019.741 -> 1019741
        s = parts.join('');
      }
    } else if (parts.length === 2) {
      if (parts[1].length === 3) {
        // Thousands separator! 19.741 -> 19741
        s = parts[0] + parts[1];
      }
      // If 1 or 2 digits, keep as decimal (e.g. 1.25 kg, 0.5)
    }
  } 
  // Case 3: Only commas present
  else if (s.includes(',') && !s.includes('.')) {
    const parts = s.split(',');
    if (parts.length > 2) {
      const lastPart = parts[parts.length - 1];
      if (lastPart.length === 2) {
        s = parts.slice(0, -1).join('') + '.' + lastPart;
      } else {
        s = parts.join('');
      }
    } else if (parts.length === 2) {
      if (parts[1].length === 3) {
        // Thousands separator! 19,741 -> 19741
        s = parts[0] + parts[1];
      } else {
        // Decimal: 19,5 -> 19.5
        s = s.replace(',', '.');
      }
    }
  }

  const valNum = parseFloat(s);
  return isNaN(valNum) ? 0 : valNum;
};

/**
 * Normalizes an arithmetic expression with thousands separators so eval/Function evaluates correctly:
 * - "19.741 + 5.000" -> "19741 + 5000" = 24741
 * - "1.019.741" -> "1019741"
 */
export const cleanCalcExpression = (expr: string | null | undefined): string => {
  if (!expr || typeof expr !== 'string') return '';
  let s = expr.replace(/×/g, '*').replace(/÷/g, '/');

  // Loop to remove all thousands dots/commas
  let prev;
  do {
    prev = s;
    s = s.replace(/(\d+)[.,](\d{3})(?!\d)/g, '$1$2');
  } while (s !== prev);

  // Remaining commas with decimals (e.g. 1,5) become 1.5
  s = s.replace(/,/g, '.');
  return s;
};
