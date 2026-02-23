import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

export function Settings() {
  const entries = useAppStore((s) => s.entries);
  const settings = useAppStore((s) => s.settings);
  const setTargetWeight = useAppStore((s) => s.setTargetWeight);
  const resetAllData = useAppStore((s) => s.resetAllData);
  const [target, setTarget] = useState(settings.targetWeightKg?.toString() ?? '');

  return (
    <div className="stack">
      <section className="card">
        <h2>Target weight</h2>
        <input value={target} onChange={(e)=>setTarget(e.target.value)} inputMode="decimal" placeholder="kg" />
        <button className="primary" onClick={()=>{
          const n = target.trim() ? Number(target) : null;
          if (n !== null && (!Number.isFinite(n) || n <= 0)) return alert('Invalid target');
          setTargetWeight(n);
          alert('Saved');
        }}>Save target</button>
      </section>
      <section className="card">
        <h2>Data</h2>
        <button onClick={()=>{
          const rows = ['date,weightKg,weighTime,pooTime', ...entries.map(e=>`${e.date},${e.weightKg},${e.weighTime},${e.pooTime}`)].join('\n');
          const blob = new Blob([rows], {type:'text/csv'});
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'weight-entries.csv';
          a.click();
          URL.revokeObjectURL(a.href);
        }}>Export CSV</button>
        <button className="danger" onClick={()=>{if(confirm('Reset all data?')) resetAllData();}}>Reset data</button>
      </section>
    </div>
  );
}
