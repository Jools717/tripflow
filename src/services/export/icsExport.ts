// Exportador de calendario .ics (RFC 5545) compatible con Google Calendar, Apple Calendar y Outlook.
// Las horas se exportan como "hora flotante" (sin zona horaria): un plan a las 11:00 queda a las 11:00
// en la hora local donde esté el teléfono, que es lo esperado al viajar.
import { Activity } from '../../types/activity';
import { Trip } from '../../types/trip';
import {
  ExportDay,
  buildExportDays,
  parseActivityTime,
  activityCostText,
  activityMapsUrl,
  isNoteActivity,
  slugify,
  downloadTextFile
} from './exportData';

const DEFAULT_DURATION_MIN = 90;

const escapeIcs = (text: string): string =>
  (text || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');

/** Corta líneas a 75 octetos como exige el estándar (sin partir caracteres UTF-8). */
const foldLine = (line: string): string => {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let current = '';
  let currentBytes = 0;
  for (const ch of line) {
    const chBytes = encoder.encode(ch).length;
    const limit = parts.length === 0 ? 75 : 74; // las continuaciones empiezan con un espacio
    if (currentBytes + chBytes > limit) {
      parts.push(current);
      current = '';
      currentBytes = 0;
    }
    current += ch;
    currentBytes += chBytes;
  }
  parts.push(current);
  return parts.join('\r\n ');
};

const compactDate = (isoDate: string): string => isoDate.replace(/-/g, '');
const pad = (n: number): string => String(n).padStart(2, '0');

const addMinutes = (isoDate: string, h: number, m: number, minutes: number): string => {
  const [y, mo, d] = isoDate.split('-').map(Number);
  const date = new Date(y, mo - 1, d, h, m + minutes);
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
};

const nextDay = (isoDate: string): string => {
  const [y, mo, d] = isoDate.split('-').map(Number);
  const date = new Date(y, mo - 1, d + 1);
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
};

const utcStamp = (): string => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

const buildDescription = (a: Activity, trip: Trip): string => {
  const lines: string[] = [];
  if (a.barrio) lines.push(`📍 ${a.barrio}`);
  if (a.address) lines.push(`Dirección: ${a.address}`);
  const cost = activityCostText(a, trip.localCurrency);
  if (cost) lines.push(`💵 Costo estimado: ${cost}`);
  if (a.items && a.items.length > 0) {
    lines.push('🛒 Compras:');
    a.items.forEach((it) => lines.push(`  • ${it.name}`));
  }
  if (a.note) lines.push(`📝 ${a.note}`);
  if (a.tip) lines.push(`💡 ${a.tip}`);
  if (a.withFriend) lines.push('👫 Plan acompañado');
  const maps = activityMapsUrl(a, trip.destinationCity);
  if (maps) lines.push(`Mapa: ${maps}`);
  lines.push(`— ${trip.title} (TripFlow)`);
  return lines.join('\n');
};

const buildEvent = (a: Activity, day: ExportDay, trip: Trip, stamp: string): string[] => {
  const time = parseActivityTime(a.time);
  const prefix = isNoteActivity(a) ? '📝 ' : '';
  const location = a.address || (a.barrio ? `${a.barrio}, ${trip.destinationCity}` : trip.destinationCity);
  const lines = [
    'BEGIN:VEVENT',
    `UID:${a.id}@tripflow.app`,
    `DTSTAMP:${stamp}`,
    time
      ? `DTSTART:${addMinutes(day.date, time.h, time.m, 0)}`
      : `DTSTART;VALUE=DATE:${compactDate(day.date)}`,
    time
      ? `DTEND:${addMinutes(day.date, time.h, time.m, DEFAULT_DURATION_MIN)}`
      : `DTEND;VALUE=DATE:${nextDay(day.date)}`,
    `SUMMARY:${escapeIcs(prefix + a.title)}`,
    `LOCATION:${escapeIcs(location)}`,
    `DESCRIPTION:${escapeIcs(buildDescription(a, trip))}`,
    `CATEGORIES:${escapeIcs(a.category || 'viaje')}`,
    `STATUS:${a.completed ? 'CONFIRMED' : 'TENTATIVE'}`,
    'END:VEVENT'
  ];
  if (a.coords && a.coords.length === 2) {
    lines.splice(lines.length - 1, 0, `GEO:${a.coords[0]};${a.coords[1]}`);
  }
  return lines;
};

/** Construye el contenido .ics del viaje. Devuelve también cuántos eventos incluye. */
export const buildTripIcs = (trip: Trip, activities: Activity[]): { content: string; eventCount: number } => {
  const stamp = utcStamp();
  const days = buildExportDays(trip, activities);
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TripFlow//Itinerario//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcs(`${trip.flagEmoji} ${trip.title}`)}`
  ];
  let eventCount = 0;
  days.forEach((day) => {
    day.activities.forEach((a) => {
      lines.push(...buildEvent(a, day, trip, stamp));
      eventCount++;
    });
  });
  lines.push('END:VCALENDAR');
  return { content: lines.map(foldLine).join('\r\n') + '\r\n', eventCount };
};

export const downloadTripIcs = (trip: Trip, activities: Activity[]): number => {
  const { content, eventCount } = buildTripIcs(trip, activities);
  downloadTextFile(content, `${slugify(trip.title)}.ics`, 'text/calendar;charset=utf-8');
  return eventCount;
};
