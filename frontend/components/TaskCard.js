import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';

const PRIORITIES = {
  low:    { label: 'Low',    color: '#2F9E44', bg: '#E8F8EE' },
  medium: { label: 'Medium', color: '#E6A817', bg: '#FFF8E6' },
  high:   { label: 'High',   color: '#E53E3E', bg: '#FFF0F0' },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Returns the due Date object for a task, or null if not set. */
function getDueDate(task) {
  if (!task.date || !task.time) return null;
  try { return new Date(`${task.date}T${task.time}:00`); }
  catch { return null; }
}

function getStopBeforeDate(task) {
  if (!task.stopBeforeEnabled || !task.stopBeforeMinutes) return null;
  const due = getDueDate(task);
  if (!due) return null;
  return new Date(due.getTime() - task.stopBeforeMinutes * 60 * 1000);
}

/** Formats minutes → human label, e.g. 90 → "1h 30min" */
function formatMinutes(mins) {
  if (!mins) return '';
  if (mins < 60) return `${mins}min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function useAutoDelete(tasks, setTasks) {
  React.useEffect(() => {
    const check = () => {
      const now = new Date();
      setTasks(prev =>
        prev.filter(task => {
          if (task.done) return true; 
          // 1. Delete if past due date/time
          const due = getDueDate(task);
          if (due && now >= due) return false;

          // 2. Delete if past stop-before cutoff
          const stopAt = getStopBeforeDate(task);
          if (stopAt && now >= stopAt) return false;

          return true;
        })
      );
    };

    check(); // run immediately on mount
    const interval = setInterval(check, 60 * 1000); // re-check every minute
    return () => clearInterval(interval);
  }, [tasks, setTasks]);
}

// ─── TaskCard ────────────────────────────────────────────────────────────────

export default function TaskCard({ task, onToggle, onEdit, onDelete, colors }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const now       = new Date();
  const due       = getDueDate(task);
  const stopAt    = getStopBeforeDate(task);
  const overdue   = due && !task.done && due < now;
  const priority  = PRIORITIES[task.priority] || PRIORITIES.medium;

  // Show stop-before warning when we're inside the "stop window"
  const inStopWindow = stopAt && now >= stopAt && due && now < due;

  const handleDeletePress = () => {
    if (Platform.OS === 'web') {
      // Web: inline confirmation instead of Alert
      setConfirmDelete(true);
    } else {
      Alert.alert(
        'Delete Reminder',
        `Remove "${task.text}"? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => onDelete(task._id) },
        ]
      );
    }
  };

  return (
    <View style={[
      styles.card,
      { backgroundColor: colors.surface, borderColor: overdue ? '#E53E3E55' : colors.border },
      overdue  && !task.done && styles.overdueCard,
      task.done && styles.doneCard,
    ]}>

      {/* ── Inline delete confirmation (web only) ── */}
      {confirmDelete && (
        <View style={[styles.confirmBanner, { backgroundColor: '#FFF0F0', borderColor: '#E53E3E55' }]}>
          <Text style={styles.confirmText}>Delete this reminder?</Text>
          <View style={styles.confirmBtns}>
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
              onPress={() => setConfirmDelete(false)}
            >
              <Text style={{ fontSize: 12, color: colors.muted, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: '#E53E3E' }]}
              onPress={() => { setConfirmDelete(false); onDelete(task._id); }}
            >
              <Text style={{ fontSize: 12, color: '#fff', fontWeight: '700' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.cardContent}>
        {/* ── Checkbox ── */}
        <TouchableOpacity
          onPress={() => onToggle(task._id)}
          style={[styles.checkbox, task.done && { backgroundColor: colors.accent, borderColor: colors.accent }]}
        >
          {task.done && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        {/* ── Main content ── */}
        <View style={styles.details}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }, task.done && styles.strikethrough]}>
              {task.text}
            </Text>
            {overdue && <Text style={styles.overdueBadge}>Overdue</Text>}
          </View>

          {/* ── Badges ── */}
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
            {/* Stop-before badge */}
            {task.stopBeforeEnabled && task.stopBeforeMinutes && (
              <View style={[styles.badge, { backgroundColor: inStopWindow ? '#FFF0F0' : '#F3F0FF' }]}>
                <Text style={[styles.badgeText, { color: inStopWindow ? '#E53E3E' : '#7C4FD4' }]}>
                  ⏹️ -{formatMinutes(task.stopBeforeMinutes)}
                </Text>
              </View>
            )}
          </View>

          {/* ── Meta row ── */}
          <View style={styles.metaRow}>
            {task.date && (
              <Text style={[styles.metaText, { color: overdue ? '#E53E3E' : colors.muted }]}>
                📅 {task.date}
              </Text>
            )}
            {task.time && (
              <Text style={[styles.metaText, { color: overdue ? '#E53E3E' : colors.muted }]}>
                ⏰ {task.time}
              </Text>
            )}
            {task.place && (
              <Text style={[styles.metaText, { color: colors.muted }]}>📍 {task.place}</Text>
            )}
          </View>

          {/* ── Stop-before in-window warning ── */}
          {inStopWindow && (
            <Text style={styles.stopWarning}>
              ⏹️ Reminder stops {formatMinutes(task.stopBeforeMinutes)} before due — will be removed soon
            </Text>
          )}

          {task.notes && (
            <Text style={[styles.notes, { color: colors.muted }]}>{task.notes}</Text>
          )}
        </View>

        {/* ── Action buttons ── */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={() => onEdit(task)}
            style={[styles.actionButton, { backgroundColor: colors.accentLight }]}
          >
            <Text style={[styles.actionText, { color: colors.accent }]}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDeletePress}
            style={[styles.actionButton, { backgroundColor: '#FFF0F0' }]}
          >
            <Text style={[styles.actionText, { fontSize: 12, color: '#E53E3E' }]}>🗑</Text>
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
    overflow: 'hidden',
  },
  overdueCard: {
    shadowColor: '#E53E3E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  doneCard: { opacity: 0.55 },

  // Inline confirm (web)
  confirmBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  confirmText: { fontSize: 12, fontWeight: '600', color: '#E53E3E', flex: 1 },
  confirmBtns: { flexDirection: 'row', gap: 6 },
  confirmBtn:  { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6, borderWidth: 1 },

  cardContent: { flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  checkbox: {
    width: 20, height: 20, borderRadius: 6, borderWidth: 2,
    borderColor: '#E2DEFF', justifyContent: 'center', alignItems: 'center', marginTop: 2,
  },
  checkmark: { fontSize: 11, color: '#fff' },
  details:   { flex: 1 },
  titleRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 },
  title:     { fontWeight: '600', fontSize: 14, flex: 1 },
  strikethrough: { textDecorationLine: 'line-through' },
  overdueBadge: {
    fontSize: 9, fontWeight: '700', backgroundColor: '#FFF0F0', color: '#E53E3E',
    paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 4 },
  badge:    { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  badgeText:{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  metaRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metaText: { fontSize: 11 },
  stopWarning: {
    marginTop: 5, fontSize: 11, color: '#E53E3E',
    fontWeight: '600', fontStyle: 'italic',
  },
  notes: { marginTop: 5, fontSize: 11, fontStyle: 'italic' },
  actionButtons: { flexDirection: 'row', gap: 4 },
  actionButton:  { width: 28, height: 28, borderRadius: 7, justifyContent: 'center', alignItems: 'center' },
  actionText:    { fontSize: 12 },
});