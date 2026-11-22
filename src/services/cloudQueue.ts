// Cola de cambios pendientes (modo sin conexión).
// Cada escritura en Supabase pasa por cloudWrite(): con conexión se envía al momento;
// sin conexión (o si la red falla) se guarda en localStorage y se reenvía en orden al volver la señal.
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { reportCloudError } from './cloudErrors';

type Row = object;
type Match = { column: string; eq: string | number } | { column: string; in: (string | number)[] };

export type CloudOp =
  | { table: string; action: 'insert' | 'upsert'; values: Row | Row[] }
  | { table: string; action: 'update'; values: Row; match: Match }
  | { table: string; action: 'delete'; match: Match };

interface QueuedOp {
  id: string;
  context: string;
  op: CloudOp;
  queuedAt: string;
}

const OUTBOX_KEY = 'tripflow_cloud_outbox';
export const OUTBOX_EVENT = 'tripflow:outbox-changed';

const readOutbox = (): QueuedOp[] => {
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeOutbox = (items: QueuedOp[]): void => {
  try {
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(items));
  } catch {
    // Almacenamiento lleno o bloqueado: no hay dónde guardar la cola
  }
  try {
    window.dispatchEvent(new CustomEvent(OUTBOX_EVENT, { detail: items.length }));
  } catch {
    // Sin window
  }
};

export const getPendingCount = (): number => readOutbox().length;

const isOffline = (): boolean => typeof navigator !== 'undefined' && navigator.onLine === false;

const isNetworkError = (error: { message?: string } | null | undefined): boolean =>
  isOffline() || /failed to fetch|networkerror|load failed|fetch failed|network request failed/i.test(error?.message || '');

const enqueue = (context: string, op: CloudOp): void => {
  const items = readOutbox();
  items.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, context, op, queuedAt: new Date().toISOString() });
  writeOutbox(items);
};

const execute = async (op: CloudOp): Promise<{ error: { message?: string } | null }> => {
  if (!supabase) return { error: null };
  const table = supabase.from(op.table);
  const applyMatch = <T extends { eq: (c: string, v: unknown) => T; in: (c: string, v: unknown[]) => T }>(q: T, m: Match): T =>
    'eq' in m ? q.eq(m.column, m.eq) : q.in(m.column, m.in);
  switch (op.action) {
    case 'delete':
      return applyMatch(table.delete(), op.match);
    case 'update':
      return applyMatch(table.update(op.values), op.match);
    case 'upsert':
      return table.upsert(op.values);
    default:
      return table.insert(op.values);
  }
};

/** Guarda en la nube o, sin conexión, deja el cambio en la cola. */
export const cloudWrite = async (context: string, op: CloudOp): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) return;
  // Si ya hay cambios en cola, este va detrás para respetar el orden
  if (isOffline() || getPendingCount() > 0) {
    enqueue(context, op);
    if (!isOffline()) void flushOutbox();
    return;
  }
  try {
    const { error } = await execute(op);
    if (!error) return;
    if (isNetworkError(error)) enqueue(context, op);
    else reportCloudError(context, error);
  } catch (err) {
    enqueue(context, op);
    console.warn(`[Supabase] ${context} en cola por error de red:`, err);
  }
};

let flushing: Promise<{ sent: number; pending: number }> | null = null;

/** Envía los cambios pendientes en orden. Se detiene si la red vuelve a fallar. */
export const flushOutbox = (): Promise<{ sent: number; pending: number }> => {
  if (flushing) return flushing;
  flushing = (async () => {
    let sent = 0;
    if (!isSupabaseConfigured || !supabase || isOffline()) return { sent, pending: getPendingCount() };
    let items = readOutbox();
    while (items.length > 0) {
      const next = items[0];
      let networkFail = false;
      try {
        const { error } = await execute(next.op);
        if (error) {
          if (isNetworkError(error)) networkFail = true;
          else reportCloudError(`${next.context} (pendiente)`, error); // error de datos: se descarta para no bloquear la cola
        }
      } catch {
        networkFail = true;
      }
      if (networkFail) break;
      sent++;
      // Releer: pueden haber llegado cambios nuevos a la cola mientras se enviaba este
      items = readOutbox().filter((i) => i.id !== next.id);
      writeOutbox(items);
    }
    return { sent, pending: items.length };
  })().finally(() => {
    flushing = null;
  });
  return flushing;
};
