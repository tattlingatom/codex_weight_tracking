import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props<T extends string> {
  value: T;
  options: { label: string; value: T }[];
  onChange: (next: T) => void;
}

export function SegmentedControl<T extends string>({ value, options, onChange }: Props<T>) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.option, selected && styles.selected]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: '#EEF1F6',
    borderRadius: 14,
    padding: 4,
    gap: 6,
  },
  option: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  selected: {
    backgroundColor: '#1F6FEB',
  },
  label: {
    color: '#334155',
    fontWeight: '600',
  },
  selectedLabel: {
    color: '#FFFFFF',
  },
});
