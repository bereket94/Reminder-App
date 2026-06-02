import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StatsBar({ tasks, colors }) {
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const urgent = tasks.filter(t => t.priority === 'high' && !t.done).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  const stats = [
    { label: 'Total', value: total, color: colors.accent, bg: colors.accentLight },
    { label: 'Done', value: `${percent}%`, color: '#2F9E44', bg: '#E8F8EE' },
    { label: 'Urgent', value: urgent, color: '#E53E3E', bg: '#FFF0F0' },
  ];

  return (
    <View style={styles.container}>
      {stats.map(stat => (
        <View key={stat.label} style={[styles.statCard, { backgroundColor: stat.bg }]}>
          <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
          <Text style={[styles.statLabel, { color: stat.color }]}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});