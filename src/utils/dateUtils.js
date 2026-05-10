import { WORDLE_START_DATE } from './constants';

export function todayISO() {
  const d = new Date();
  return formatISO(d);
}

export function formatISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function previousDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return formatISO(d);
}

export function isValidWordleDate(dateStr) {
  return dateStr >= WORDLE_START_DATE && dateStr <= todayISO();
}

export function daysBetween(a, b) {
  const msPerDay = 86400000;
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db - da) / msPerDay);
}
