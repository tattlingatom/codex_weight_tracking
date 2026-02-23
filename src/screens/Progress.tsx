import React, { useMemo, useState } from 'react';
import { SegmentedControl } from '../components/SegmentedControl';
import { SimpleChart } from '../components/SimpleChart';
import { useAppStore } from '../store/useAppStore';
import { Entry, PooTime, WeighTime } from '../types/models';
import { buildTrendSeries } from '../utils/trend';

export function Progress() {
  const entries = useAppStore((s) => s.entries);
  const saveEntry = useAppStore((s) => s.saveEntry);
  const deleteEntry = useAppStore((s) => s.deleteEntry);
  const [range, setRange] = useState<'14'|'30'|'all'>('30');
  const [editing, setEditing] = useState<Entry | null>(null);
  const trend = useMemo(() => buildTrendSeries(entries), [entries]);
  const data = useMemo(() => range === 'all' ? trend : trend.slice(-Number(range)), [range, trend]);

  return (
    <div className="stack">
      <section className="card">
        <h2>Progress</h2>
        <SegmentedControl value={range} onChange={setRange} options={[{label:'14d',value:'14'},{label:'30d',value:'30'},{label:'All',value:'all'}]} />
        <SimpleChart points={data} />
        <small>Raw line: gray · Trend line: blue · Point color by weigh time · dark ring = poo none.</small>
      </section>
      <section className="card">
        <h2>Entries</h2>
        {[...entries].sort((a,b)=>b.date.localeCompare(a.date)).map((e)=>(
          <button className="row-btn" key={e.id} onClick={()=>setEditing(e)}>
            <span>{e.date}</span>
            <span>{e.weightKg.toFixed(1)} kg · {e.weighTime} · poo {e.pooTime}</span>
          </button>
        ))}
      </section>
      {editing && (
        <section className="card">
          <h3>Edit {editing.date}</h3>
          <input value={String(editing.weightKg)} onChange={(e)=>setEditing({...editing, weightKg: Number(e.target.value)})} inputMode="decimal" />
          <SegmentedControl value={editing.weighTime} onChange={(v: WeighTime)=>setEditing({...editing, weighTime:v})} options={[{label:'Morning',value:'morning'},{label:'Afternoon',value:'afternoon'},{label:'Evening',value:'evening'}]} />
          <SegmentedControl value={editing.pooTime} onChange={(v: PooTime)=>setEditing({...editing, pooTime:v})} options={[{label:'None',value:'none'},{label:'Morning',value:'morning'},{label:'Afternoon',value:'afternoon'},{label:'Evening',value:'evening'}]} />
          <div className="grid-2">
            <button className="primary" onClick={()=>{saveEntry({date:editing.date, weightKg: editing.weightKg, weighTime: editing.weighTime, pooTime: editing.pooTime}); setEditing(null);}}>Save</button>
            <button className="danger" onClick={()=>{if(confirm('Delete this entry?')){deleteEntry(editing.id); setEditing(null);}}}>Delete</button>
          </div>
        </section>
      )}
    </div>
  );
}
