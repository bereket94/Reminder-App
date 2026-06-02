import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Platform,
} from 'react-native';

let DateTimePicker = null;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

const PRIORITIES = {
  low:    { label: 'Low',    color: '#2F9E44', icon: '🟢' },
  medium: { label: 'Medium', color: '#E6A817', icon: '🟡' },
  high:   { label: 'High',   color: '#E53E3E', icon: '🔴' },
};

const CATEGORIES = ['Personal', 'Work', 'Health', 'Shopping', 'Finance', 'Other'];
const CATEGORY_ICONS = { Personal: '👤', Work: '💼', Health: '❤️', Shopping: '🛒', Finance: '💰', Other: '📌' };
const REPEAT_OPTIONS = ['none', 'daily', 'weekly', 'monthly'];
const REPEAT_ICONS   = { none: '🚫', daily: '📅', weekly: '📆', monthly: '🗓️' };

// Preset stop-before options (minutes)
const STOP_BEFORE_PRESETS = [
  { label: '5 min',  value: 5 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '1 hr',   value: 60 },
  { label: '2 hr',   value: 120 },
  { label: 'Custom', value: null },
];

function WebDateInput({ value, onChange, colors }) {
  return (
    <input
      type="date"
      value={value || ''}
      min={new Date().toISOString().split('T')[0]}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', padding: '11px 12px', fontSize: 14, borderRadius: 10,
        border: `1.5px solid ${colors.border}`, backgroundColor: colors.surfaceAlt,
        color: colors.text, outline: 'none', boxSizing: 'border-box',
        marginBottom: 14, fontFamily: 'inherit',
      }}
    />
  );
}

function WebTimeInput({ value, onChange, colors }) {
  return (
    <input
      type="time"
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', padding: '11px 12px', fontSize: 14, borderRadius: 10,
        border: `1.5px solid ${colors.border}`, backgroundColor: colors.surfaceAlt,
        color: colors.text, outline: 'none', boxSizing: 'border-box',
        marginBottom: 14, fontFamily: 'inherit',
      }}
    />
  );
}

