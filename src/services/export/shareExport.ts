// Resumen de texto del viaje para compartir por WhatsApp, el menú nativo del celular o el portapapeles.
import {
  TripExportInput,
  buildExportDays,
  buildExportMoney,
  activityCostText,
  formatDayLabel,
  isNoteActivity,
  money
} from './exportData';

// Los enlaces wa.me con textos muy largos fallan en algunos dispositivos
const WHATSAPP_MAX_CHARS = 3000;

export type SummaryMode = 'full' | 'compact';

export const buildTripSummaryText = (input: TripExportInput, mode: SummaryMode = 'full'): string => {
  const { trip, activities } = input;
  const days = buildExportDays(trip, activities);
  const m = buildExportMoney(input);
  const lines: string[] = [
    `✈️ *${trip.title}* ${trip.flagEmoji}`,
    `📍 ${trip.destinationCity}`,
    `📅 ${formatDayLabel(trip.startDate)} → ${formatDayLabel(trip.endDate)} (${days.length} días)`,
    ''
  ];

  days.forEach((day) => {
    const plans = day.activities.filter((a) => !isNoteActivity(a));
    if (mode === 'compact') {
      if (plans.length > 0) {
        lines.push(`*Día ${day.dayNumber}* (${day.label}): ${plans.map((a) => a.title).join(', ')}`);
      }
      return;
    }
    lines.push(`*Día ${day.dayNumber} · ${day.label}*`);
    if (plans.length === 0) {
      lines.push('  Día libre');
    } else {
      plans.forEach((a) => {
        const cost = activityCostText(a, m.localCurrency);
        const where = a.barrio ? ` (${a.barrio})` : '';
        lines.push(`${a.completed ? '✅' : '•'} ${a.time ? a.time + ' ' : ''}${a.title}${where}${cost ? ' — ' + cost : ''}`);
      });
    }
    lines.push('');
  });

  if (mode === 'compact') lines.push('');
  const showLocal = m.localCurrency !== m.baseCurrency;
  lines.push(
    `💰 Gastado: ${money(m.spentBase, m.baseCurrency)}${showLocal ? ` (${money(m.spentLocal, m.localCurrency)})` : ''} de ${money(m.budgetBase, m.baseCurrency)}`
  );
  lines.push('— Planificado con TripFlow');
  return lines.join('\n');
};

/** Texto adecuado para WhatsApp: completo si cabe, si no la versión compacta. */
export const buildWhatsAppText = (input: TripExportInput): string => {
  const full = buildTripSummaryText(input, 'full');
  return full.length <= WHATSAPP_MAX_CHARS ? full : buildTripSummaryText(input, 'compact');
};

export const openWhatsAppShare = (text: string): void => {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
};

export const canNativeShare = (): boolean =>
  typeof navigator !== 'undefined' && typeof navigator.share === 'function';

/** Abre el menú nativo de compartir (celular). Devuelve false si el usuario cancela o no está disponible. */
export const nativeShare = async (title: string, text: string): Promise<boolean> => {
  if (!canNativeShare()) return false;
  try {
    await navigator.share({ title, text });
    return true;
  } catch {
    return false;
  }
};

export const copyTextToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Continúa con el método alternativo
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
};
