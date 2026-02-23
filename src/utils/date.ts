import { WeighTime } from '../types/models';

export const toLocalISODate = (input: Date): string => {
  const year = input.getFullYear();
  const month = String(input.getMonth() + 1).padStart(2, '0');
  const day = String(input.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseISODateLocal = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const daysBetween = (start: string, end: string): number => {
  const ms = parseISODateLocal(end).getTime() - parseISODateLocal(start).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
};

export const inferDefaultWeighTime = (date = new Date()): WeighTime => {
  const hour = date.getHours();
  if (hour >= 4 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
};

export const addDays = (isoDate: string, days: number): string => {
  const next = parseISODateLocal(isoDate);
  next.setDate(next.getDate() + days);
  return toLocalISODate(next);
};
