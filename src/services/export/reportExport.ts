// Informe ejecutivo del viaje: documento imprimible que el usuario guarda como PDF
// desde el diálogo de impresión del navegador (funciona offline y sin dependencias).
import { Activity } from '../../types/activity';
import { Expense } from '../../types/expense';
import { getExpensePaymentMethod, parseCurrencyNumber } from '../../utils/helpers';
import { REPORT_CSS } from './reportStyles';
import { renderMapSection, MAP_CSS, LEAFLET_CSS } from './reportMap';
import {
  TripExportInput,
  ExportDay,
  ExportMoney,
  buildExportDays,
  buildExportMoney,
  activityCostText,
  activityMapsUrl,
  formatLongDate,
  isNoteActivity,
  money
} from './exportData';

const esc = (text: unknown): string =>
  String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const renderMoney = (m: ExportMoney): string => {
  const pct = m.budgetBase > 0 ? Math.min(100, Math.round((m.spentBase / m.budgetBase) * 100)) : 0;
  const over = m.remainingBase < 0;
  const showLocal = m.localCurrency !== m.baseCurrency;
  return `
    <h2>💰 Resumen financiero</h2>
    <div class="kpis">
      <div class="kpi"><div class="label">Presupuesto</div><div class="value">${esc(money(m.budgetBase, m.baseCurrency))}</div></div>
      <div class="kpi"><div class="label">Gastado</div><div class="value">${esc(money(m.spentBase, m.baseCurrency))}</div>
        ${showLocal ? `<div class="hint">${esc(money(m.spentLocal, m.localCurrency))}</div>` : ''}</div>
      <div class="kpi ${over ? 'warn' : 'ok'}"><div class="label">${over ? 'Excedido' : 'Disponible'}</div>
        <div class="value">${esc(money(Math.abs(m.remainingBase), m.baseCurrency))}</div></div>
      <div class="kpi"><div class="label">Cotización</div><div class="value">${esc(m.rate.toLocaleString('es-AR', { maximumFractionDigits: 2 }))} ${esc(m.localCurrency)}</div>
        <div class="hint">por 1 ${esc(m.baseCurrency)}</div></div>
    </div>
    <div class="bar"><span style="width:${pct}%"></span></div>
    <p class="sub">${pct}% del presupuesto usado · 💵 Efectivo: ${esc(money(m.cashLocal, m.localCurrency))} · 💳 Tarjeta: ${esc(money(m.cardLocal, m.localCurrency))}</p>`;
};

const renderActivity = (a: Activity, city: string, currency: string): string => {
  const maps = activityMapsUrl(a, city);
  const cost = activityCostText(a, currency);
  const meta = [a.barrio, a.address].filter(Boolean).map(esc).join(' · ');
  const items = a.items && a.items.length > 0
    ? `<ul class="items">${a.items.map((it) => `<li>${esc(it.name)}${parseCurrencyNumber(it.price) > 0 ? ` — ${esc(money(parseCurrencyNumber(it.price), currency))}` : ''}</li>`).join('')}</ul>`
    : '';
  return `
    <div class="act ${isNoteActivity(a) ? 'note' : ''}">
      <div class="time">${esc(a.time || '—')}</div>
      <div>
        <div class="title">${a.completed ? '<span class="done">✔</span>' : ''}${isNoteActivity(a) ? '📝 ' : ''}${esc(a.title)}
          ${a.withFriend ? '<span class="pill">👫 Acompañado</span>' : ''}</div>
        <div class="meta">${meta}${maps ? `${meta ? ' · ' : ''}<a href="${esc(maps)}" target="_blank" rel="noopener">Ver mapa</a>` : ''}</div>
        ${a.note ? `<div class="meta">${esc(a.note)}</div>` : ''}
        ${a.tip ? `<div class="tip">💡 ${esc(a.tip)}</div>` : ''}
        ${items}
      </div>
      <div class="cost">${esc(cost)}</div>
    </div>`;
};

