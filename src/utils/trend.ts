import { Entry, PooTime, TrendPoint, WeighTime } from '../types/models';
import { daysBetween } from './date';

const weighBase: Record<WeighTime, number> = {
  morning: 1,
  afternoon: 0.8,
  evening: 0.6,
};

const order: Record<Exclude<PooTime, 'none'> | WeighTime, number> = {
  morning: 1,
  afternoon: 2,
  evening: 3,
};

export const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

/**
 * Rule-based reliability score from weigh/poo timing. Higher means more trustworthy for trend estimation.
 */
export const calculateReliability = (weighTime: WeighTime, pooTime: PooTime): number => {
  let score = weighBase[weighTime];

  if (pooTime === 'none') {
    score -= 0.15;
  } else if (order[pooTime] < order[weighTime]) {
    score += 0.1;
  } else if (order[pooTime] === order[weighTime]) {
    score += 0.05;
  }

  return clamp(score, 0.4, 1.0);
};

/**
 * EWMA trend with reliability-scaled alpha so lower-quality weigh-ins move the trend less.
 */
export const buildTrendSeries = (entries: Entry[], alphaBase = 0.25): TrendPoint[] => {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 0) return [];

  let previousTrend = sorted[0].weightKg;
  const firstDate = sorted[0].date;

  return sorted.map((entry, index) => {
    const reliability = calculateReliability(entry.weighTime, entry.pooTime);

    if (index !== 0) {
      const alpha = alphaBase * reliability;
      previousTrend = alpha * entry.weightKg + (1 - alpha) * previousTrend;
    }

    return {
      entry,
      reliability,
      trendWeight: Number(previousTrend.toFixed(3)),
      dayOffset: daysBetween(firstDate, entry.date),
    };
  });
};
