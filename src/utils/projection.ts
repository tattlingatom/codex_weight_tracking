import { Entry, ProjectionResult, TrendPoint } from '../types/models';
import { addDays, daysBetween, toLocalISODate } from './date';
import { buildTrendSeries } from './trend';

export const weightedLinearRegression = (points: { x: number; y: number; w: number }[]) => {
  if (points.length < 2) return null;
  const sumW = points.reduce((a, p) => a + p.w, 0);
  if (!sumW) return null;
  const xBar = points.reduce((a, p) => a + p.w * p.x, 0) / sumW;
  const yBar = points.reduce((a, p) => a + p.w * p.y, 0) / sumW;
  const num = points.reduce((a, p) => a + p.w * (p.x - xBar) * (p.y - yBar), 0);
  const den = points.reduce((a, p) => a + p.w * (p.x - xBar) ** 2, 0);
  if (!den) return null;
  return { slope: num / den, intercept: yBar - (num / den) * xBar };
};

const recentWindow = (trend: TrendPoint[], days: number): TrendPoint[] => {
  if (!trend.length) return [];
  const latest = trend[trend.length - 1].entry.date;
  return trend.filter((p) => daysBetween(p.entry.date, latest) <= days);
};

const slopeFrom = (points: TrendPoint[]): number | null => {
  if (points.length < 2) return null;
  const x0 = points[0].dayOffset;
  return weightedLinearRegression(points.map((p) => ({ x: p.dayOffset - x0, y: p.trendWeight, w: p.reliability })))?.slope ?? null;
};

export const createProjection = (entries: Entry[], targetWeightKg: number | null): ProjectionResult => {
  const trend = buildTrendSeries(entries);
  const today = toLocalISODate();
  const latest = trend[trend.length - 1];

  if (!latest) return { status: 'not-enough-data', weeklyRateKg: null, slopeKgPerDay: null, currentTrendWeight: null, projectedDate: null, daysToTarget: null, confidenceWindow: null, insight: 'Need more data for a reliable projection.' };

  const recent21 = recentWindow(trend, 21);
  const spanDays = daysBetween(recent21[0].entry.date, recent21[recent21.length - 1].entry.date);
  if (trend.length < 10 || spanDays < 7) return { status: 'not-enough-data', weeklyRateKg: null, slopeKgPerDay: null, currentTrendWeight: latest.trendWeight, projectedDate: null, daysToTarget: null, confidenceWindow: null, insight: 'Need more data for a reliable projection.' };

  const slope = slopeFrom(recent21);
  if (slope == null) return { status: 'not-enough-data', weeklyRateKg: null, slopeKgPerDay: null, currentTrendWeight: latest.trendWeight, projectedDate: null, daysToTarget: null, confidenceWindow: null, insight: 'Need more data for a reliable projection.' };

  const weeklyRateKg = Number((slope * 7).toFixed(3));
  if (targetWeightKg == null) return { status: 'no-target', weeklyRateKg, slopeKgPerDay: slope, currentTrendWeight: latest.trendWeight, projectedDate: null, daysToTarget: null, confidenceWindow: null, insight: slope < 0 ? 'Trend is moving down.' : 'No downward trend yet — keep logging for a better projection.' };

  const remainingKg = latest.trendWeight - targetWeightKg;
  if (remainingKg <= 0) return { status: 'target-reached', weeklyRateKg, slopeKgPerDay: slope, currentTrendWeight: latest.trendWeight, projectedDate: today, daysToTarget: 0, confidenceWindow: null, insight: 'Target reached. Keep logging to maintain your trend.' };
  if (slope >= -0.01) return { status: 'no-downward-trend', weeklyRateKg, slopeKgPerDay: slope, currentTrendWeight: latest.trendWeight, projectedDate: null, daysToTarget: null, confidenceWindow: null, insight: 'No downward trend yet — keep logging for a better projection.' };

  const daysToTarget = Math.round(remainingKg / Math.abs(slope));
  const projectedDate = addDays(today, daysToTarget);
  const slope14 = slopeFrom(recentWindow(trend, 14));
  const valid = [slope14, slope].filter((s): s is number => s != null && s < -0.01);
  const confidenceWindow = valid.length ? {
    likely: projectedDate,
    earlier: addDays(today, Math.round(remainingKg / Math.abs(Math.min(...valid)))),
    later: addDays(today, Math.round(remainingKg / Math.abs(Math.max(...valid)))),
  } : null;

  return { status: 'projected', weeklyRateKg, slopeKgPerDay: slope, currentTrendWeight: latest.trendWeight, projectedDate, daysToTarget, confidenceWindow, insight: 'Trend is moving down.' };
};
