import { create } from 'zustand';
import { Entry, PooTime, Settings, WeighTime } from '../types/models';
import { toLocalISODate } from '../utils/date';

interface CheckInInput {
  date: string;
  weightKg: number;
  weighTime: WeighTime;
  pooTime: PooTime;
}
interface State {
  entries: Entry[];
  settings: Settings;
  hydrated: boolean;
  hydrate: () => void;
  saveEntry: (input: CheckInInput) => void;
  deleteEntry: (id: string) => void;
  setTargetWeight: (value: number | null) => void;
  completeOnboarding: () => void;
  resetAllData: () => void;
  seedIfEmpty: () => void;
}

const KEY = 'weight-tracker-web-v1';
const defaultSettings: Settings = { targetWeightKg: null, unit: 'kg', onboardingCompleted: false };
const now = () => new Date().toISOString();

const sampleData = (): Entry[] => {
  const today = new Date();
  return Array.from({ length: 18 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (17 - i));
    const date = toLocalISODate(d);
    return {
      id: `seed-${date}`,
      date,
      weightKg: Number((80 - i * 0.12 + ((i % 4) - 2) * 0.15).toFixed(1)),
      weighTime: i % 3 === 0 ? 'morning' : i % 3 === 1 ? 'afternoon' : 'evening',
      pooTime: i % 4 === 0 ? 'none' : 'morning',
      createdAt: now(),
      updatedAt: now(),
    };
  });
};

const persist = (entries: Entry[], settings: Settings) => {
  localStorage.setItem(KEY, JSON.stringify({ entries, settings }));
};

export const useAppStore = create<State>((set, get) => ({
  entries: [],
  settings: defaultSettings,
  hydrated: false,
  hydrate: () => {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { entries: Entry[]; settings: Settings };
      set({ entries: parsed.entries ?? [], settings: parsed.settings ?? defaultSettings, hydrated: true });
    } else set({ hydrated: true });
  },
  saveEntry: (input) => set((s) => {
    const found = s.entries.find((e) => e.date === input.date);
    const next = found
      ? s.entries.map((e) => (e.date === input.date ? { ...e, ...input, updatedAt: now() } : e))
      : [...s.entries, { id: `${input.date}-${Math.random().toString(36).slice(2, 8)}`, ...input, createdAt: now(), updatedAt: now() }];
    const sorted = next.sort((a, b) => a.date.localeCompare(b.date));
    persist(sorted, s.settings);
    return { entries: sorted };
  }),
  deleteEntry: (id) => set((s) => {
    const entries = s.entries.filter((e) => e.id !== id);
    persist(entries, s.settings);
    return { entries };
  }),
  setTargetWeight: (value) => set((s) => {
    const settings = { ...s.settings, targetWeightKg: value };
    persist(s.entries, settings);
    return { settings };
  }),
  completeOnboarding: () => set((s) => {
    const settings = { ...s.settings, onboardingCompleted: true };
    persist(s.entries, settings);
    return { settings };
  }),
  resetAllData: () => {
    localStorage.removeItem(KEY);
    set({ entries: [], settings: defaultSettings });
  },
  seedIfEmpty: () => {
    const state = get();
    if (import.meta.env.DEV && state.entries.length === 0) {
      const entries = sampleData();
      persist(entries, state.settings);
      set({ entries });
    }
  },
}));
