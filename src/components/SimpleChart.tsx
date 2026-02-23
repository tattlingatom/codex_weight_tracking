import React from 'react';
import { TrendPoint } from '../types/models';

const colors = { morning: '#16a34a', afternoon: '#ea580c', evening: '#7c3aed' } as const;

export function SimpleChart({ points }: { points: TrendPoint[] }) {
  if (points.length < 2) return <p>Add more entries to view chart.</p>;

  const w = 360; const h = 220; const pad = 24;
  const ys = points.flatMap((p) => [p.entry.weightKg, p.trendWeight]);
  const minY = Math.min(...ys) - 0.4;
  const maxY = Math.max(...ys) + 0.4;
  const mapX = (i: number) => pad + (i / (points.length - 1)) * (w - pad * 2);
  const mapY = (v: number) => h - pad - ((v - minY) / (maxY - minY || 1)) * (h - pad * 2);

  const raw = points.map((p, i) => `${mapX(i)},${mapY(p.entry.weightKg)}`).join(' ');
  const trend = points.map((p, i) => `${mapX(i)},${mapY(p.trendWeight)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="chart">
      <polyline points={raw} fill="none" stroke="#94a3b8" strokeWidth="2" />
      <polyline points={trend} fill="none" stroke="#2563eb" strokeWidth="3" />
      {points.map((p, i) => (
        <circle
          key={p.entry.id}
          cx={mapX(i)}
          cy={mapY(p.entry.weightKg)}
          r={4}
          fill={colors[p.entry.weighTime]}
          stroke={p.entry.pooTime === 'none' ? '#111827' : '#ffffff'}
          strokeWidth={2}
        />
      ))}
    </svg>
  );
}
