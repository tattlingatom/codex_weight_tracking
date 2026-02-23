import React, { useEffect, useState } from 'react';
import { Home } from './screens/Home';
import { Onboarding } from './screens/Onboarding';
import { Progress } from './screens/Progress';
import { Settings } from './screens/Settings';
import { useAppStore } from './store/useAppStore';

type Tab = 'home' | 'progress' | 'settings';

export function App() {
  const [tab, setTab] = useState<Tab>('home');
  const settings = useAppStore((s) => s.settings);
  const hydrated = useAppStore((s) => s.hydrated);
  const hydrate = useAppStore((s) => s.hydrate);
  const seed = useAppStore((s) => s.seedIfEmpty);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated) seed();
  }, [hydrated, seed]);

  if (!hydrated) return <div className="center-card"><p>Loading…</p></div>;
  if (!settings.onboardingCompleted) return <Onboarding />;

  return (
    <main className="app">
      <header><h1>Weight Trend Tracker</h1></header>
      {tab === 'home' && <Home />}
      {tab === 'progress' && <Progress />}
      {tab === 'settings' && <Settings />}
      <nav className="tabs">
        <button className={tab==='home'?'tab active':'tab'} onClick={()=>setTab('home')}>Home</button>
        <button className={tab==='progress'?'tab active':'tab'} onClick={()=>setTab('progress')}>Progress</button>
        <button className={tab==='settings'?'tab active':'tab'} onClick={()=>setTab('settings')}>Settings</button>
      </nav>
    </main>
  );
}
