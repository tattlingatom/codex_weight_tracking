import React, { useEffect, useMemo, useState } from 'react';
import { SegmentedControl } from '../components/SegmentedControl';
import { useAppStore } from '../store/useAppStore';
import { PooTime, WeighTime } from '../types/models';
import { inferDefaultWeighTime, toLocalISODate } from '../utils/date';
import { createProjection } from '../utils/projection';
import { buildTrendSeries } from '../utils/trend';

export function Home() {
  const entries = useAppStore((s) => s.entries);
  const settings = useAppStore((s) => s.settings);
  const saveEntry = useAppStore((s) => s.saveEntry);
  const today = toLocalISODate();

  const [date, setDate] = useState(today);
  const existing = entries.find((e) => e.date === date);
  const [weight, setWeight] = useState(existing?.weightKg.toString() ?? '');
  const [weighTime, setWeighTime] = useState<WeighTime>(existing?.weighTime ?? inferDefaultWeighTime());
  const [pooTime, setPooTime] = useState<PooTime>(existing?.pooTime ?? 'none');

  const trend = useMemo(() => buildTrendSeries(entries), [entries]);
  const latest = trend[trend.length - 1];
  const projection = useMemo(() => createProjection(entries, settings.targetWeightKg), [entries, settings.targetWeightKg]);

  useEffect(() => {
    const match = entries.find((e) => e.date === date);
    setWeight(match?.weightKg?.toString() ?? '');
    setWeighTime(match?.weighTime ?? (date === today ? inferDefaultWeighTime() : 'morning'));
    setPooTime(match?.pooTime ?? 'none');
  }, [date, entries, today]);

  return (
    <div className="stack">
      <section className="card">
        <h2>Daily check-in</h2>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Weight (kg)" inputMode="decimal" />
        <label>Weigh time</label>
        <SegmentedControl value={weighTime} onChange={setWeighTime} options={[{label:'Morning',value:'morning'},{label:'Afternoon',value:'afternoon'},{label:'Evening',value:'evening'}]} />
        <label>Poo time</label>
        <SegmentedControl value={pooTime} onChange={setPooTime} options={[{label:'None',value:'none'},{label:'Morning',value:'morning'},{label:'Afternoon',value:'afternoon'},{label:'Evening',value:'evening'}]} />
        <button className="primary" onClick={() => {
          const n = Number(weight);
          if (!Number.isFinite(n) || n <= 0) return alert('Enter a valid weight');
          saveEntry({ date, weightKg: n, weighTime, pooTime });
          alert('Saved');
        }}>Save entry</button>
      </section>

      <section className="card">
        <h2>Latest stats</h2>
        <p>Latest logged weight: {entries[entries.length - 1]?.weightKg?.toFixed(1) ?? '—'} kg</p>
        <p>Trend weight: {latest?.trendWeight?.toFixed(1) ?? '—'} kg</p>
        <p>Estimated weekly change: {projection.weeklyRateKg == null ? '—' : `${projection.weeklyRateKg.toFixed(2)} kg/week`}</p>
      </section>

      <section className="card">
        <h2>Projection</h2>
        <p>Projected date to target: {projection.projectedDate ?? '—'}</p>
        <p>Days remaining: {projection.daysToTarget ?? '—'}</p>
        <p className="insight">{projection.insight}</p>
      </section>
    </div>
  );
}
