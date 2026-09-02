import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { Habit, HabitCategory } from '../../types/habit';
import { HabitHistoryModal } from '../modals/HabitHistoryModal';
import {
  Flame,
  BookOpen,
  Heart,
  Sparkles,
  Coins,
  HeartHandshake,
  Check,
  Plus,
  Trash2,
  Edit2,
  X,
  Award,
  Calendar,
  Zap,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { spacing, borderRadius } from '../../theme/spacing';
import { getLocalDateString, getPastNDays } from '../../utils/dateUtils';

const CATEGORIES: { label: string; labelTa: string; key: HabitCategory | 'All' }[] = [
  { label: 'All', labelTa: 'அனைத்தும்', key: 'All' },
  { label: 'Spiritual', labelTa: 'ஆவிக்குரியவை', key: 'Spiritual' },
  { label: 'Health', labelTa: 'உடல்நலம்', key: 'Health' },
  { label: 'Stewardship', labelTa: 'காரியஸ்தம்', key: 'Stewardship' },
  { label: 'Mindset', labelTa: 'மனப்பக்குவம்', key: 'Mindset' },
  { label: 'Relationships', labelTa: 'உறவுகள்', key: 'Relationships' },
];

const PRESET_COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#EAB308'];

export const HabitTrackerSection: React.FC = () => {
  const { theme, settings, habits, toggleHabit, addHabit, updateHabit, deleteHabit, habitStats } = useApp();
  const isTamil = settings.displayLanguage === 'ta';

  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'All'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Habit Calendar History Modal
  const [selectedHistoryHabit, setSelectedHistoryHabit] = useState<Habit | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [habitTitle, setHabitTitle] = useState('');
  const [habitTitleTa, setHabitTitleTa] = useState('');
  const [habitCategory, setHabitCategory] = useState<HabitCategory>('Spiritual');
  const [habitColor, setHabitColor] = useState('#F59E0B');
  const [habitIsPrivate, setHabitIsPrivate] = useState(false);

  const todayStr = getLocalDateString();
  const past7Days = getPastNDays(7, isTamil ? 'ta-IN' : 'en-US');

  const filteredHabits = habits.filter((h) => {
    if (selectedCategory === 'All') return true;
    return h.category === selectedCategory;
  });

  const handleOpenAdd = () => {
    setEditingHabit(null);
    setHabitTitle('');
    setHabitTitleTa('');
    setHabitCategory('Spiritual');
    setHabitColor('#F59E0B');
    setHabitIsPrivate(false);
    setShowAddModal(true);
  };

  const handleOpenEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setHabitTitle(habit.title);
    setHabitTitleTa(habit.titleTa || '');
    setHabitCategory(habit.category);
    setHabitColor(habit.color || '#F59E0B');
    setHabitIsPrivate(habit.isPrivate || false);
    setShowAddModal(true);
  };

  const handleOpenHistory = (habit: Habit) => {
    setSelectedHistoryHabit(habit);
    setShowHistoryModal(true);
  };

  const handleSaveHabit = async () => {
    if (!habitTitle.trim()) return;
    if (editingHabit) {
      await updateHabit(editingHabit.id, {
        title: habitTitle.trim(),
        titleTa: habitTitleTa.trim() || habitTitle.trim(),
        category: habitCategory,
        color: habitColor,
        isPrivate: habitIsPrivate,
      });
    } else {
      await addHabit({
        title: habitTitle.trim(),
        titleTa: habitTitleTa.trim() || habitTitle.trim(),
        category: habitCategory,
        frequency: 'daily',
        targetDaysPerWeek: 7,
        icon: 'Flame',
        color: habitColor,
        isPrivate: habitIsPrivate,
      });
    }
    setShowAddModal(false);
  };

  const handleDeleteHabitPrompt = async (id: string, title: string) => {
    const msg = isTamil ? `"${title}" பழக்கத்தை நீக்கவா?` : `Delete habit "${title}"?`;
    if (Platform.OS === 'web') {
      if (window.confirm(msg)) {
        await deleteHabit(id);
      }
      return;
    }
    await deleteHabit(id);
  };

  return (
    <View style={styles.container}>
      {/* Top Banner Stats */}
      <View style={[styles.statsCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}>
        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Text style={[styles.statValue, { color: theme.primary }]}>
              {habitStats.completedToday}/{habitStats.totalHabits}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>
              {isTamil ? 'இன்றைய முடிவுகள்' : 'Completed Today'}
            </Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: theme.cardBorder }]} />

          <View style={styles.statCol}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Zap size={16} color="#F59E0B" />
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                {habitStats.overallBestStreak} {isTamil ? 'நாட்கள்' : 'Days'}
              </Text>
            </View>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>
              {isTamil ? 'உச்சபட்ச தொடர்' : 'Best Streak'}
            </Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: theme.cardBorder }]} />

          <View style={styles.statCol}>
            <Text style={[styles.statValue, { color: theme.success }]}>
              {habitStats.completionRatio}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>
              {isTamil ? 'நிலைத்தன்மை' : 'Consistency'}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressBarTrack, { backgroundColor: theme.cardAlt }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${habitStats.completionRatio}%`,
                backgroundColor: theme.success,
              },
            ]}
          />
        </View>
      </View>

      {/* 7-Day Matrix Header */}
      <View style={[styles.daysStrip, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Calendar size={13} color={theme.primary} />
          <Text style={[styles.daysStripTitle, { color: theme.text }]}>
            {isTamil ? 'கடந்த 7 நாட்களின் தொடர்' : 'Past 7 Days Consistency'}
          </Text>
        </View>

        <View style={styles.daysRow}>
          {past7Days.map((d) => (
            <View
              key={d.dateStr}
              style={[
                styles.dayPill,
                d.isToday && { borderColor: theme.primary, backgroundColor: theme.primary + '15' },
              ]}
            >
              <Text style={[styles.dayPillName, { color: d.isToday ? theme.primary : theme.textMuted }]}>
                {d.dayName}
              </Text>
              <Text style={[styles.dayPillNum, { color: d.isToday ? theme.primary : theme.text }]}>
                {d.dayNum}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Add Button & Filter Chips */}
      <TouchableOpacity
        style={[styles.addHabitBtn, { backgroundColor: theme.primary }, theme.cardShadow]}
        onPress={handleOpenAdd}
        activeOpacity={0.8}
      >
        <Plus size={16} color="#000" />
        <Text style={styles.addHabitBtnText}>
          {isTamil ? 'புதிய பழக்கத்தை சேர்க்க' : 'Add New Spiritual Habit'}
        </Text>
      </TouchableOpacity>

      {/* Category Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isSelected ? theme.primary : theme.card,
                  borderColor: isSelected ? theme.primary : theme.cardBorder,
                },
              ]}
              onPress={() => setSelectedCategory(cat.key)}
            >
              <Text style={[styles.categoryChipText, { color: isSelected ? '#000' : theme.text }]}>
                {isTamil ? cat.labelTa : cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Habits List */}
      <View style={styles.habitsList}>
        {filteredHabits.map((habit) => {
          const isDoneToday = habit.completedDates?.includes(todayStr);
          return (
            <View
              key={habit.id}
              style={[
                styles.habitCard,
                {
                  backgroundColor: theme.card,
                  borderColor: isDoneToday ? habit.color || theme.success : theme.cardBorder,
                },
                theme.cardShadow,
              ]}
            >
              <View style={styles.habitMainRow}>
                {/* Left Accent & Icon */}
                <TouchableOpacity
                  style={[
                    styles.iconBox,
                    { backgroundColor: (habit.color || theme.primary) + '20', borderColor: habit.color || theme.primary },
                  ]}
                  onPress={() => handleOpenHistory(habit)}
                  activeOpacity={0.7}
                >
                  <Flame size={18} color={habit.color || theme.primary} />
                </TouchableOpacity>

                {/* Habit Details - Tapping opens History Modal */}
                <TouchableOpacity
                  style={styles.habitInfo}
                  onPress={() => handleOpenHistory(habit)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.habitTitle, { color: theme.text }]}>
                      {isTamil && habit.titleTa ? habit.titleTa : habit.title}
                    </Text>
                    {habit.isPrivate && (
                      <View style={[styles.privateBadge, { backgroundColor: '#F59E0B20' }]}>
                        <Lock size={10} color="#F59E0B" />
                        <Text style={styles.privateBadgeText}>{isTamil ? 'தனிப்பட்டது' : 'Private'}</Text>
                      </View>
                    )}
                  </View>
                  {isTamil && habit.titleTa && (
                    <Text style={[styles.habitSubTitle, { color: theme.textMuted }]}>{habit.title}</Text>
                  )}

                  <View style={styles.badgeRow}>
                    <View style={[styles.categoryBadge, { backgroundColor: theme.cardAlt }]}>
                      <Text style={[styles.categoryBadgeText, { color: habit.color || theme.primary }]}>
                        {habit.category}
                      </Text>
                    </View>
                    <View style={[styles.streakBadge, { backgroundColor: '#F59E0B18' }]}>
                      <Text style={styles.streakBadgeText}>
                        🔥 {habit.currentStreak || 0}d {isTamil ? 'தொடர்' : 'streak'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Right Action: Big Toggle Check Circle */}
                <TouchableOpacity
                  style={[
                    styles.checkBtn,
                    {
                      backgroundColor: isDoneToday ? habit.color || theme.success : theme.cardAlt,
                      borderColor: isDoneToday ? habit.color || theme.success : theme.cardBorder,
                    },
                  ]}
                  onPress={() => toggleHabit(habit.id)}
                  activeOpacity={0.7}
                >
                  <Check size={18} color={isDoneToday ? '#FFF' : theme.textMuted} />
                </TouchableOpacity>
              </View>

              {/* 7-Day Mini Dots Matrix on Card */}
              <View style={[styles.miniMatrixRow, { borderTopColor: theme.cardBorder }]}>
                <View style={styles.miniDotsContainer}>
                  {past7Days.map((d) => {
                    const isDoneOnDate = habit.completedDates?.includes(d.dateStr);
                    return (
                      <TouchableOpacity
                        key={d.dateStr}
                        style={[
                          styles.miniDot,
                          {
                            backgroundColor: isDoneOnDate ? habit.color || theme.success : theme.cardAlt,
                            borderColor: isDoneOnDate ? habit.color || theme.success : theme.cardBorder,
                            opacity: d.isToday ? 1 : 0.85,
                          },
                          d.isToday && {
                            borderWidth: 2,
                            borderColor: habit.color || theme.primary,
                          },
                        ]}
                        disabled={!d.isToday}
                        onPress={() => d.isToday && toggleHabit(habit.id)}
                        activeOpacity={d.isToday ? 0.7 : 1}
                      >
                        <Text style={[styles.miniDotDay, { color: isDoneOnDate ? '#FFF' : theme.textMuted }]}>
                          {d.dayName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => handleOpenHistory(habit)} style={styles.cardActionBtn}>
                    <Calendar size={14} color={theme.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleOpenEdit(habit)} style={styles.cardActionBtn}>
                    <Edit2 size={13} color={theme.textMuted} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteHabitPrompt(habit.id, habit.title)} style={styles.cardActionBtn}>
                    <Trash2 size={13} color={theme.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        {filteredHabits.length === 0 && (
          <View style={[styles.emptyHabitsCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}>
            <Zap size={32} color={theme.primary} />
            <Text style={[styles.emptyHabitsTitle, { color: theme.text }]}>
              {isTamil ? 'பழக்கங்கள் எதுவும் இல்லை' : 'No Habits Added Yet'}
            </Text>
            <Text style={[styles.emptyHabitsDesc, { color: theme.textMuted }]}>
              {isTamil
                ? 'ஜெபம், வேத வாசிப்பு, நற்செயல்கள் அல்லது ஒழுக்கங்களுக்கு உங்கள் சொந்த பழக்கங்களை உருவாக்கவும்.'
                : 'Start tracking your daily spiritual disciplines, Bible reading, prayer, and lifestyle habits.'}
            </Text>
            <TouchableOpacity
              style={[styles.addFirstHabitBtn, { backgroundColor: theme.primary }]}
              onPress={handleOpenAdd}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#000" />
              <Text style={styles.addFirstHabitBtnText}>
                {isTamil ? 'புதிய பழக்கத்தை சேர்க்க' : 'Add Your First Habit'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Add / Edit Habit Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {editingHabit
                  ? isTamil
                    ? 'பழக்கத்தைத் திருத்த'
                    : 'Edit Habit'
                  : isTamil
                  ? 'புதிய பழக்கத்தை சேர்க்க'
                  : 'New Spiritual Discipline'}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={18} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
              placeholder="Habit Title (e.g. Daily Prayer & Meditation)..."
              placeholderTextColor={theme.textMuted}
              value={habitTitle}
              onChangeText={setHabitTitle}
            />

            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
              placeholder="பழக்கத்தின் தலைப்பு (தமிழ்) எ.கா. காலை ஜெபம்..."
              placeholderTextColor={theme.textMuted}
              value={habitTitleTa}
              onChangeText={setHabitTitleTa}
            />

            {/* Category Choices */}
            <Text style={[styles.inputGroupLabel, { color: theme.textMuted }]}>
              {isTamil ? 'பிரிவு' : 'Category'}:
            </Text>
            <View style={styles.catPickerRow}>
              {(['Spiritual', 'Health', 'Stewardship', 'Mindset', 'Relationships'] as HabitCategory[]).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catPickerChip,
                    {
                      backgroundColor: habitCategory === cat ? theme.primary : theme.cardAlt,
                      borderColor: habitCategory === cat ? theme.primary : theme.cardBorder,
                    },
                  ]}
                  onPress={() => setHabitCategory(cat)}
                >
                  <Text style={[styles.catPickerChipText, { color: habitCategory === cat ? '#000' : theme.text }]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Color Picker */}
            <Text style={[styles.inputGroupLabel, { color: theme.textMuted }]}>
              {isTamil ? 'வண்ணம்' : 'Color Accent'}:
            </Text>
            <View style={styles.colorPaletteRow}>
              {PRESET_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: c },
                    habitColor === c && { borderWidth: 3, borderColor: '#FFF' },
                  ]}
                  onPress={() => setHabitColor(c)}
                />
              ))}
            </View>

            {/* Private Habit Toggle */}
            <TouchableOpacity
              style={[
                styles.privacyToggleBtn,
                {
                  backgroundColor: habitIsPrivate ? '#F59E0B15' : theme.cardAlt,
                  borderColor: habitIsPrivate ? '#F59E0B' : theme.cardBorder,
                },
              ]}
              onPress={() => setHabitIsPrivate(!habitIsPrivate)}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {habitIsPrivate ? <Lock size={15} color="#F59E0B" /> : <Eye size={15} color={theme.textMuted} />}
                <View>
                  <Text style={[styles.privacyToggleTitle, { color: habitIsPrivate ? '#F59E0B' : theme.text }]}>
                    {habitIsPrivate
                      ? isTamil
                        ? '🔒 தனிப்பட்ட பழக்கம் (முகப்பில் மறைக்கப்படும்)'
                        : '🔒 Private Habit (Hidden from Dashboard)'
                      : isTamil
                      ? '👁️ பொது பழக்கம் (முகப்பில் காண்பிக்கப்படும்)'
                      : '👁️ Public Habit (Shown on Dashboard)'}
                  </Text>
                  <Text style={{ fontSize: 10, color: theme.textMuted }}>
                    {isTamil ? 'முகப்பு பலகையில் இருந்து இதை மறைக்கலாம்' : 'Tap to toggle visibility on Home widget'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.saveModalBtn, { backgroundColor: theme.primary }]} onPress={handleSaveHabit}>
              <Check size={16} color="#000" />
              <Text style={styles.saveModalBtnText}>
                {editingHabit ? (isTamil ? 'புதுப்பிக்க' : 'Update Habit') : (isTamil ? 'சேர்க்க' : 'Save Habit')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Full Interactive Month-by-Month Calendar History Modal */}
      <HabitHistoryModal
        visible={showHistoryModal}
        habit={selectedHistoryHabit}
        onClose={() => setShowHistoryModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.hero,
  },
  statsCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
  },
  statCol: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  daysStrip: {
    padding: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  daysStripTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    marginHorizontal: 2,
  },
  dayPillName: {
    fontSize: 10,
    fontWeight: '700',
  },
  dayPillNum: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  addHabitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  addHabitBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '800',
  },
  categoryScroll: {
    gap: 6,
    paddingBottom: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  habitsList: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  habitCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  habitMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  habitSubTitle: {
    fontSize: 11,
    marginTop: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  streakBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  streakBadgeText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '800',
  },
  checkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniMatrixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.xs + 2,
    borderTopWidth: 1,
  },
  miniDotsContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  miniDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniDotDay: {
    fontSize: 8,
    fontWeight: '900',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardActionBtn: {
    padding: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  inputGroupLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 5,
    marginTop: 4,
  },
  catPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: spacing.sm,
  },
  catPickerChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  catPickerChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  colorPaletteRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.md,
    marginTop: 4,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  saveModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    marginTop: 6,
  },
  saveModalBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '800',
  },
  privateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  privateBadgeText: {
    color: '#F59E0B',
    fontSize: 9,
    fontWeight: '800',
  },
  privacyToggleBtn: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  privacyToggleTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyHabitsCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: spacing.sm,
  },
  emptyHabitsTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyHabitsDesc: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.md,
  },
  addFirstHabitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    marginTop: 6,
  },
  addFirstHabitBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '800',
  },
});
