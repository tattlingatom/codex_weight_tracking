import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SegmentedControl } from '../components/SegmentedControl';
import { useAppStore } from '../store/useAppStore';
import { PooTime, WeighTime } from '../types/models';
import { inferDefaultWeighTime, toLocalISODate } from '../utils/date';
import { createProjection } from '../utils/projection';
import { buildTrendSeries } from '../utils/trend';

export function HomeScreen() {
  const today = toLocalISODate(new Date());
  const entries = useAppStore((s) => s.entries);
  const settings = useAppStore((s) => s.settings);
  const saveEntry = useAppStore((s) => s.saveEntry);

  const existingToday = entries.find((e) => e.date === today);
  const [weightInput, setWeightInput] = useState(existingToday?.weightKg.toString() ?? '');
  const [weighTime, setWeighTime] = useState<WeighTime>(existingToday?.weighTime ?? inferDefaultWeighTime());
  const [pooTime, setPooTime] = useState<PooTime>(existingToday?.pooTime ?? 'none');

  const trend = useMemo(() => buildTrendSeries(entries), [entries]);
  const latest = trend[trend.length - 1];
  const projection = useMemo(
    () => createProjection(entries, settings.targetWeightKg),
    [entries, settings.targetWeightKg],
  );

  const onSave = () => {
    const weight = Number(weightInput);
    if (!Number.isFinite(weight) || weight <= 0) {
      Alert.alert('Invalid weight', 'Please enter your weight in kg.');
      return;
    }
    saveEntry({ date: today, weightKg: weight, weighTime, pooTime });
    Alert.alert('Saved', 'Daily check-in saved.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Daily check-in ({today})</Text>
        <TextInput
          value={weightInput}
          onChangeText={setWeightInput}
          keyboardType="decimal-pad"
          placeholder="Weight (kg)"
          style={styles.input}
        />
        <Text style={styles.label}>Weigh time</Text>
        <SegmentedControl
          value={weighTime}
          onChange={setWeighTime}
          options={[
            { label: 'Morning', value: 'morning' },
            { label: 'Afternoon', value: 'afternoon' },
            { label: 'Evening', value: 'evening' },
          ]}
        />
        <Text style={styles.label}>Poo time</Text>
        <SegmentedControl
          value={pooTime}
          onChange={setPooTime}
          options={[
            { label: 'None', value: 'none' },
            { label: 'Morning', value: 'morning' },
            { label: 'Afternoon', value: 'afternoon' },
            { label: 'Evening', value: 'evening' },
          ]}
        />
        <Pressable style={styles.saveButton} onPress={onSave}>
          <Text style={styles.saveLabel}>Save</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Latest stats</Text>
        <Text>Latest weight: {entries[entries.length - 1]?.weightKg?.toFixed(1) ?? '—'} kg</Text>
        <Text>Trend weight: {latest?.trendWeight?.toFixed(1) ?? '—'} kg</Text>
        <Text>
          Weekly change: {projection.weeklyRateKg != null ? `${projection.weeklyRateKg.toFixed(2)} kg/week` : '—'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Projection</Text>
        <Text>Target: {settings.targetWeightKg ? `${settings.targetWeightKg} kg` : 'Not set'}</Text>
        <Text>Projected date: {projection.projectedDate ?? '—'}</Text>
        <Text>Days remaining: {projection.daysToTarget ?? '—'}</Text>
        <Text style={styles.insight}>{projection.insight}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  card: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 14, gap: 10 },
  title: { fontSize: 18, fontWeight: '700' },
  label: { fontWeight: '600', color: '#334155' },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 18,
  },
  saveButton: {
    backgroundColor: '#0E9F6E',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveLabel: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  insight: { marginTop: 6, color: '#0F766E', fontWeight: '600' },
});
