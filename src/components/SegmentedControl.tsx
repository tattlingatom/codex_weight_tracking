import React from 'react';

type Option<T extends string> = { label: string; value: T };

export function SegmentedControl<T extends string>({ value, options, onChange }: { value: T; options: Option<T>[]; onChange: (v: T) => void }) {
  return (
    <div className="segment">
      {options.map((o) => (
        <button key={o.value} className={o.value === value ? 'seg-btn active' : 'seg-btn'} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
