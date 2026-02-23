import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Entry, PooTime, Settings, WeighTime } from '../types/models';
import { toLocalISODate } from '../utils/date';

interface CheckInInput {
  date: string;
  weightKg: number;
  weighTime: WeighTime;
  pooTime: PooTime;
}

interface AppState {
  entries: Entry[];
  settings: Settings;
  saveEntry: (input: CheckInInput) => void;
  deleteEntry: (id: string) => void;
  setTargetWeight: (value: number | null) => void;
  completeOnboarding: () => void;
  resetAllData: () => void;
  seedIfEmpty: () => void;
}

const nowISO = () => new Date().toISOString();

const defaultSettings: Settings = {
  targetWeightKg: null,
  unit: 'kg',
  onboardingCompleted: false,
};

const sampleData = (): Entry[] => {
  const today = new Date();
  return Array.from({ length: 18 }).map((_, idx) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (17 - idx));
    const date = toLocalISODate(day);
    const weightKg = Number((79.8 - idx * 0.12 + ((idx % 3) - 1) * 0.25).toFixed(1));
    const weighTime: WeighTime = idx % 3 === 0 ? 'morning' : idx % 3 === 1 ? 'afternoon' : 'evening';
    const pooTime: PooTime = idx % 4 === 0 ? 'none' : 'morning';
    return {
      id: `seed-${date}`,
      date,
      weightKg,
      weighTime,
      pooTime,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
  });
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      entries: [],
      settings: defaultSettings,
      saveEntry: (input) =>
        set((state) => {
          const existing = state.entries.find((entry) => entry.date === input.date);
          if (existing) {
            return {
              entries: state.entries
                .map((entry) =>
                  entry.date === input.date
                    ? { ...entry, ...input, updatedAt: nowISO() }
                    : entry,
                )
                .sort((a, b) => a.date.localeCompare(b.date)),
            };
          }

          const created: Entry = {
            id: `${input.date}-${Math.random().toString(36).slice(2, 8)}`,
            ...input,
            createdAt: nowISO(),
            updatedAt: nowISO(),
          };

          return { entries: [...state.entries, created].sort((a, b) => a.date.localeCompare(b.date)) };
        }),
      deleteEntry: (id) => set((state) => ({ entries: state.entries.filter((entry) => entry.id !== id) })),
      setTargetWeight: (value) =>
        set((state) => ({ settings: { ...state.settings, targetWeightKg: value } })),
      completeOnboarding: () =>
        set((state) => ({ settings: { ...state.settings, onboardingCompleted: true } })),
      resetAllData: () => set({ entries: [], settings: defaultSettings }),
      seedIfEmpty: () => {
        if (__DEV__ && get().entries.length === 0) {
          set({ entries: sampleData() });
        }
      },
    }),
    {
      name: 'weight-tracking-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
