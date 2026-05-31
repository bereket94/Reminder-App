import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function UpcomingStrip({ tasks, colors }) {
  const now = new Date();
  const upcoming = tasks
    .filter(t => !t.done && t.date && t.time)
    .map(t => ({ ...t, due: new Date(`${t.date}T${t.time}`) }))
    .filter(t => t.due >= now)
    .sort((a, b) => a.due - b.due)
    .slice(0, 3);

  if (!upcoming.length) return null;

  const getTimeLabel = (due) => {
    const diffMs = due - now;
    const diffMin = Math.round(diffMs / 60000);
    if (diffMin < 60) return `in ${diffMin}m`;
    if (diffMin < 1440) return `in ${Math.round(diffMin / 60)}h`;
    return `in ${Math.round(diffMin / 1440)}d`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.accentLight, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.accent }]}>⏰ Coming up</Text>
      {upcoming.map(task => (
        <View key={task.id} style={styles.taskRow}>
          <Text style={[styles.taskText, { color: colors.text }]} numberOfLines={1}>
            {task.text}
          </Text>
          <Text style={[styles.timeLabel, { color: colors.accent }]}>{getTimeLabel(task.due)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 8,
  },
});