import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { TaskCategory, TaskPriority, SubTask } from '../../types/todo';
import { X, Check, Plus, Trash2, CheckSquare, Calendar, Sparkles } from 'lucide-react-native';
import { spacing, borderRadius } from '../../theme/spacing';

interface AddTodoModalProps {
  visible: boolean;
  onClose: () => void;
}

const TODO_CATEGORIES: { key: TaskCategory; labelEn: string; labelTa: string }[] = [
  { key: 'Spiritual', labelEn: 'Spiritual Life', labelTa: 'ஆவிக்குரிய வாழ்வு' },
  { key: 'Prayer Target', labelEn: 'Prayer Focus', labelTa: 'ஜெப இலக்கு' },
  { key: 'Bible Reading', labelEn: 'Bible Reading', labelTa: 'வேத வாசிப்பு' },
  { key: 'Ministry', labelEn: 'Ministry & Church', labelTa: 'ஊழியம் & சபை' },
  { key: 'Tithe & Giving', labelEn: 'Tithe & Stewardship', labelTa: 'தசமபாகம் & காரியஸ்தம்' },
  { key: 'Personal', labelEn: 'Personal & Life', labelTa: 'தனிப்பட்டவை' },
  { key: 'Work', labelEn: 'Work & Career', labelTa: 'வேலை & தொழில்' },
  { key: 'Family', labelEn: 'Family & Home', labelTa: 'குடும்பம் & இல்லம்' },
];

