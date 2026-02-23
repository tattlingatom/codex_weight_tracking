import { WeighTime } from '../types/models';

export const toLocalISODate = (input = new Date()): string => {
  const y = input.getFullYear();
  const m = String(input.getMonth() + 1).padStart(2, '0');
  const d = String(input.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const parseISODateLocal = (value: string): Date => {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const daysBetween = (start: string, end: string): number => {
  const ms = parseISODateLocal(end).getTime() - parseISODateLocal(start).getTime();
  return Math.round(ms / 86400000);
};

export const inferDefaultWeighTime = (date = new Date()): WeighTime => {
  const h = date.getHours();
  if (h >= 4 && h <= 11) return 'morning';
  if (h >= 12 && h <= 17) return 'afternoon';
  return 'evening';
};

export const addDays = (isoDate: string, days: number): string => {
  const d = parseISODateLocal(isoDate);
  d.setDate(d.getDate() + days);
  return toLocalISODate(d);
};
