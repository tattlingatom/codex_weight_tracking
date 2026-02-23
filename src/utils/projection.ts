import { Entry, ProjectionResult, TrendPoint } from '../types/models';
import { addDays, daysBetween, toLocalISODate } from './date';
import { buildTrendSeries } from './trend';

interface RegressionResult {
  slope: number;
  intercept: number;
}

/**
 * Weighted linear regression for trend slope estimation.
 */
export const weightedLinearRegression = (
  points: { x: number; y: number; w: number }[],
): RegressionResult | null => {
  if (points.length < 2) return null;

  const sumW = points.reduce((acc, p) => acc + p.w, 0);
  if (sumW === 0) return null;

  const xBar = points.reduce((acc, p) => acc + p.w * p.x, 0) / sumW;
  const yBar = points.reduce((acc, p) => acc + p.w * p.y, 0) / sumW;

  const numerator = points.reduce((acc, p) => acc + p.w * (p.x - xBar) * (p.y - yBar), 0);
  const denominator = points.reduce((acc, p) => acc + p.w * (p.x - xBar) ** 2, 0);

  if (denominator === 0) return null;

  const slope = numerator / denominator;
  const intercept = yBar - slope * xBar;
  return { slope, intercept };
};

const recentWindow = (trend: TrendPoint[], days: number): TrendPoint[] => {
  if (trend.length === 0) return [];
  const latest = trend[trend.length - 1].entry.date;
  return trend.filter((p) => daysBetween(p.entry.date, latest) <= days);
};

const slopeFromWindow = (points: TrendPoint[]): number | null => {
  if (points.length < 2) return null;
  const x0 = points[0].dayOffset;
  const result = weightedLinearRegression(
    points.map((p) => ({ x: p.dayOffset - x0, y: p.trendWeight, w: p.reliability })),
  );
  return result?.slope ?? null;
};

export const createProjection = (entries: Entry[], targetWeightKg: number | null): ProjectionResult => {
  const trend = buildTrendSeries(entries);
  const today = toLocalISODate(new Date());

  if (trend.length === 0) {
    return {
      status: 'not-enough-data',
      weeklyRateKg: null,
      slopeKgPerDay: null,
      currentTrendWeight: null,
      projectedDate: null,
      daysToTarget: null,
      confidenceWindow: null,
      insight: 'Need more data for a reliable projection.',
    };
  }

  const recent21 = recentWindow(trend, 21);
  const spanDays = daysBetween(recent21[0].entry.date, recent21[recent21.length - 1].entry.date);
  if (trend.length < 10 || spanDays < 7) {
    return {
      status: 'not-enough-data',
      weeklyRateKg: null,
      slopeKgPerDay: null,
      currentTrendWeight: trend[trend.length - 1].trendWeight,
      projectedDate: null,
      daysToTarget: null,
      confidenceWindow: null,
      insight: 'Need more data for a reliable projection.',
    };
  }

  const slope = slopeFromWindow(recent21);
  const currentTrendWeight = trend[trend.length - 1].trendWeight;

  if (slope == null) {
    return {
      status: 'not-enough-data',
      weeklyRateKg: null,
      slopeKgPerDay: null,
      currentTrendWeight,
      projectedDate: null,
      daysToTarget: null,
      confidenceWindow: null,
      insight: 'Need more data for a reliable projection.',
    };
  }

  const weeklyRateKg = Number((slope * 7).toFixed(3));

  if (targetWeightKg == null) {
    return {
      status: 'no-target',
      weeklyRateKg,
      slopeKgPerDay: slope,
      currentTrendWeight,
      projectedDate: null,
      daysToTarget: null,
      confidenceWindow: null,
      insight: slope < 0 ? 'Trend is moving down.' : 'No downward trend yet — keep logging for a better projection.',
    };
  }

  const remainingKg = currentTrendWeight - targetWeightKg;
  if (remainingKg <= 0) {
    return {
      status: 'target-reached',
      weeklyRateKg,
      slopeKgPerDay: slope,
      currentTrendWeight,
      projectedDate: today,
      daysToTarget: 0,
      confidenceWindow: null,
      insight: 'Target reached. Keep logging to maintain your trend.',
    };
  }

  if (slope >= -0.01) {
    return {
      status: 'no-downward-trend',
      weeklyRateKg,
      slopeKgPerDay: slope,
      currentTrendWeight,
      projectedDate: null,
      daysToTarget: null,
      confidenceWindow: null,
      insight: 'No downward trend yet — keep logging for a better projection.',
    };
  }

  const daysToTarget = remainingKg / Math.abs(slope);
  const projectedDate = addDays(today, Math.round(daysToTarget));

  const slope14 = slopeFromWindow(recentWindow(trend, 14));
  const candidates = [slope14, slope].filter((v): v is number => typeof v === 'number' && v < -0.01);
  let confidenceWindow: ProjectionResult['confidenceWindow'] = null;

  if (candidates.length > 0) {
    const faster = Math.min(...candidates);
    const slower = Math.max(...candidates);
    confidenceWindow = {
      likely: projectedDate,
      earlier: addDays(today, Math.round(remainingKg / Math.abs(faster))),
      later: addDays(today, Math.round(remainingKg / Math.abs(slower))),
    };
  }

  return {
    status: 'projected',
    weeklyRateKg,
    slopeKgPerDay: slope,
    currentTrendWeight,
    projectedDate,
    daysToTarget: Math.round(daysToTarget),
    confidenceWindow,
    insight: 'Trend is moving down.',
  };
};