const renderDays = (days: ExportDay[], city: string, currency: string): string => `
  <h2>🗓️ Itinerario día por día</h2>
  ${days.map((d) => `
    <section class="day">
      <div class="day-head"><span>Día ${d.dayNumber} · <span class="date">${esc(formatLongDate(d.date))}</span></span>
        <span class="count">${d.activities.length} ${d.activities.length === 1 ? 'plan' : 'planes'}</span></div>
      ${d.activities.length === 0 ? '<div class="empty">Día libre</div>' : d.activities.map((a) => renderActivity(a, city, currency)).join('')}
    </section>`).join('')}`;

const renderExpenses = (expenses: Expense[], m: ExportMoney): string => {
  if (expenses.length === 0) return '';
  const sorted = [...expenses].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const total = sorted.reduce((s, e) => s + parseCurrencyNumber(e.amountARS), 0);
  return `
    <h2>🧾 Gastos registrados</h2>
    <table>
      <thead><tr><th>Fecha</th><th>Concepto</th><th>Categoría</th><th>Pago</th><th class="num">${esc(m.localCurrency)}</th><th class="num">${esc(m.baseCurrency)}</th></tr></thead>
      <tbody>${sorted.map((e) => {
        const amount = parseCurrencyNumber(e.amountARS);
        return `<tr><td>${esc(e.date)}</td><td>${esc(e.concept)}</td><td>${esc(e.category)}</td>
          <td>${getExpensePaymentMethod(e) === 'efectivo' ? '💵 Efectivo' : '💳 Tarjeta'}</td>
          <td class="num">${esc(money(amount, m.localCurrency))}</td><td class="num">${esc(money(amount / m.rate, m.baseCurrency))}</td></tr>`;
      }).join('')}</tbody>
      <tfoot><tr><td colspan="4">Total</td><td class="num">${esc(money(total, m.localCurrency))}</td><td class="num">${esc(money(total / m.rate, m.baseCurrency))}</td></tr></tfoot>
    </table>`;
};

export const buildTripReportHtml = (input: TripExportInput): string => {
  const { trip, activities, expenses } = input;
  const days = buildExportDays(trip, activities);
  const m = buildExportMoney(input);
  const planCount = activities.filter((a) => !isNoteActivity(a)).length;
  const doneCount = activities.filter((a) => a.completed).length;
  const generated = new Date().toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(trip.title)} · Itinerario TripFlow</title>
<link rel="stylesheet" href="${LEAFLET_CSS}" crossorigin=""><style>${REPORT_CSS}${MAP_CSS}</style></head>
<body>
  <div class="toolbar"><button onclick="window.close()">Cerrar</button><button class="primary" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button></div>
  <header class="hero">
    <div class="brand">TripFlow · Informe de viaje</div>
    <h1>${esc(trip.flagEmoji)} ${esc(trip.title)}</h1>
    <div class="sub">${esc(trip.destinationCity)} · ${esc(formatLongDate(trip.startDate))} → ${esc(formatLongDate(trip.endDate))} · ${days.length} días · ${planCount} planes (${doneCount} completados)</div>
  </header>
  ${renderMoney(m)}
  ${renderMapSection(days)}
  ${renderDays(days, trip.destinationCity, m.localCurrency)}
  ${renderExpenses(expenses, m)}
  <div class="footer">Generado con TripFlow el ${esc(generated)}</div>
</body></html>`;
};

/**
 * Abre el informe en una pestaña nueva y lanza el diálogo de impresión.
 * Devuelve false si el navegador bloqueó la ventana emergente.
 */
export const openTripReport = (input: TripExportInput): boolean => {
  const win = window.open('', '_blank');
  if (!win) return false;
  win.document.open();
  win.document.write(buildTripReportHtml(input));
  win.document.close();
  win.focus();
  // Espera a que el mapa termine de cargar (máx. ~6 s) antes de abrir el diálogo de impresión
  const started = Date.now();
  const tryPrint = () => {
    const ready = (win as Window & { __mapReady?: boolean }).__mapReady !== false;
    if (!ready && Date.now() - started < 6000) {
      setTimeout(tryPrint, 250);
      return;
    }
    try { win.print(); } catch { /* el usuario puede usar el botón del informe */ }
  };
  setTimeout(tryPrint, 450);
  return true;
};
