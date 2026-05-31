import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';

const PRIORITIES = {
  low: { label: 'Low', color: '#2F9E44' },
  medium: { label: 'Medium', color: '#E6A817' },
  high: { label: 'High', color: '#E53E3E' },
};

const CATEGORIES = ['Personal', 'Work', 'Health', 'Shopping', 'Finance', 'Other'];
const REPEAT_OPTIONS = ['none', 'daily', 'weekly', 'monthly'];

export default function TaskModal({ visible, task, onClose, onSave, colors }) {
  const [form, setForm] = useState({
    text: task?.text || '',
    time: task?.time || '',
    date: task?.date || '',
    place: task?.place || '',
    priority: task?.priority || 'medium',
    category: task?.category || 'Personal',
    notes: task?.notes || '',
    repeat: task?.repeat || 'none',
    notify: task?.notify !== false,
  });
  const [errors, setErrors] = useState({});

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.text.trim()) newErrors.text = 'Reminder text is required';
    if (form.text.length > 120) newErrors.text = 'Keep it under 120 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      ...task,
      ...form,
      id: task?.id || Date.now().toString(),
      done: task?.done || false,
      createdAt: task?.createdAt || new Date().toISOString(),
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {task?.id ? 'Edit Reminder' : 'New Reminder'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeText, { color: colors.muted }]}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.label, { color: colors.muted }]}>What to remember *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}
              placeholder="e.g. Buy groceries from the market..."
              placeholderTextColor={colors.muted}
              multiline
              rows={2}
              value={form.text}
              onChangeText={(v) => updateForm('text', v)}
            />
            {errors.text && <Text style={styles.errorText}>{errors.text}</Text>}
            <Text style={[styles.charCount, { color: form.text.length > 100 ? '#E6A817' : colors.muted }]}>
              {form.text.length}/120
            </Text>

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text style={[styles.label, { color: colors.muted }]}>Date</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.muted}
                  value={form.date}
                  onChangeText={(v) => updateForm('date', v)}
                />
              </View>
              <View style={styles.rowItem}>
                <Text style={[styles.label, { color: colors.muted }]}>Time</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.muted}
                  value={form.time}
                  onChangeText={(v) => updateForm('time', v)}
                />
              </View>
            </View>

            <Text style={[styles.label, { color: colors.muted }]}>Location</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}
              placeholder="📍 Office, Home, Mall..."
              placeholderTextColor={colors.muted}
              value={form.place}
              onChangeText={(v) => updateForm('place', v)}
            />

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text style={[styles.label, { color: colors.muted }]}>Priority</Text>
                <View style={styles.priorityContainer}>
                  {Object.entries(PRIORITIES).map(([key, val]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.priorityButton,
                        { borderColor: val.color },
                        form.priority === key && { backgroundColor: val.color + '20' },
                      ]}
                      onPress={() => updateForm('priority', key)}
                    >
                      <Text style={[styles.priorityText, { color: val.color }]}>{val.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.rowItem}>
                <Text style={[styles.label, { color: colors.muted }]}>Category</Text>
                <View style={styles.categoryContainer}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryButton,
                        { borderColor: colors.border, backgroundColor: colors.surfaceAlt },
                        form.category === cat && { borderColor: colors.accent, backgroundColor: colors.accentLight },
                      ]}
                      onPress={() => updateForm('category', cat)}
                    >
                      <Text style={[styles.categoryText, { color: form.category === cat ? colors.accent : colors.text }]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <Text style={[styles.label, { color: colors.muted }]}>Repeat</Text>
            <View style={styles.repeatContainer}>
              {REPEAT_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.repeatButton,
                    { borderColor: colors.border, backgroundColor: colors.surfaceAlt },
                    form.repeat === opt && { borderColor: colors.accent, backgroundColor: colors.accentLight },
                  ]}
                  onPress={() => updateForm('repeat', opt)}
                >
                  <Text style={[styles.repeatText, { color: form.repeat === opt ? colors.accent : colors.text }]}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.muted }]}>Notes</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text, height: 80 }]}
              placeholder="Any extra details..."
              placeholderTextColor={colors.muted}
              multiline
              value={form.notes}
              onChangeText={(v) => updateForm('notes', v)}
            />

            <View style={[styles.switchContainer, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <View>
                <Text style={[styles.switchLabel, { color: colors.text }]}>🔔 Enable notification</Text>
                <Text style={[styles.switchSubtext, { color: colors.muted }]}>Alert when this reminder is due</Text>
              </View>
              <Switch
                value={form.notify}
                onValueChange={(v) => updateForm('notify', v)}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.cancelButton, { borderColor: colors.border }]} onPress={onClose}>
                <Text style={[styles.cancelText, { color: colors.muted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.accent }]} onPress={handleSave}>
                <Text style={styles.saveText}>{task?.id ? 'Save Changes' : 'Add Reminder'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 22,
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    borderRadius: 8,
    borderWidth: 1.5,
    padding: 10,
    fontSize: 13,
    marginBottom: 3,
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 11,
    marginBottom: 4,
  },
  charCount: {
    fontSize: 10,
    textAlign: 'right',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  rowItem: {
    flex: 1,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  priorityButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
  },
  repeatContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  repeatButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  repeatText: {
    fontSize: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    marginBottom: 18,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  switchSubtext: {
    fontSize: 11,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});