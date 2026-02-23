import { describe, expect, it } from 'vitest';
import { Entry } from '../types/models';
import { createProjection, weightedLinearRegression } from './projection';
import { buildTrendSeries, calculateReliability } from './trend';

const makeEntry = (date: string, weightKg: number): Entry => ({
  id: date,
  date,
  weightKg,
  weighTime: 'morning',
  pooTime: 'morning',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

describe('reliability scoring', () => {
  it('applies base and poo adjustments with clamp', () => {
    expect(calculateReliability('morning', 'none')).toBeCloseTo(0.85);
    expect(calculateReliability('afternoon', 'morning')).toBeCloseTo(0.9);
    expect(calculateReliability('evening', 'none')).toBeCloseTo(0.45);
  });
});

describe('EWMA trend', () => {
  it('smooths using alpha adjusted by reliability', () => {
    const entries: Entry[] = [
      { ...makeEntry('2026-01-01', 80), pooTime: 'morning' },
      { ...makeEntry('2026-01-02', 79), pooTime: 'none' },
    ];

    const trend = buildTrendSeries(entries, 0.25);
    expect(trend[0].trendWeight).toBe(80);
    expect(trend[1].trendWeight).toBeCloseTo(79.787, 3);
  });
});

describe('weighted regression', () => {
  it('returns negative slope for descending line', () => {
    const reg = weightedLinearRegression([
      { x: 0, y: 80, w: 1 },
      { x: 1, y: 79.8, w: 1 },
      { x: 2, y: 79.6, w: 0.8 },
    ]);

    expect(reg).not.toBeNull();
    expect(reg?.slope).toBeLessThan(0);
    expect(reg?.slope).toBeCloseTo(-0.2, 2);
  });
});

describe('projection', () => {
  it('projects a date when trend is downward and data sufficient', () => {
    const entries = Array.from({ length: 12 }).map((_, idx) =>
      makeEntry(`2026-01-${String(idx + 1).padStart(2, '0')}`, 80 - idx * 0.15),
    );

    const result = createProjection(entries, 77);
    expect(result.status).toBe('projected');
    expect(result.projectedDate).toBeTruthy();
    expect(result.daysToTarget).not.toBeNull();
  });
});
