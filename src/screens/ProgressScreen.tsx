import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SegmentedControl } from '../components/SegmentedControl';
import { useAppStore } from '../store/useAppStore';
import { Entry, PooTime, WeighTime } from '../types/models';
import { buildTrendSeries } from '../utils/trend';

const width = 340;

export function ProgressScreen() {
  const entries = useAppStore((s) => s.entries);
  const saveEntry = useAppStore((s) => s.saveEntry);
  const deleteEntry = useAppStore((s) => s.deleteEntry);
  const trend = useMemo(() => buildTrendSeries(entries), [entries]);
  const [range, setRange] = useState<'14' | '30' | 'all'>('30');
  const [editing, setEditing] = useState<Entry | null>(null);
  const [weightInput, setWeightInput] = useState('');

  const filtered = useMemo(() => {
    if (range === 'all') return trend;
    const days = Number(range);
    return trend.slice(-days);
  }, [range, trend]);

  const chartData = {
    labels: filtered.map((p) => p.entry.date.slice(5)).filter((_, i) => i % Math.ceil(filtered.length / 6 || 1) === 0),
    datasets: [
      { data: filtered.map((p) => p.entry.weightKg), color: () => '#64748B', strokeWidth: 2 },
      { data: filtered.map((p) => p.trendWeight), color: () => '#1F6FEB', strokeWidth: 3 },
    ],
    legend: ['Raw', 'Trend'],
  };

  const startEdit = (entry: Entry) => {
    setEditing(entry);
    setWeightInput(entry.weightKg.toString());
  };

  const saveEdit = () => {
    if (!editing) return;
    const weightKg = Number(weightInput);
    if (!Number.isFinite(weightKg) || weightKg <= 0) return;
    saveEntry({ date: editing.date, weightKg, weighTime: editing.weighTime, pooTime: editing.pooTime });
    setEditing(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Progress chart</Text>
        <SegmentedControl
          value={range}
          onChange={setRange}
          options={[
            { label: '14d', value: '14' },
            { label: '30d', value: '30' },
            { label: 'All', value: 'all' },
          ]}
        />
        {filtered.length > 1 ? (
          <LineChart
            data={chartData}
            width={width}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 1,
              color: (o = 1) => `rgba(15, 23, 42, ${o})`,
              labelColor: () => '#334155',
              propsForDots: { r: '3', strokeWidth: '1', stroke: '#1F6FEB' },
            }}
            bezier
            style={styles.chart}
          />
        ) : (
          <Text>Add more entries to view the chart.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Entries</Text>
        {[...entries]
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((entry) => (
            <Pressable key={entry.id} onPress={() => startEdit(entry)} style={styles.row}>
              <View>
                <Text style={styles.rowDate}>{entry.date}</Text>
                <Text>{entry.weightKg.toFixed(1)} kg · {entry.weighTime} · poo {entry.pooTime}</Text>
              </View>
              <Text style={styles.edit}>Edit</Text>
            </Pressable>
          ))}
      </View>

      {editing && (
        <View style={styles.card}>
          <Text style={styles.title}>Edit {editing.date}</Text>
          <TextInput value={weightInput} onChangeText={setWeightInput} keyboardType="decimal-pad" style={styles.input} />
          <SegmentedControl
            value={editing.weighTime}
            onChange={(next: WeighTime) => setEditing({ ...editing, weighTime: next })}
            options={[{ label: 'Morning', value: 'morning' }, { label: 'Afternoon', value: 'afternoon' }, { label: 'Evening', value: 'evening' }]}
          />
          <SegmentedControl
            value={editing.pooTime}
            onChange={(next: PooTime) => setEditing({ ...editing, pooTime: next })}
            options={[{ label: 'None', value: 'none' }, { label: 'Morning', value: 'morning' }, { label: 'Afternoon', value: 'afternoon' }, { label: 'Evening', value: 'evening' }]}
          />
          <View style={styles.actions}>
            <Pressable style={[styles.btn, styles.save]} onPress={saveEdit}><Text style={styles.btnText}>Save</Text></Pressable>
            <Pressable
              style={[styles.btn, styles.delete]}
              onPress={() => Alert.alert('Delete entry?', '', [
                { text: 'Cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    deleteEntry(editing.id);
                    setEditing(null);
                  },
                },
              ])}
            >
              <Text style={styles.btnText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 10 },
  title: { fontWeight: '700', fontSize: 18 },
  chart: { borderRadius: 12, marginTop: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#E2E8F0' },
  rowDate: { fontWeight: '700' },
  edit: { color: '#1F6FEB', fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 12, fontSize: 18 },
  actions: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, alignItems: 'center', borderRadius: 10, paddingVertical: 12 },
  save: { backgroundColor: '#1F6FEB' },
  delete: { backgroundColor: '#DC2626' },
  btnText: { color: '#fff', fontWeight: '700' },
});
