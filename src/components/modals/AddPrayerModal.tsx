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
import { PrayerCategory } from '../../types/spiritual';
import { X, Check, Heart, Shield, Flame, BookOpen } from 'lucide-react-native';
import { spacing, borderRadius, typography } from '../../theme/spacing';

interface AddPrayerModalProps {
  visible: boolean;
  onClose: () => void;
}

const PRAYER_CATEGORIES: { key: PrayerCategory; labelEn: string; labelTa: string }[] = [
  { key: 'Adoration', labelEn: 'Adoration (Praise)', labelTa: 'துதி & ஆராதனை' },
  { key: 'Confession', labelEn: 'Confession & Repentance', labelTa: 'பாவ அறிக்கை' },
  { key: 'Thanksgiving', labelEn: 'Thanksgiving', labelTa: 'நன்றி செலுத்துதல்' },
  { key: 'Supplication', labelEn: 'Supplication (Petitions)', labelTa: 'விண்ணப்பம் & மன்றாட்டு' },
  { key: 'Family', labelEn: 'Family & Children', labelTa: 'குடும்பம் & பிள்ளைகள்' },
  { key: 'Healing', labelEn: 'Healing & Health', labelTa: 'சுகம் & ஆரோக்கியம்' },
  { key: 'Ministry', labelEn: 'Ministry & Church', labelTa: 'ஊழியம் & திருச்சபை' },
  { key: 'Salvation', labelEn: 'Salvation of Souls', labelTa: 'இரட்சிப்பு' },
  { key: 'Financial', labelEn: 'Financial Breakthrough', labelTa: 'நிதி & வேலை ஆசீர்வாதம்' },
  { key: 'Spiritual Growth', labelEn: 'Spiritual Growth', labelTa: 'ஆவிக்குரிய வளர்ச்சி' },
];

export const AddPrayerModal: React.FC<AddPrayerModalProps> = ({ visible, onClose }) => {
  const { theme, settings, addPrayer } = useApp();
  const isTamil = settings.displayLanguage === 'ta';

  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [category, setCategory] = useState<PrayerCategory>('Supplication');
  const [linkedVerse, setLinkedVerse] = useState('');
  const [priority, setPriority] = useState<'High' | 'Normal' | 'Urgent'>('Normal');

  const handleSubmit = async () => {
    if (!title.trim()) return;

    await addPrayer({
      title: title.trim(),
      details: details.trim(),
      category,
      status: 'active',
      linkedVerse: linkedVerse.trim() || undefined,
      priority,
    });

    setTitle('');
    setDetails('');
    setLinkedVerse('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Flame size={20} color={theme.primary} />
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {isTamil ? 'புதிய ஜெபக் குறிப்பு' : 'New Prayer Request'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.cardAlt }]}>
              <X size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Title Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>
                {isTamil ? 'ஜெபத் தலைப்பு' : 'Prayer Title'} *
              </Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
                placeholder={isTamil ? 'எ.கா. குடும்ப சுகத்திற்காக, வேலைக்கான ஜெபம்' : 'e.g., Healing for brother, Financial breakthrough'}
                placeholderTextColor={theme.textMuted}
                value={title}
                onChangeText={setTitle}
                autoFocus
              />
            </View>

            {/* Category selection */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>
                {isTamil ? 'ஜெபப் பிரிவு (ACTS முறைமை)' : 'Prayer Category (ACTS Model)'}
              </Text>
              <View style={styles.categoryGrid}>
                {PRAYER_CATEGORIES.map((cat) => {
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

            {/* Details */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>
                {isTamil ? 'விண்ணப்பத்தின் விபரம் & குறிப்புகள்' : 'Prayer Petitions & Details'}
              </Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
                placeholder={isTamil ? 'ஜெப தேவைகளை விவரமாக எழுதவும்...' : 'Write down your heartfelt prayer requests and intentions...'}
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={4}
                value={details}
                onChangeText={setDetails}
              />
            </View>

            {/* Linked Scripture */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>
                {isTamil ? 'இணைக்கப்பட்ட வாக்குத்தத்த வசனம் (விருப்பம்)' : 'Claimed Scripture Promise (Optional)'}
              </Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
                placeholder={isTamil ? 'எ.கா. பிலிப்பியர் 4:19, சங்கீதம் 91:1' : 'e.g., Philippians 4:19, Psalm 91:1-2'}
                placeholderTextColor={theme.textMuted}
                value={linkedVerse}
                onChangeText={setLinkedVerse}
              />
            </View>

            {/* Priority */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>
                {isTamil ? 'முன்னுரிமை' : 'Urgency Level'}
              </Text>
              <View style={styles.priorityRow}>
                {(['Normal', 'High', 'Urgent'] as const).map((p) => {
                  const isSelected = priority === p;
                  const btnColor = p === 'Urgent' ? theme.danger : p === 'High' ? theme.warning : theme.accentSage;
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
                      <Text style={[styles.priorityChipText, { color: isSelected ? '#FFF' : theme.text }]}>
                        {p === 'Urgent'
                          ? isTamil
                            ? 'மிக அவசரம்'
                            : 'Urgent'
                          : p === 'High'
                          ? isTamil
                            ? 'உயர் முன்னுரிமை'
                            : 'High'
                          : isTamil
                          ? 'வழக்கமான'
                          : 'Normal'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

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
                {isTamil ? 'ஜெபத்தை சமர்ப்பிக்கவும்' : 'Add to Prayer Wall'}
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderWidth: 1,
    maxHeight: '90%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
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
  textArea: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
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
    gap: 8,
  },
  priorityChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  priorityChipText: {
    fontSize: 12,
    fontWeight: '700',
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
