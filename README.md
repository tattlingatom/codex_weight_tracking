# Weight Trend Tracker (Expo + TypeScript)

Simple personal weight-tracking app focused on **quick daily check-in**, **smoothed trend**, and **target projection**.

## Features

- Daily check-in (weight, weigh time, poo time) with local date auto-filled.
- Auto default weigh-time bucket by current local hour.
- Edit/delete previous entries from Progress screen.
- Local persistence via Zustand + AsyncStorage.
- Trend EWMA smoothing with reliability weighting.
- Weighted linear regression slope over recent trend data (21-day preference).
- Projection card with insight and estimated target date.
- Progress chart showing raw and trend lines (14d / 30d / all).
- Onboarding flow to set target weight.
- Settings for target update, reset data, and CSV preview export.
- Dev-mode seed sample data.

## Project structure

```txt
.
├── App.tsx
├── src
│   ├── components
│   │   └── SegmentedControl.tsx
│   ├── screens
│   │   ├── HomeScreen.tsx
│   │   ├── OnboardingScreen.tsx
│   │   ├── ProgressScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── store
│   │   └── useAppStore.ts
│   ├── types
│   │   └── models.ts
│   └── utils
│       ├── date.ts
│       ├── projection.ts
│       ├── trend.ts
│       └── trend.test.ts
└── README.md
```

## Setup / run

```bash
npm install
npm run start
```

Then open in Expo Go or simulator.

Run unit tests:

```bash
npm run test
```

## Math / logic details

### Reliability scoring
Configured in `src/utils/trend.ts`:

- `weighBase` for morning/afternoon/evening.
- poo adjustment rules.
- clamped to `[0.4, 1.0]`.

### EWMA smoothing
Configured in `buildTrendSeries` in `src/utils/trend.ts`:

- `alphaBase = 0.25`
- `alpha = alphaBase * reliability`

### Slope + projection
Configured in `src/utils/projection.ts`:

- Weighted regression (w = reliability)
- 21-day preferred window
- data sufficiency rules (>=10 entries and >=7-day span)
- projection threshold (`slope < -0.01` kg/day)
- simple confidence window using 14d and 21d slopes

## Parameters to tweak

- Reliability base/adjustments: `src/utils/trend.ts` (`weighBase`, adjustment logic).
- EWMA smoothing sensitivity: `alphaBase` in `buildTrendSeries`.
- Data sufficiency and projection threshold: `src/utils/projection.ts`.
- Confidence-window method: `createProjection` in `src/utils/projection.ts`.

## Future improvements

1. Personalized reliability calibration by user history (time-of-day bias).
2. Better confidence bands (bootstrap or residual-based intervals).
3. Reminder notifications for daily check-in.
4. Real CSV file export/share (instead of alert preview).
5. Optional trend decomposition (water fluctuation vs trend estimate).
