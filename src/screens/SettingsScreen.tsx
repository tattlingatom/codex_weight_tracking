import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppStore } from '../store/useAppStore';

export function SettingsScreen() {
  const settings = useAppStore((s) => s.settings);
  const entries = useAppStore((s) => s.entries);
  const setTargetWeight = useAppStore((s) => s.setTargetWeight);
  const resetAllData = useAppStore((s) => s.resetAllData);

  const [targetInput, setTargetInput] = useState(settings.targetWeightKg?.toString() ?? '');

  const saveTarget = () => {
    const next = targetInput.trim() === '' ? null : Number(targetInput);
    if (next !== null && (!Number.isFinite(next) || next <= 0)) {
      Alert.alert('Invalid target', 'Please enter a valid number in kg.');
      return;
    }
    setTargetWeight(next);
    Alert.alert('Saved', 'Target weight updated.');
  };

  const exportCsv = () => {
    const header = 'date,weightKg,weighTime,pooTime';
    const lines = entries.map((e) => `${e.date},${e.weightKg},${e.weighTime},${e.pooTime}`);
    Alert.alert('CSV preview', [header, ...lines].slice(0, 12).join('\n'));
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Target weight (kg)</Text>
        <TextInput
          value={targetInput}
          onChangeText={setTargetInput}
          keyboardType="decimal-pad"
          placeholder="e.g. 72"
          style={styles.input}
        />
        <Pressable style={styles.primary} onPress={saveTarget}><Text style={styles.btnLabel}>Save target</Text></Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Data</Text>
        <Pressable style={styles.secondary} onPress={exportCsv}><Text>Export CSV (preview)</Text></Pressable>
        <Pressable
          style={styles.danger}
          onPress={() =>
            Alert.alert('Reset all data?', 'This will remove all entries and settings.', [
              { text: 'Cancel' },
              { text: 'Reset', style: 'destructive', onPress: resetAllData },
            ])
          }
        >
          <Text style={styles.btnLabel}>Reset data</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 10 },
  title: { fontSize: 18, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 12, fontSize: 18 },
  primary: { backgroundColor: '#1F6FEB', borderRadius: 10, alignItems: 'center', padding: 12 },
  secondary: { backgroundColor: '#E2E8F0', borderRadius: 10, alignItems: 'center', padding: 12 },
  danger: { backgroundColor: '#DC2626', borderRadius: 10, alignItems: 'center', padding: 12 },
  btnLabel: { color: '#fff', fontWeight: '700' },
});
