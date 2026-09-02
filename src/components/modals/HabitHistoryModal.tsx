import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { Habit } from '../../types/habit';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Flame,
  Zap,
  CheckCircle2,
  Calendar,
  Lock,
  Unlock,
} from 'lucide-react-native';
import { spacing, borderRadius } from '../../theme/spacing';
import { getLocalDateString } from '../../utils/dateUtils';

interface HabitHistoryModalProps {
  habit: Habit | null;
  visible: boolean;
  onClose: () => void;
}

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_NAMES_TA = [
  'ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்',
  'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்',
];

const WEEKDAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_NAMES_TA = ['ஞா', 'திங்', 'செவ்', 'புத', 'வியா', 'வெள்', 'சனி'];

export const HabitHistoryModal: React.FC<HabitHistoryModalProps> = ({ habit, visible, onClose }) => {
  const { theme, settings, toggleHabit, updateHabit, habits } = useApp();
  const isTamil = settings.displayLanguage === 'ta';

  // Current viewed month and year
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!habit) return null;

  // Fetch updated version of habit from context state
  const liveHabit = habits.find((h) => h.id === habit.id) || habit;

  const viewYear = currentDate.getFullYear();
  const viewMonth = currentDate.getMonth(); // 0-indexed

  const todayStr = getLocalDateString();

  // First day of month (0 = Sun, 1 = Mon...)
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  // Number of days in current month
  const totalDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const handleResetToToday = () => {
    setCurrentDate(new Date());
  };

  const handleTogglePrivacy = async () => {
    await updateHabit(liveHabit.id, { isPrivate: !liveHabit.isPrivate });
  };

  // Calendar cells calculation
  const calendarCells = [];
  // Empty leading cells
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push({ key: `empty-${i}`, dayNum: null, dateStr: '' });
  }
  // Days of month
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const monthStr = String(viewMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${viewYear}-${monthStr}-${dayStr}`;
    const isCompleted = (liveHabit.completedDates || []).includes(dateStr);
    const isToday = dateStr === todayStr;
    calendarCells.push({ key: dateStr, dayNum: day, dateStr, isCompleted, isToday });
  }

  // Monthly stats
  const completedInViewMonth = (liveHabit.completedDates || []).filter((d) => {
    return d.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`);
  }).length;

  const monthRatio = Math.round((completedInViewMonth / totalDaysInMonth) * 100);
  const totalCompletedAllTime = (liveHabit.completedDates || []).length;

  const habitColor = liveHabit.color || theme.primary;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.containerCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={[styles.colorDot, { backgroundColor: habitColor }]} />
                <Text style={[styles.title, { color: theme.text }]}>
                  {isTamil && liveHabit.titleTa ? liveHabit.titleTa : liveHabit.title}
                </Text>
              </View>
              {isTamil && liveHabit.titleTa && (
                <Text style={[styles.subTitle, { color: theme.textMuted }]}>{liveHabit.title}</Text>
              )}
            </View>

            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.cardAlt }]}>
              <X size={18} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.lg }}>
            {/* Quick Stats Grid */}
            <View style={[styles.statsGrid, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}>
              <View style={styles.statItem}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Flame size={15} color="#F59E0B" />
                  <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
                    {liveHabit.currentStreak || 0}
                  </Text>
                </View>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>
                  {isTamil ? 'தற்போதைய தொடர்' : 'Current Streak'}
                </Text>
              </View>

              <View style={[styles.statDivider, { backgroundColor: theme.cardBorder }]} />

              <View style={styles.statItem}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Zap size={15} color={theme.primary} />
                  <Text style={[styles.statNumber, { color: theme.primary }]}>
                    {liveHabit.bestStreak || 0}
                  </Text>
                </View>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>
                  {isTamil ? 'உச்சபட்ச தொடர்' : 'Best Streak'}
                </Text>
              </View>

              <View style={[styles.statDivider, { backgroundColor: theme.cardBorder }]} />

              <View style={styles.statItem}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={15} color={theme.success} />
                  <Text style={[styles.statNumber, { color: theme.success }]}>
                    {totalCompletedAllTime}
                  </Text>
                </View>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>
                  {isTamil ? 'மொத்த நாட்கள்' : 'Total Days'}
                </Text>
              </View>
            </View>

            {/* Month Navigation Row */}
            <View style={styles.monthNavRow}>
              <TouchableOpacity onPress={handlePrevMonth} style={[styles.navBtn, { backgroundColor: theme.cardAlt }]}>
                <ChevronLeft size={18} color={theme.text} />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleResetToToday} style={styles.monthDisplayBtn}>
                <Calendar size={14} color={habitColor} />
                <Text style={[styles.monthTitle, { color: theme.text }]}>
                  {isTamil ? MONTH_NAMES_TA[viewMonth] : MONTH_NAMES_EN[viewMonth]} {viewYear}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleNextMonth} style={[styles.navBtn, { backgroundColor: theme.cardAlt }]}>
                <ChevronRight size={18} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* Weekday Headers */}
            <View style={styles.weekdayRow}>
              {(isTamil ? WEEKDAY_NAMES_TA : WEEKDAY_NAMES_EN).map((dayName, idx) => (
                <View key={idx} style={styles.weekdayCell}>
                  <Text style={[styles.weekdayText, { color: idx === 0 || idx === 6 ? theme.primary : theme.textMuted }]}>
                    {dayName}
                  </Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {calendarCells.map((cell) => {
                if (!cell.dayNum) {
                  return <View key={cell.key} style={styles.emptyDayCell} />;
                }

                return (
                  <TouchableOpacity
                    key={cell.key}
                    style={[
                      styles.dayCell,
                      { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder },
                      cell.isCompleted && {
                        backgroundColor: habitColor,
                        borderColor: habitColor,
                        shadowColor: habitColor,
                        shadowOpacity: 0.4,
                        shadowRadius: 4,
                        elevation: 3,
                      },
                      cell.isToday && !cell.isCompleted && {
                        borderColor: theme.primary,
                        borderWidth: 1.5,
                      },
                    ]}
                    onPress={() => toggleHabit(liveHabit.id, cell.dateStr)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayCellText,
                        { color: cell.isCompleted ? '#FFF' : theme.text },
                        cell.isToday && !cell.isCompleted && { color: theme.primary, fontWeight: '900' },
                      ]}
                    >
                      {cell.dayNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Monthly Summary Progress */}
            <View style={[styles.monthSummaryBox, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.summaryLabel, { color: theme.text }]}>
                  {isTamil ? 'இம்மாத நிலைத்தன்மை' : 'Monthly Consistency'}
                </Text>
                <Text style={[styles.summaryPercent, { color: habitColor }]}>
                  {completedInViewMonth}/{totalDaysInMonth} ({monthRatio}%)
                </Text>
              </View>
              <View style={[styles.progressBarTrack, { backgroundColor: theme.card }]}>
                <View style={[styles.progressBarFill, { width: `${monthRatio}%`, backgroundColor: habitColor }]} />
              </View>
            </View>

            {/* Privacy Toggle Section */}
            <TouchableOpacity
              style={[
                styles.privacyRow,
                { backgroundColor: theme.cardAlt, borderColor: liveHabit.isPrivate ? '#F59E0B' : theme.cardBorder },
              ]}
              onPress={handleTogglePrivacy}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <View
                  style={[
                    styles.privacyIconCircle,
                    { backgroundColor: liveHabit.isPrivate ? '#F59E0B20' : theme.card },
                  ]}
                >
                  {liveHabit.isPrivate ? <Lock size={16} color="#F59E0B" /> : <Unlock size={16} color={theme.textMuted} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.privacyTitle, { color: theme.text }]}>
                    {liveHabit.isPrivate
                      ? isTamil
                        ? '🔒 தனிப்பட்ட பழக்கம் (முகப்பில் மறைக்கப்பட்டது)'
                        : '🔒 Private Habit (Hidden from Dashboard)'
                      : isTamil
                      ? '🔓 பொது பழக்கம் (முகப்பில் தெரியும்)'
                      : '🔓 Public Habit (Visible on Dashboard)'}
                  </Text>
                  <Text style={[styles.privacySub, { color: theme.textMuted }]}>
                    {isTamil
                      ? 'முகப்பு திரையில் இருந்து இதை மறைக்க தொடுக'
                      : 'Tap to toggle visibility on Home Dashboard widget'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  containerCard: {
    maxHeight: '88%',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subTitle: {
    fontSize: 12,
    marginTop: 2,
    marginLeft: 16,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 15,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthDisplayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  monthTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  weekdayCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: '700',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  emptyDayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  dayCellText: {
    fontSize: 11,
    fontWeight: '700',
  },
  monthSummaryBox: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryPercent: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  privacyIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  privacySub: {
    fontSize: 10,
    marginTop: 2,
  },
});
