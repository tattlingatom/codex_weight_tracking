import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppStore } from '../store/useAppStore';

export function OnboardingScreen() {
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const setTargetWeight = useAppStore((s) => s.setTargetWeight);
  const [target, setTarget] = useState('');

  const onContinue = () => {
    const parsed = Number(target);
    if (Number.isFinite(parsed) && parsed > 0) {
      setTargetWeight(parsed);
    }
    completeOnboarding();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Track your weight trend and projected target date</Text>
      <TextInput
        value={target}
        onChangeText={setTarget}
        keyboardType="decimal-pad"
        placeholder="Target weight (kg)"
        style={styles.input}
      />
      <Pressable style={styles.button} onPress={onContinue}><Text style={styles.btnLabel}>Continue</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', gap: 16, backgroundColor: '#F8FAFC' },
  title: { fontSize: 26, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 14, fontSize: 18, backgroundColor: '#fff' },
  button: { backgroundColor: '#1F6FEB', borderRadius: 12, alignItems: 'center', padding: 14 },
  btnLabel: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
