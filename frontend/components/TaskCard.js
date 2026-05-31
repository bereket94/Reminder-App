import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const PRIORITIES = {
  low: { label: 'Low', color: '#2F9E44', bg: '#E8F8EE' },
  medium: { label: 'Medium', color: '#E6A817', bg: '#FFF8E6' },
  high: { label: 'High', color: '#E53E3E', bg: '#FFF0F0' },
};

export default function TaskCard({ task, onToggle, onEdit, onDelete, colors }) {
  const now = new Date();
  const due = task.date && task.time ? new Date(`${task.date}T${task.time}`) : null;
  const overdue = due && !task.done && due < now;
  const priority = PRIORITIES[task.priority];

  return (
    <View style={[
      styles.card,
      { backgroundColor: colors.surface, borderColor: overdue ? '#E53E3E55' : colors.border },
      overdue && !task.done && styles.overdueCard,
      task.done && styles.doneCard,
    ]}>
      <View style={styles.cardContent}>
        <TouchableOpacity onPress={() => onToggle(task.id)} style={styles.checkbox}>
          {task.done && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        <View style={styles.details}>
          <View style={styles.titleRow}>
            <Text style={[
              styles.title,
              { color: colors.text },
              task.done && styles.strikethrough,
            ]}>{task.text}</Text>
            {overdue && <Text style={styles.overdueBadge}>Overdue</Text>}
          </View>

          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: priority.bg }]}>
              <Text style={[styles.badgeText, { color: priority.color }]}>{priority.label}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.accentLight }]}>
              <Text style={[styles.badgeText, { color: colors.accent }]}>{task.category}</Text>
            </View>
            {task.repeat && task.repeat !== 'none' && (
              <View style={[styles.badge, { backgroundColor: colors.accentLight }]}>
                <Text style={[styles.badgeText, { color: colors.accent }]}>🔁 {task.repeat}</Text>
              </View>
            )}
            {task.notify !== false && (
              <View style={[styles.badge, { backgroundColor: colors.accentLight }]}>
                <Text style={[styles.badgeText, { color: colors.accent }]}>🔔 notify</Text>
              </View>
            )}
          </View>

          <View style={styles.metaRow}>
            {task.date && <Text style={[styles.metaText, { color: overdue ? '#E53E3E' : colors.muted }]}>📅 {task.date}</Text>}
            {task.time && <Text style={[styles.metaText, { color: overdue ? '#E53E3E' : colors.muted }]}>⏰ {task.time}</Text>}
            {task.place && <Text style={[styles.metaText, { color: colors.muted }]}>📍 {task.place}</Text>}
          </View>

          {task.notes && (
            <Text style={[styles.notes, { color: colors.muted }]}>{task.notes}</Text>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => onEdit(task)} style={[styles.actionButton, { backgroundColor: colors.accentLight }]}>
            <Text style={[styles.actionText, { color: colors.accent }]}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(task.id)} style={[styles.actionButton, { backgroundColor: '#FFF0F0' }]}>
            <Text style={[styles.actionText, { color: '#E53E3E' }]}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    padding: 13,
  },
  overdueCard: {
    shadowColor: '#E53E3E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  doneCard: {
    opacity: 0.55,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E2DEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 11,
    color: '#6C4EF6',
  },
  details: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  title: {
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  overdueBadge: {
    fontSize: 9,
    fontWeight: '700',
    backgroundColor: '#FFF0F0',
    color: '#E53E3E',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaText: {
    fontSize: 11,
  },
  notes: {
    marginTop: 5,
    fontSize: 11,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
  },
});