export const AddTodoModal: React.FC<AddTodoModalProps> = ({ visible, onClose }) => {
  const { theme, settings, addTodo } = useApp();
  const isTamil = settings.displayLanguage === 'ta';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Spiritual');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [isDailyRoutine, setIsDailyRoutine] = useState(false);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [currentSubtask, setCurrentSubtask] = useState('');

  const addSubtaskItem = () => {
    if (currentSubtask.trim()) {
      setSubtasks([...subtasks, currentSubtask.trim()]);
      setCurrentSubtask('');
    }
  };

  const removeSubtaskItem = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    const formattedSubtasks: SubTask[] = subtasks.map((text, idx) => ({
      id: `sub-${Date.now()}-${idx}`,
      title: text,
      isDone: false,
    }));

    await addTodo({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      dueDate: new Date().toISOString().split('T')[0],
      isCompleted: false,
      isDailyRoutine,
      subTasks: formattedSubtasks,
    });

    setTitle('');
    setDescription('');
    setSubtasks([]);
    setIsDailyRoutine(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <TouchableOpacity style={styles.backdropDismiss} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}>
          {/* Sheet Handle */}
          <View style={styles.sheetHandleBar}>
            <View style={[styles.sheetHandle, { backgroundColor: theme.textMuted + '35' }]} />
          </View>

          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <CheckSquare size={20} color={theme.primary} />
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {isTamil ? 'புதிய பணி / காரியம் சேர்த்தல்' : 'New Task / To-Do'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.cardAlt }]}>
              <X size={18} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>
                {isTamil ? 'பணியின் தலைப்பு' : 'Task Title'} *
              </Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
                placeholder={isTamil ? 'எ.கா. சங்கீதம் 23 வாசித்தல், தசமபாகம் செலுத்துதல்' : 'e.g., Read John 1, Send church tithe, Visit brother'}
                placeholderTextColor={theme.textMuted}
                value={title}
                onChangeText={setTitle}
                autoFocus
              />
            </View>

            {/* Category selection */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>
                {isTamil ? 'பிரிவு' : 'Category'}
              </Text>
              <View style={styles.categoryGrid}>
                {TODO_CATEGORIES.map((cat) => {
                  const isSelected = category === cat.key;
                  return (
                    <TouchableOpacity
                      key={cat.key}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: isSelected ? theme.primary : theme.cardAlt,
                          borderColor: isSelected ? theme.primary : theme.cardBorder,
                        },
                      ]}
                      onPress={() => setCategory(cat.key)}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          { color: isSelected ? '#000' : theme.text },
                        ]}
                      >
                        {isTamil ? cat.labelTa : cat.labelEn}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Priority selection */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>
                {isTamil ? 'முன்னுரிமை' : 'Priority'}
              </Text>
              <View style={styles.priorityRow}>
                {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((p) => {
                  const isSelected = priority === p;
                  const btnColor =
                    p === 'urgent'
                      ? theme.danger
                      : p === 'high'
                      ? theme.warning
                      : p === 'medium'
                      ? theme.primary
                      : theme.accentSage;
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.priorityChip,
                        {
                          backgroundColor: isSelected ? btnColor : theme.cardAlt,
                          borderColor: isSelected ? btnColor : theme.cardBorder,
                        },
                      ]}
                      onPress={() => setPriority(p)}
                    >
                      <Text
                        style={[
                          styles.priorityChipText,
                          { color: isSelected ? (p === 'medium' ? '#000' : '#FFF') : theme.text },
                        ]}
                      >
                        {p.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>
                {isTamil ? 'விவரம் (விருப்பம்)' : 'Notes / Description'}
              </Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
                placeholder={isTamil ? 'கூடுதல் குறிப்புகள்...' : 'Additional context or reminders...'}
                placeholderTextColor={theme.textMuted}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Subtasks */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>
                {isTamil ? 'துணைப் பணிகள் (Checklist)' : 'Checklist Steps / Subtasks'}
              </Text>
              <View style={styles.subtaskInputRow}>
                <TextInput
                  style={[styles.subtaskTextInput, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
                  placeholder={isTamil ? 'துணைப் பணியைச் சேர்க்கவும்...' : 'Add a step...'}
                  placeholderTextColor={theme.textMuted}
                  value={currentSubtask}
                  onChangeText={setCurrentSubtask}
                  onSubmitEditing={addSubtaskItem}
                />
                <TouchableOpacity
                  style={[styles.addSubtaskBtn, { backgroundColor: theme.primary }]}
                  onPress={addSubtaskItem}
                >
                  <Plus size={18} color="#000" />
                </TouchableOpacity>
              </View>

              {subtasks.map((st, idx) => (
                <View key={idx} style={[styles.subtaskItem, { backgroundColor: theme.cardAlt }]}>
                  <Text style={[styles.subtaskItemText, { color: theme.text }]}>• {st}</Text>
                  <TouchableOpacity onPress={() => removeSubtaskItem(idx)}>
                    <Trash2 size={14} color={theme.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Daily Routine Toggle */}
            <TouchableOpacity
              style={[styles.routineToggleRow, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}
              onPress={() => setIsDailyRoutine(!isDailyRoutine)}
            >
              <Sparkles size={18} color={isDailyRoutine ? theme.primary : theme.textMuted} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.routineTitle, { color: theme.text }]}>
                  {isTamil ? 'அன்றாட ஆவிக்குரிய வழக்கம்' : 'Daily Spiritual Habit / Routine'}
                </Text>
                <Text style={[styles.routineSubtitle, { color: theme.textMuted }]}>
                  {isTamil ? 'ஒவ்வொரு நாளும் தானாக தோன்றும்' : 'Repeats every single day automatically'}
                </Text>
              </View>
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: isDailyRoutine ? theme.primary : theme.textMuted,
                    backgroundColor: isDailyRoutine ? theme.primary : 'transparent',
                  },
                ]}
              >
                {isDailyRoutine && <Check size={12} color="#000" />}
              </View>
            </TouchableOpacity>

            {/* Submit */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: theme.primary, opacity: title.trim() ? 1 : 0.6 },
              ]}
              disabled={!title.trim()}
              onPress={handleSubmit}
            >
              <Check size={18} color="#000" />
              <Text style={styles.submitBtnText}>
                {isTamil ? 'பணியைச் சேமிக்கவும்' : 'Save Task'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.42)', // Soft, non-disturbing subtle fade
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backdropDismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: '100%',
    maxWidth: 540,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '88%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? 36 : spacing.lg,
  },
  sheetHandleBar: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 6,
  },
  priorityChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  priorityChipText: {
    fontSize: 11,
    fontWeight: '800',
  },
  subtaskInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  subtaskTextInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: 13,
  },
  addSubtaskBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    marginTop: 6,
  },
  subtaskItemText: {
    fontSize: 13,
    flex: 1,
  },
  routineToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  routineTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  routineSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    gap: 8,
  },
  submitBtnText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '800',
  },
});
