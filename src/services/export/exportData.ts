// Datos normalizados para exportar un viaje (PDF, calendario .ics y resumen para compartir)
import { Activity } from '../../types/activity';
import { Expense } from '../../types/expense';
import { Trip } from '../../types/trip';
import { generateTripDays } from '../../data/initialData';
import { parseLocalDate, parseCurrencyNumber, formatCurrency, getExpensePaymentMethod } from '../../utils/helpers';

export interface ExportDay {
  dayNumber: number;
  date: string; // YYYY-MM-DD
  label: string; // "sáb, 10 oct"
  activities: Activity[];
}

export interface ExportMoney {
  localCurrency: string;
  baseCurrency: string;
  rate: number; // 1 base = rate local
  budgetBase: number;
  spentLocal: number;
  spentBase: number;
  remainingBase: number;
  cashLocal: number;
  cardLocal: number;
}

export interface TripExportInput {
  trip: Trip;
  activities: Activity[];
  expenses: Expense[];
  exchangeRate: number;
  totalSpentLocal: number;
}

/** Extrae hora y minutos de "11:00", "9:30 hs", "21.15". Devuelve null si no hay hora. */
export const parseActivityTime = (time?: string): { h: number; m: number } | null => {
  const match = (time || '').match(/(\d{1,2})[:.](\d{2})/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return { h, m };
};

const timeSortKey = (a: Activity): number => {
  const t = parseActivityTime(a.time);
  return t ? t.h * 60 + t.m : 24 * 60;
};

export const formatDayLabel = (isoDate: string): string => {
  const d = parseLocalDate(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
};

export const formatLongDate = (isoDate: string): string => {
  const d = parseLocalDate(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  const text = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/** Días del viaje con sus actividades ordenadas por hora. */
export const buildExportDays = (trip: Trip, activities: Activity[]): ExportDay[] => {
  return generateTripDays(trip).map((day) => ({
    dayNumber: day.dayNumber,
    date: day.date,
    label: formatDayLabel(day.date),
    activities: activities
      .filter((a) => a.dayNumber === day.dayNumber)
      .map((a) => ({ ...a, title: (a.title || '').trim() }))
      .sort((a, b) => timeSortKey(a) - timeSortKey(b))
  }));
};

export const buildExportMoney = (input: TripExportInput): ExportMoney => {
  const { trip, expenses, exchangeRate, totalSpentLocal } = input;
  const rate = exchangeRate > 0 ? exchangeRate : 1;
  const spentBase = totalSpentLocal / rate;
  const cashLocal = expenses
    .filter((e) => getExpensePaymentMethod(e) === 'efectivo')
    .reduce((sum, e) => sum + parseCurrencyNumber(e.amountARS), 0);
  const cardLocal = expenses
    .filter((e) => getExpensePaymentMethod(e) === 'tarjeta')
    .reduce((sum, e) => sum + parseCurrencyNumber(e.amountARS), 0);

  return {
    localCurrency: trip.localCurrency || 'ARS',
    baseCurrency: trip.baseCurrency || 'USD',
    rate,
    budgetBase: trip.budgetTotalBase || 0,
    spentLocal: totalSpentLocal,
    spentBase,
    remainingBase: (trip.budgetTotalBase || 0) - spentBase,
    cashLocal,
    cardLocal
  };
};

/** Importe con código de moneda para que USD y moneda local no se confundan ("$151.09 USD", "$ 229.650 ARS"). */
export const money = (amount: number, currency: string): string =>
  formatCurrency(amount, currency, {
    maximumFractionDigits: currency === 'USD' || currency === 'EUR' ? 2 : 0,
    showCode: true
  });

/** Texto corto del costo de una actividad ("" si no tiene costo). */
export const activityCostText = (a: Activity, localCurrency: string): string => {
  const cost = parseCurrencyNumber(a.costEstimatedARS);
  return cost > 0 ? money(cost, localCurrency) : '';
};

export const isNoteActivity = (a: Activity): boolean => a.type === 'nota';

/** Enlace de Google Maps para una actividad (coordenadas, dirección o barrio + ciudad). */
export const activityMapsUrl = (a: Activity, city: string): string | null => {
  if (isNoteActivity(a)) return null;
  if (a.coords && a.coords.length === 2) {
    return `https://www.google.com/maps/search/?api=1&query=${a.coords[0]},${a.coords[1]}`;
  }
  const place = a.address || (a.barrio ? `${a.title}, ${a.barrio}` : '');
  if (!place) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place}, ${city}`)}`;
};

/** Nombre de archivo seguro: "buenos-aires-2026". */
export const slugify = (text: string): string =>
  (text || 'viaje')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'viaje';

/** Descarga un archivo generado en el navegador. */
export const downloadTextFile = (content: string, filename: string, mime: string): void => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};
