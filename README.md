# Weight Trend Tracker (Web App)

A very simple **mobile-friendly web app** for logging daily weight + timing and projecting target date using smoothed trend data.

## Why this version
This is now a **web app** (React + TypeScript + Vite), so you can run it and open it in Safari on your iPhone via local network URL.

## Features
- Fast daily check-in: date, weight, weigh-time bucket, poo-time bucket.
- Auto-select weigh-time bucket by local clock (morning/afternoon/evening).
- Edit previous day by choosing date in Home or editing in Progress.
- Target weight setup and updates.
- Dashboard stats: latest weight, trend weight, weekly trend rate, projected date, days remaining, insight.
- Progress chart with raw and trend lines + marker styling.
- Time filters: 14d / 30d / All.
- Local persistence with `localStorage`.
- CSV export + reset data.
- Dev sample data seeding.

## Project structure
- `src/App.tsx`: shell and tabs
- `src/screens/*`: onboarding/home/progress/settings
- `src/store/useAppStore.ts`: typed state + local persistence
- `src/utils/trend.ts`: reliability + EWMA
- `src/utils/projection.ts`: weighted regression + projection
- `src/utils/trend.test.ts`: unit tests

## Run
```bash
npm install
npm run dev
```
Then open the URL shown by Vite from your iPhone (same Wi‑Fi), e.g. `http://<your-computer-ip>:5173`.

## Tweak parameters
- Reliability weights and poo adjustments: `src/utils/trend.ts`
- EWMA base alpha (`alphaBase`): `src/utils/trend.ts`
- Data sufficiency, slope threshold, and confidence window logic: `src/utils/projection.ts`

## Future improvements
1. PWA install support + offline cache.
2. Optional reminders/notifications.
3. Better confidence bands (uncertainty visualization).
4. Personalized reliability calibration by historical variance.
5. Cloud sync / backup.
