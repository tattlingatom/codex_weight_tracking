import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

export function Onboarding() {
  const [target, setTarget] = useState('');
  const setTargetWeight = useAppStore((s) => s.setTargetWeight);
  const complete = useAppStore((s) => s.completeOnboarding);

  return (
    <div className="center-card">
      <h1>Track your weight trend and projected target date</h1>
      <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Target weight (kg)" inputMode="decimal" />
      <button className="primary" onClick={() => {
        const n = Number(target);
        if (Number.isFinite(n) && n > 0) setTargetWeight(n);
        complete();
      }}>Continue</button>
    </div>
  );
}
