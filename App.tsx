import React, { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View, Pressable } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { useAppStore } from './src/store/useAppStore';

type Tab = 'home' | 'progress' | 'settings';

export default function App() {
  const settings = useAppStore((s) => s.settings);
  const seedIfEmpty = useAppStore((s) => s.seedIfEmpty);
  const [tab, setTab] = useState<Tab>('home');

  useEffect(() => {
    seedIfEmpty();
  }, [seedIfEmpty]);

  if (!settings.onboardingCompleted) {
    return <OnboardingScreen />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.page}>
        {tab === 'home' && <HomeScreen />}
        {tab === 'progress' && <ProgressScreen />}
        {tab === 'settings' && <SettingsScreen />}
      </View>
      <View style={styles.tabbar}>
        <TabButton active={tab === 'home'} label="Home" onPress={() => setTab('home')} />
        <TabButton active={tab === 'progress'} label="Progress" onPress={() => setTab('progress')} />
        <TabButton active={tab === 'settings'} label="Settings" onPress={() => setTab('settings')} />
      </View>
    </SafeAreaView>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tabButton, active && styles.tabButtonActive]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F1F5F9' },
  page: { flex: 1 },
  tabbar: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#fff' },
  tabButton: { flex: 1, alignItems: 'center', borderRadius: 10, paddingVertical: 12 },
  tabButtonActive: { backgroundColor: '#DBEAFE' },
  tabText: { color: '#475569', fontWeight: '600' },
  tabTextActive: { color: '#1D4ED8' },
});
