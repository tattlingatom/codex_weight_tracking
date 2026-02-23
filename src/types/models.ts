export type WeighTime = 'morning' | 'afternoon' | 'evening';
export type PooTime = 'none' | 'morning' | 'afternoon' | 'evening';

export interface Entry {
  id: string;
  date: string; // YYYY-MM-DD local
  weightKg: number;
  weighTime: WeighTime;
  pooTime: PooTime;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  targetWeightKg: number | null;
  unit: 'kg';
  onboardingCompleted: boolean;
}

export interface TrendPoint {
  entry: Entry;
  reliability: number;
  trendWeight: number;
  dayOffset: number;
}

export interface ProjectionResult {
  status: 'target-reached' | 'projected' | 'no-target' | 'not-enough-data' | 'no-downward-trend';
  weeklyRateKg: number | null;
  slopeKgPerDay: number | null;
  currentTrendWeight: number | null;
  projectedDate: string | null;
  daysToTarget: number | null;
  confidenceWindow: {
    likely: string;
    earlier: string;
    later: string;
  } | null;
  insight: string;
}
