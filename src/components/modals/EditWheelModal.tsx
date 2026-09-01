import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { DecisionWheel, WheelOption } from '../../types/decision';
import { Sparkles, Plus, Trash2, X, Check, Disc } from 'lucide-react-native';
import { spacing, borderRadius } from '../../theme/spacing';

interface EditWheelModalProps {
  visible: boolean;
  onClose: () => void;
  wheelToEdit: DecisionWheel | null;
}

const COLOR_PALETTE = [
  '#F59E0B',
  '#10B981',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#3B82F6',
  '#EF4444',
  '#14B8A6',
];

export const EditWheelModal: React.FC<EditWheelModalProps> = ({
  visible,
  onClose,
  wheelToEdit,
}) => {
  const { theme, settings, addDecisionWheel, updateDecisionWheel } = useApp();
  const isTamil = settings.displayLanguage === 'ta';

  const [title, setTitle] = useState('');
  const [titleTa, setTitleTa] = useState('');
  const [options, setOptions] = useState<WheelOption[]>([]);
  const [newOptionText, setNewOptionText] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);

  useEffect(() => {
    if (wheelToEdit) {
      setTitle(wheelToEdit.title);
      setTitleTa(wheelToEdit.titleTa || '');
      setOptions(wheelToEdit.options || []);
    } else {
      setTitle('');
      setTitleTa('');
      setOptions([
        { id: '1', text: isTamil ? 'தேர்வு 1' : 'Choice 1', color: COLOR_PALETTE[0] },
        { id: '2', text: isTamil ? 'தேர்வு 2' : 'Choice 2', color: COLOR_PALETTE[1] },
        { id: '3', text: isTamil ? 'தேர்வு 3' : 'Choice 3', color: COLOR_PALETTE[2] },
      ]);
    }
  }, [wheelToEdit, visible, isTamil]);

  const handleAddOption = () => {
    if (!newOptionText.trim()) return;
    const nextColor = COLOR_PALETTE[options.length % COLOR_PALETTE.length];
    const newOpt: WheelOption = {
      id: 'opt-' + Date.now(),
      text: newOptionText.trim(),
      color: selectedColor || nextColor,
    };
    setOptions([...options, newOpt]);
    setNewOptionText('');
    setSelectedColor(COLOR_PALETTE[(options.length + 1) % COLOR_PALETTE.length]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) {
      Alert.alert('Required', isTamil ? 'குறைந்தது 2 தேர்வுகள் இருக்க வேண்டும்.' : 'A wheel must have at least 2 choices.');
      return;
    }
    setOptions(options.filter((o) => o.id !== id));
  };

  const handleSaveWheel = async () => {
    if (!title.trim()) {
      Alert.alert('Required', isTamil ? 'சக்கரத்தின் தலைப்பை உள்ளிடவும்.' : 'Please enter a wheel title.');
      return;
    }
    if (options.length < 2) {
      Alert.alert('Required', isTamil ? 'குறைந்தது 2 தேர்வுகள் தேவை.' : 'Please add at least 2 choices.');
      return;
    }

    if (wheelToEdit) {
      await updateDecisionWheel(wheelToEdit.id, {
        title: title.trim(),
        titleTa: titleTa.trim() || undefined,
        options,
      });
    } else {
      await addDecisionWheel({
        title: title.trim(),
        titleTa: titleTa.trim() || undefined,
        options,
      });
    }

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
              <Disc size={20} color={theme.primary} />
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {wheelToEdit
                  ? isTamil
                    ? 'சக்கரத்தைத் திருத்துக'
                    : 'Edit Decision Wheel'
                  : isTamil
                  ? 'புதிய தீர்மானச் சக்கரம்'
                  : 'New Decision Wheel'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.cardAlt }]}>
              <X size={18} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Title Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>
                {isTamil ? 'சக்கரத்தின் தலைப்பு' : 'Wheel Title'} *
              </Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
                placeholder={isTamil ? 'எ.கா. வேத வாசிப்புப் பகுதி, இன்றைய முதன்மை காரியம்' : 'e.g., Scripture Portion, Ministry Priority'}
                placeholderTextColor={theme.textMuted}
                value={title}
                onChangeText={setTitle}
                autoFocus={!wheelToEdit}
              />
            </View>

            {/* Tamil Title (Optional) */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>
                {isTamil ? 'தமிழ் தலைப்பு (விருப்பத்தேர்வு)' : 'Tamil Title (Optional)'}
              </Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
                placeholder="எ.கா. ஜெபப் பரிந்துபேசுதல்"
                placeholderTextColor={theme.textMuted}
                value={titleTa}
                onChangeText={setTitleTa}
              />
            </View>

            {/* Choices Section */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>
                {isTamil ? 'சக்கரத்தின் தேர்வுகள்' : 'Wheel Choices / Slices'} ({options.length})
              </Text>

              {/* Existing Options List */}
              <View style={{ gap: 6, marginBottom: spacing.md }}>
                {options.map((opt, idx) => (
                  <View
                    key={opt.id || idx}
                    style={[styles.optionRow, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}
                  >
                    <View style={[styles.colorPreviewDot, { backgroundColor: opt.color }]} />
                    <Text style={[styles.optionRowText, { color: theme.text }]}>{opt.text}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveOption(opt.id)}
                      style={styles.deleteOptionBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Trash2 size={14} color={theme.danger} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Add New Option Field */}
              <View style={[styles.addOptionCard, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}>
                <Text style={[styles.addOptionLabel, { color: theme.textMuted }]}>
                  + {isTamil ? 'புதிய தேர்வைச் சேர்க்க' : 'Add New Choice'}
                </Text>

                <TextInput
                  style={[styles.newOptInput, { backgroundColor: theme.card, borderColor: theme.cardBorder, color: theme.text }]}
                  placeholder={isTamil ? 'தேர்வின் பெயர்...' : 'Type choice option...'}
                  placeholderTextColor={theme.textMuted}
                  value={newOptionText}
                  onChangeText={setNewOptionText}
                />

                {/* Color Palette Selector */}
                <View style={styles.colorPaletteRow}>
                  {COLOR_PALETTE.map((c) => {
                    const isSelected = selectedColor === c;
                    return (
                      <TouchableOpacity
                        key={c}
                        style={[
                          styles.colorDot,
                          { backgroundColor: c },
                          isSelected && { borderColor: '#FFF', borderWidth: 2.5, transform: [{ scale: 1.15 }] },
                        ]}
                        onPress={() => setSelectedColor(c)}
                      >
                        {isSelected && <Check size={10} color="#FFF" />}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={[styles.addOptBtn, { backgroundColor: theme.primary }]}
                  onPress={handleAddOption}
                >
                  <Plus size={14} color="#000" />
                  <Text style={styles.addOptBtnText}>{isTamil ? 'சேர்க்க' : 'Add to Wheel'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.primary }, theme.cardShadow]}
              onPress={handleSaveWheel}
            >
              <Check size={18} color="#000" />
              <Text style={styles.saveBtnText}>
                {wheelToEdit
                  ? isTamil
                    ? 'மாற்றங்களைச் சேமிக்க'
                    : 'Save Changes'
                  : isTamil
                  ? 'சக்கரத்தை உருவாக்குக'
                  : 'Create Wheel'}
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
    backgroundColor: 'rgba(0, 0, 0, 0.42)', // Soft, non-disturbing dark fade
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
    fontSize: 17,
    fontWeight: '800',
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
    fontWeight: '700',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  colorPreviewDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionRowText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  deleteOptionBtn: {
    padding: 4,
  },
  addOptionCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: 8,
    marginTop: 4,
  },
  addOptionLabel: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  newOptInput: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
  colorPaletteRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  colorDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addOptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
  },
  addOptBtnText: {
    color: '#000',
    fontSize: 11.5,
    fontWeight: '800',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  saveBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '900',
  },
});