function Dropdown({ label, value, options, onSelect, renderOption, colors }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ zIndex: open ? 99 : 1, marginBottom: 14 }}>
      {label && <Text style={[dropStyles.label, { color: colors.muted }]}>{label}</Text>}
      <TouchableOpacity
        style={[dropStyles.trigger, { backgroundColor: colors.surfaceAlt, borderColor: open ? colors.accent : colors.border }]}
        onPress={() => setOpen(o => !o)}
        activeOpacity={0.8}
      >
        <Text style={[dropStyles.triggerText, { color: colors.text }]}>
          {renderOption ? renderOption(value, true) : value}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 12 }}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={[dropStyles.menu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {options.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[dropStyles.menuItem, opt === value && { backgroundColor: colors.accentLight }]}
              onPress={() => { onSelect(opt); setOpen(false); }}
            >
              <Text style={[dropStyles.menuText, { color: opt === value ? colors.accent : colors.text }]}>
                {renderOption ? renderOption(opt, false) : opt}
              </Text>
              {opt === value && <Text style={{ color: colors.accent, fontSize: 12 }}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ---------- Stop Before Selector ----------
function StopBeforeSelector({ enabled, minutes, onToggle, onMinutesChange, colors }) {
  const [customInput, setCustomInput] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  useEffect(() => {
    // Determine if current value matches a preset
    const isPreset = STOP_BEFORE_PRESETS.some(p => p.value === minutes && p.value !== null);
    if (!isPreset && minutes != null) {
      setUseCustom(true);
      setCustomInput(String(minutes));
    } else {
      setUseCustom(false);
    }
  }, []);

  const handlePreset = (preset) => {
    if (preset.value === null) {
      setUseCustom(true);
      setCustomInput('');
      onMinutesChange(null);
    } else {
      setUseCustom(false);
      onMinutesChange(preset.value);
    }
  };

  const handleCustomChange = (val) => {
    setCustomInput(val);
    const n = parseInt(val, 10);
    if (!isNaN(n) && n > 0) onMinutesChange(n);
    else onMinutesChange(null);
  };

  return (
    <View style={[sbStyles.container, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
      {/* Toggle row */}
      <View style={sbStyles.toggleRow}>
        <View style={{ flex: 1 }}>
          <Text style={[sbStyles.toggleLabel, { color: colors.text }]}>⏹️  Stop reminder before due</Text>
          <Text style={[sbStyles.toggleSub, { color: colors.muted }]}>
            Auto-delete the task this much time before it's due
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor="#fff"
        />
      </View>

      {/* Preset chips + custom input */}
      {enabled && (
        <>
          <View style={sbStyles.chipsRow}>
            {STOP_BEFORE_PRESETS.map(preset => {
              const isSelected = preset.value === null
                ? useCustom
                : !useCustom && minutes === preset.value;
              return (
                <TouchableOpacity
                  key={preset.label}
                  style={[
                    sbStyles.chip,
                    { borderColor: isSelected ? colors.accent : colors.border,
                      backgroundColor: isSelected ? colors.accentLight : colors.surface },
                  ]}
                  onPress={() => handlePreset(preset)}
                >
                  <Text style={[sbStyles.chipText, { color: isSelected ? colors.accent : colors.muted }]}>
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {useCustom && (
            <View style={sbStyles.customRow}>
              <TextInput
                style={[sbStyles.customInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
                placeholder="Enter minutes"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                value={customInput}
                onChangeText={handleCustomChange}
              />
              <Text style={[sbStyles.customUnit, { color: colors.muted }]}>minutes before</Text>
            </View>
          )}

          {minutes != null && (
            <Text style={[sbStyles.summary, { color: colors.accent }]}>
              ✅ Task will be removed {minutes >= 60 ? `${minutes / 60}h` : `${minutes}min`} before it's due
            </Text>
          )}
        </>
      )}
    </View>
  );
}

// ---------- Main Modal ----------
export default function TaskModal({ visible, task, onClose, onSave, colors }) {
  const [form, setForm] = useState(defaultForm(task));
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const getDateObject = () => {
    try {
      const dateStr = form.date || new Date().toISOString().split('T')[0];
      const timeStr = form.time || '08:00';
      return new Date(`${dateStr}T${timeStr}:00`);
    } catch { return new Date(); }
  };

  useEffect(() => {
    setForm(defaultForm(task));
    setErrors({});
    setShowDatePicker(false);
    setShowTimePicker(false);
  }, [task, visible]);

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (event.type === 'dismissed') { setShowDatePicker(false); return; }
    if (selectedDate) {
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const d = String(selectedDate.getDate()).padStart(2, '0');
      updateForm('date', `${y}-${m}-${d}`);
    }
  };

  const onTimeChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (event.type === 'dismissed') { setShowTimePicker(false); return; }
    if (selectedDate) {
      const h = String(selectedDate.getHours()).padStart(2, '0');
      const min = String(selectedDate.getMinutes()).padStart(2, '0');
      updateForm('time', `${h}:${min}`);
    }
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return 'Select date';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return dateStr; }
  };

  const formatDisplayTime = (timeStr) => {
    if (!timeStr) return 'Select time';
    try {
      const [h, m] = timeStr.split(':').map(Number);
      const ampm = h < 12 ? 'AM' : 'PM';
      const h12 = h % 12 === 0 ? 12 : h % 12;
      return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
    } catch { return timeStr; }
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
      done: task?.done || false,
      createdAt: task?.createdAt || new Date().toISOString(),
    });
  };

  const isEditing = !!task?._id;
  const isWeb = Platform.OS === 'web';

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]}>
              {isEditing ? '✏️  Edit Reminder' : '➕  New Reminder'}
            </Text>
            <TouchableOpacity onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Text style={{ color: colors.muted, fontSize: 20, lineHeight: 22 }}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 36 }}>

            {/* ---- Text ---- */}
            <Text style={[styles.label, { color: colors.muted }]}>What to remember *</Text>
            <TextInput
              style={[styles.textInput, {
                backgroundColor: colors.surfaceAlt,
                borderColor: errors.text ? '#E53E3E' : colors.border,
                color: colors.text,
              }]}
              placeholder="e.g. Buy groceries from the market..."
              placeholderTextColor={colors.muted}
              multiline
              value={form.text}
              onChangeText={v => updateForm('text', v)}
            />
            {errors.text
              ? <Text style={styles.error}>{errors.text}</Text>
              : <Text style={[styles.charCount, { color: form.text.length > 100 ? '#E6A817' : colors.muted }]}>
                  {form.text.length}/120
                </Text>
            }

            {/* ---- Date ---- */}
            <Text style={[styles.label, { color: colors.muted }]}>📅  Date</Text>
            {isWeb ? (
              <WebDateInput value={form.date} onChange={v => updateForm('date', v)} colors={colors} />
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.pickerTrigger, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                  onPress={() => { setShowTimePicker(false); setShowDatePicker(true); }}
                >
                  <Text style={{ fontSize: 16 }}>📅</Text>
                  <Text style={[styles.pickerTriggerText, { color: form.date ? colors.text : colors.muted }]}>
                    {formatDisplayDate(form.date)}
                  </Text>
                  <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '600' }}>Change</Text>
                </TouchableOpacity>
                {showDatePicker && DateTimePicker && (
                  Platform.OS === 'ios' ? (
                    <View style={[styles.iosPickerWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                      <DateTimePicker
                        value={getDateObject()} mode="date" display="spinner"
                        onChange={onDateChange} minimumDate={new Date()}
                        textColor={colors.text} style={{ height: 160 }}
                      />
                      <TouchableOpacity style={[styles.iosDoneBtn, { backgroundColor: colors.accent }]} onPress={() => setShowDatePicker(false)}>
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <DateTimePicker value={getDateObject()} mode="date" display="default" onChange={onDateChange} minimumDate={new Date()} />
                  )
                )}
              </>
            )}

            {/* ---- Time ---- */}
            <Text style={[styles.label, { color: colors.muted }]}>⏰  Time</Text>
            {isWeb ? (
              <WebTimeInput value={form.time} onChange={v => updateForm('time', v)} colors={colors} />
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.pickerTrigger, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                  onPress={() => { setShowDatePicker(false); setShowTimePicker(true); }}
                >
                  <Text style={{ fontSize: 16 }}>⏰</Text>
                  <Text style={[styles.pickerTriggerText, { color: form.time ? colors.text : colors.muted }]}>
                    {formatDisplayTime(form.time)}
                  </Text>
                  <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '600' }}>Change</Text>
                </TouchableOpacity>
                {showTimePicker && DateTimePicker && (
                  Platform.OS === 'ios' ? (
                    <View style={[styles.iosPickerWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                      <DateTimePicker
                        value={getDateObject()} mode="time" display="spinner"
                        onChange={onTimeChange} textColor={colors.text} style={{ height: 160 }}
                      />
                      <TouchableOpacity style={[styles.iosDoneBtn, { backgroundColor: colors.accent }]} onPress={() => setShowTimePicker(false)}>
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <DateTimePicker value={getDateObject()} mode="time" display="default" onChange={onTimeChange} />
                  )
                )}
              </>
            )}

            {/* ---- Location ---- */}
            <Text style={[styles.label, { color: colors.muted }]}>📍  Location</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}
              placeholder="Office, Home, Mall..."
              placeholderTextColor={colors.muted}
              value={form.place}
              onChangeText={v => updateForm('place', v)}
            />

            {/* ---- Priority ---- */}
            <Dropdown
              label="🎯  Priority"
              value={form.priority}
              options={Object.keys(PRIORITIES)}
              renderOption={p => `${PRIORITIES[p].icon}  ${PRIORITIES[p].label}`}
              onSelect={v => updateForm('priority', v)}
              colors={colors}
            />

            {/* ---- Category ---- */}
            <Dropdown
              label="🗂️  Category"
              value={form.category}
              options={CATEGORIES}
              renderOption={c => `${CATEGORY_ICONS[c]}  ${c}`}
              onSelect={v => updateForm('category', v)}
              colors={colors}
            />

            {/* ---- Repeat ---- */}
            <Dropdown
              label="🔁  Repeat"
              value={form.repeat}
              options={REPEAT_OPTIONS}
              renderOption={r => `${REPEAT_ICONS[r]}  ${r.charAt(0).toUpperCase() + r.slice(1)}`}
              onSelect={v => updateForm('repeat', v)}
              colors={colors}
            />

            {/* ---- Notes ---- */}
            <Text style={[styles.label, { color: colors.muted }]}>📝  Notes</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
                color: colors.text,
                height: 72,
              }]}
              placeholder="Any extra details..."
              placeholderTextColor={colors.muted}
              multiline
              value={form.notes}
              onChangeText={v => updateForm('notes', v)}
            />

            {/* ---- Notify ---- */}
            <View style={[styles.switchRow, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <View>
                <Text style={[styles.switchLabel, { color: colors.text }]}>🔔 Enable notification</Text>
                <Text style={[styles.switchSub, { color: colors.muted }]}>Alert when this reminder is due</Text>
              </View>
              <Switch
                value={form.notify}
                onValueChange={v => updateForm('notify', v)}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#fff"
              />
            </View>

            {/* ---- Stop Before ---- */}
            <StopBeforeSelector
              enabled={form.stopBeforeEnabled}
              minutes={form.stopBeforeMinutes}
              onToggle={v => updateForm('stopBeforeEnabled', v)}
              onMinutesChange={v => updateForm('stopBeforeMinutes', v)}
              colors={colors}
            />

            {/* ---- Buttons ---- */}
            <View style={styles.btnRow}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={onClose}>
                <Text style={[styles.cancelText, { color: colors.muted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.accent }]} onPress={handleSave}>
                <Text style={styles.saveText}>{isEditing ? 'Save Changes' : 'Add Reminder'}</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function defaultForm(task) {
  return {
    text:               task?.text               || '',
    time:               task?.time               || '08:00',
    date:               task?.date               || new Date().toISOString().split('T')[0],
    place:              task?.place              || '',
    priority:           task?.priority           || 'medium',
    category:           task?.category           || 'Personal',
    notes:              task?.notes              || '',
    repeat:             task?.repeat             || 'none',
    notify:             task?.notify             !== false,
    stopBeforeEnabled:  task?.stopBeforeEnabled  || false,
    stopBeforeMinutes:  task?.stopBeforeMinutes  || null,
  };
}

const styles = StyleSheet.create({
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet:          { borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 20, maxHeight: '94%' },
  handleRow:      { alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  handle:         { width: 36, height: 4, borderRadius: 2 },
  titleRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, marginTop: 4 },
  title:          { fontSize: 17, fontWeight: '800' },
  closeBtn:       { width: 30, height: 30, borderRadius: 8, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  label:          { fontSize: 11, fontWeight: '700', marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' },
  textInput:      { borderRadius: 10, borderWidth: 1.5, padding: 11, fontSize: 13, marginBottom: 3, minHeight: 56 },
  input:          { borderRadius: 10, borderWidth: 1.5, padding: 11, fontSize: 13, marginBottom: 14 },
  error:          { color: '#E53E3E', fontSize: 11, marginBottom: 10 },
  charCount:      { fontSize: 10, textAlign: 'right', marginBottom: 14 },
  pickerTrigger:  { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 14 },
  pickerTriggerText: { flex: 1, fontSize: 14, fontWeight: '500' },
  iosPickerWrap:  { borderRadius: 12, borderWidth: 1.5, overflow: 'hidden', marginBottom: 10, paddingBottom: 8 },
  iosDoneBtn:     { marginHorizontal: 16, marginTop: 4, padding: 10, borderRadius: 8, alignItems: 'center' },
  switchRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 10, padding: 14, borderWidth: 1, marginBottom: 14 },
  switchLabel:    { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  switchSub:      { fontSize: 11 },
  btnRow:         { flexDirection: 'row', gap: 10, marginTop: 6 },
  cancelBtn:      { flex: 1, padding: 13, borderRadius: 10, borderWidth: 1.5, alignItems: 'center' },
  cancelText:     { fontSize: 14, fontWeight: '600' },
  saveBtn:        { flex: 2, padding: 13, borderRadius: 10, alignItems: 'center' },
  saveText:       { color: '#fff', fontSize: 14, fontWeight: '700' },
});

const dropStyles = StyleSheet.create({
  label:      { fontSize: 11, fontWeight: '700', marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' },
  trigger:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 11 },
  triggerText:{ fontSize: 13, fontWeight: '500' },
  menu:       { position: 'absolute', top: '100%', left: 0, right: 0, borderRadius: 10, borderWidth: 1.5, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8 },
  menuItem:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11 },
  menuText:   { fontSize: 13, fontWeight: '500' },
});

const sbStyles = StyleSheet.create({
  container:   { borderRadius: 10, borderWidth: 1, padding: 14, marginBottom: 20 },
  toggleRow:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toggleLabel: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  toggleSub:   { fontSize: 11 },
  chipsRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  chip:        { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5 },
  chipText:    { fontSize: 12, fontWeight: '600' },
  customRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  customInput: { flex: 1, borderRadius: 8, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 },
  customUnit:  { fontSize: 13 },
  summary:     { marginTop: 10, fontSize: 12, fontWeight: '600' },
});