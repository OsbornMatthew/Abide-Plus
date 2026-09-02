import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Header } from '../components/common/Header';
import { ProgressRing } from '../components/common/ProgressRing';
import { PreviousVersesModal } from '../components/modals/PreviousVersesModal';
import { AddTransactionModal } from '../components/modals/AddTransactionModal';
import { AddPrayerModal } from '../components/modals/AddPrayerModal';
import { AddTodoModal } from '../components/modals/AddTodoModal';
import { PrayerTimerModal } from '../components/modals/PrayerTimerModal';
import { HabitHistoryModal } from '../components/modals/HabitHistoryModal';
import { Habit } from '../types/habit';
import { TransactionType } from '../types/finance';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Heart,
  Coins,
  Check,
  ChevronRight,
  Clock,
  Wallet,
  ArrowUp,
  ArrowDown,
  Share2,
  History,
  Zap,
  Flame,
  Calendar,
} from 'lucide-react-native';
import { spacing, borderRadius } from '../theme/spacing';
import { typography } from '../theme/typography';
import { getLocalDateString } from '../utils/dateUtils';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const {
    theme,
    settings,
    dailyVerse,
    setDailyVerseIndex,
    bibleProgress,
    financialSummary,
    todos,
    toggleTodo,
    dailyTaskStats,
    activeFast,
    habits,
    toggleHabit,
    habitStats,
    prayerTimer,
    showPrayerTimerModal,
    setShowPrayerTimerModal,
  } = useApp();

  const isTamil = settings.displayLanguage === 'ta';
  const currencySym = settings.currency.symbol;

  const [showPreviousVersesModal, setShowPreviousVersesModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionModalType, setTransactionModalType] = useState<TransactionType>('expense');
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [showTodoModal, setShowTodoModal] = useState(false);

  // Habit history modal
  const [selectedHabitForHistory, setSelectedHabitForHistory] = useState<Habit | null>(null);
  const [showHabitHistoryModal, setShowHabitHistoryModal] = useState(false);

  const publicHabits = habits.filter((h) => !h.isPrivate);

  // Automatic current date
  const todayFormatted = new Date().toLocaleDateString(isTamil ? 'ta-IN' : 'en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const todayStr = getLocalDateString();
  const todayTodos = todos.filter(
    (t) => !t.dueDate || t.dueDate === todayStr || t.isDailyRoutine
  );

  const openFinanceModal = (tType: TransactionType) => {
    setTransactionModalType(tType);
    setShowTransactionModal(true);
  };

  const handleShareVerse = async () => {
    try {
      const ref = isTamil ? dailyVerse?.referenceTa : dailyVerse?.referenceEn;
      const text = isTamil ? dailyVerse?.textTa : dailyVerse?.textEn;
      const trans = isTamil ? 'TAOVBSI' : 'NIV';
      await Share.share({
        message: `✨ Verse of the Day (${ref || 'Holy Bible'} - ${trans})\n\n"${text || ''}"\n\nShared via Abide+ App`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const fastStartDate = activeFast?.startTime
    ? new Date(activeFast.startTime).toLocaleDateString(isTamil ? 'ta-IN' : 'en-US', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* ACTIVE LIVE PRAYER TIMER BANNER */}
        {(prayerTimer.isRunning || (prayerTimer.secondsLeft < prayerTimer.totalSeconds && prayerTimer.secondsLeft > 0)) && (
          <TouchableOpacity
            style={[
              styles.activeTimerBanner,
              {
                backgroundColor: prayerTimer.isRunning ? '#8B5CF622' : theme.cardAlt,
                borderColor: prayerTimer.isRunning ? '#8B5CF6' : theme.cardBorder,
              },
              theme.cardShadow,
            ]}
            onPress={() => setShowPrayerTimerModal(true)}
            activeOpacity={0.85}
          >
            <View style={[styles.timerPulseCircle, { backgroundColor: prayerTimer.isRunning ? '#8B5CF6' : theme.textMuted }]}>
              <Clock size={16} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.activeTimerTitle, { color: prayerTimer.isRunning ? '#A78BFA' : theme.text }]}>
                {prayerTimer.isRunning
                  ? (isTamil ? 'தனி ஜெப நேரம் செயலில் உள்ளது' : 'Quiet Time Prayer Active')
                  : (isTamil ? 'ஜெப நேரம் இடைநிறுத்தப்பட்டது' : 'Prayer Sanctuary Paused')}
              </Text>
              <Text style={[styles.activeTimerCountdown, { color: theme.text }]}>
                ⏳ {Math.floor(prayerTimer.secondsLeft / 60).toString().padStart(2, '0')}:{(prayerTimer.secondsLeft % 60).toString().padStart(2, '0')} {isTamil ? 'மீதமுள்ளது' : 'remaining'} • {isTamil ? 'தொடர தொடவும் >' : 'Tap to open >'}
              </Text>
            </View>
            <ChevronRight size={18} color={prayerTimer.isRunning ? '#A78BFA' : theme.textMuted} />
          </TouchableOpacity>
        )}

        {/* ACTIVE FASTING BANNER */}
        {activeFast && (
          <TouchableOpacity
            style={[
              styles.fastingBanner,
              { backgroundColor: theme.primary + '18', borderColor: theme.primary },
              theme.cardShadow,
            ]}
            onPress={() => navigation.navigate('More')}
            activeOpacity={0.85}
          >
            <Clock size={16} color={theme.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.fastingBannerTitle, { color: theme.primary }]}>
                {isTamil ? 'செயலில் உள்ள உபவாசம்' : 'Active Fasting Session'}
              </Text>
              <Text style={[styles.fastingBannerDesc, { color: theme.textMuted }]}>
                {isTamil ? 'தொடங்கியது:' : 'Started:'} {fastStartDate} ({activeFast.targetHours}h {isTamil ? 'இலக்கு' : 'Target'})
              </Text>
            </View>
            <ChevronRight size={16} color={theme.primary} />
          </TouchableOpacity>
        )}

        {/* ULTRA-ELEGANT CLEAN VERSE OF THE DAY CARD */}
        <TouchableOpacity
          style={[
            styles.elegantVodCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
            theme.cardShadow,
          ]}
          onPress={() => setShowPreviousVersesModal(true)}
          activeOpacity={0.88}
        >
          {/* Top Bar with Date Badge & History Button */}
          <View style={styles.vodTopBar}>
            <View style={[styles.vodDateBadge, { backgroundColor: theme.primary + '18' }]}>
              <Sparkles size={13} color={theme.primary} />
              <Text style={[styles.vodDateText, { color: theme.primary }]}>
                {isTamil ? 'இன்றைய வேத வசனம்' : 'VERSE OF THE DAY'} • {todayFormatted}
              </Text>
            </View>

            <View style={styles.vodActionIcons}>
              <TouchableOpacity
                onPress={() => setShowPreviousVersesModal(true)}
                style={[styles.historyPill, { backgroundColor: theme.cardAlt }]}
              >
                <History size={12} color={theme.textMuted} />
                <Text style={[styles.historyPillText, { color: theme.textMuted }]}>
                  {isTamil ? 'முந்தையவை' : 'Archive'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleShareVerse} style={[styles.iconButton, { backgroundColor: theme.cardAlt }]}>
                <Share2 size={12} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Elegant Scripture Presentation */}
          <View style={styles.vodBodyRow}>
            <View style={[styles.vodAccentLine, { backgroundColor: theme.primary }]} />
            <View style={{ flex: 1 }}>
              {/* Primary Scripture (Without quotes, beautiful typography) */}
              <Text
                style={[
                  styles.primaryVerseText,
                  {
                    color: theme.text,
                    fontFamily: isTamil ? typography.tamilFont : typography.fontFamily,
                  },
                ]}
              >
                {isTamil ? dailyVerse?.textTa || '' : dailyVerse?.textEn || ''}
              </Text>

              {/* Graceful Secondary Parallel Translation */}
              <Text
                style={[
                  styles.secondaryVerseText,
                  {
                    color: theme.textMuted,
                    fontFamily: !isTamil ? typography.tamilFont : typography.fontFamily,
                  },
                ]}
              >
                {isTamil ? dailyVerse?.textEn || '' : dailyVerse?.textTa || ''}
              </Text>
            </View>
          </View>

          {/* Reference & Reflection Bottom Row */}
          <View style={styles.vodBottomRow}>
            <View style={[styles.referenceBadge, { backgroundColor: theme.primary + '18', borderColor: theme.primary + '35' }]}>
              <Text style={[styles.referenceBadgeText, { color: theme.primary, fontFamily: isTamil ? typography.tamilFont : undefined }]}>
                📖 {isTamil ? `${dailyVerse?.referenceTa || 'பரிசுத்த வேதாகமம்'} (TAOVBSI)` : `${dailyVerse?.referenceEn || 'Holy Bible'} (NIV)`}
              </Text>
            </View>

            {/* Short Devotional Thought */}
            <View style={[styles.reflectionPill, { backgroundColor: theme.cardAlt }]}>
              <Text
                style={[
                  styles.reflectionPillText,
                  {
                    color: theme.textMuted,
                    fontFamily: isTamil ? typography.tamilFont : undefined,
                  },
                ]}
                numberOfLines={1}
              >
                💡 {isTamil ? dailyVerse?.reflectionTa || '' : dailyVerse?.reflectionEn || ''}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 3 DISCIPLINE RINGS - DISTINCT VIBRANT COLORS */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {isTamil ? 'அன்றாட ஆவிக்குரிய நிலவரம்' : 'Daily Progress Pulse'}
          </Text>
        </View>

        <View style={styles.ringsContainer}>
          {/* Bible Reading: Amber Gold */}
          <TouchableOpacity
            style={[
              styles.ringCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              theme.cardShadow,
            ]}
            onPress={() => navigation.navigate('Bible')}
          >
            <ProgressRing
              size={58}
              strokeWidth={5}
              progress={bibleProgress.totalPercentage}
              color={theme.primary}
              bgColor={theme.ringBg}
            />
            <Text style={[styles.ringTitle, { color: theme.text }]}>
              {isTamil ? 'வேதம்' : 'Bible'}
            </Text>
            <Text style={[styles.ringSub, { color: theme.textMuted }]}>
              {bibleProgress.readChaptersCount} {isTamil ? 'அதி.' : 'chs'}
            </Text>
          </TouchableOpacity>

          {/* Habits: Electric Royal Violet */}
          <TouchableOpacity
            style={[
              styles.ringCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              theme.cardShadow,
            ]}
            onPress={() => navigation.navigate('Habits')}
          >
            <ProgressRing
              size={58}
              strokeWidth={5}
              progress={habitStats.completionRatio}
              color="#8B5CF6"
              bgColor={theme.ringBg}
              centerText={habitStats.overallBestStreak > 0 ? `🔥${habitStats.overallBestStreak}` : undefined}
            />
            <Text style={[styles.ringTitle, { color: theme.text }]}>
              {isTamil ? 'பழக்கம்' : 'Habits'}
            </Text>
            <Text style={[styles.ringSub, { color: theme.textMuted }]}>
              {habitStats.completedToday}/{habitStats.totalHabits}
            </Text>
          </TouchableOpacity>

          {/* Tasks: Radiant Sky Blue (Distinct from Tithe) */}
          <TouchableOpacity
            style={[
              styles.ringCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              theme.cardShadow,
            ]}
            onPress={() => navigation.navigate('More')}
          >
            <ProgressRing
              size={58}
              strokeWidth={5}
              progress={dailyTaskStats.completionRatio}
              color={theme.taskColor}
              bgColor={theme.ringBg}
              showPercent={false}
              centerText={`${dailyTaskStats.completedToday}/${dailyTaskStats.totalToday}`}
            />
            <Text style={[styles.ringTitle, { color: theme.text }]}>
              {isTamil ? 'பணிகள்' : 'Tasks'}
            </Text>
            <Text style={[styles.ringSub, { color: theme.textMuted }]}>
              {dailyTaskStats.completedToday}/{dailyTaskStats.totalToday}
            </Text>
          </TouchableOpacity>

          {/* Tithe: Neon Emerald Green (Distinct from Tasks) */}
          <TouchableOpacity
            style={[
              styles.ringCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              theme.cardShadow,
            ]}
            onPress={() => navigation.navigate('Finance')}
          >
            <ProgressRing
              size={58}
              strokeWidth={5}
              progress={financialSummary.givingRatio > 0 ? Math.min(100, (financialSummary.monthlyTithes / (financialSummary.expectedTithe || 1)) * 100) : 0}
              color={theme.titheColor}
              bgColor={theme.ringBg}
              showPercent={false}
            />
            <Text style={[styles.ringTitle, { color: theme.text }]}>
              {isTamil ? 'தசமபாகம்' : 'Tithe'}
            </Text>
            <Text style={[styles.ringSub, { color: theme.textMuted }]}>
              {currencySym}{financialSummary.monthlyTithes.toLocaleString()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4 CLEAN ACTION TILES (Income | Expense | Tithe | Savings) */}
        <View style={styles.quickActionsGrid}>
          {/* Income (Arrow Down / Inflow) */}
          <TouchableOpacity
            style={[
              styles.quickTile,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              theme.cardShadow,
            ]}
            onPress={() => openFinanceModal('income')}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: theme.incomeColor + '20' }]}>
              <ArrowDown size={18} color={theme.incomeColor} />
            </View>
            <Text style={[styles.quickTileLabel, { color: theme.text }]}>
              {isTamil ? 'வருமானம்' : 'Income'}
            </Text>
          </TouchableOpacity>

          {/* Expense (Arrow Up / Outflow) */}
          <TouchableOpacity
            style={[
              styles.quickTile,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              theme.cardShadow,
            ]}
            onPress={() => openFinanceModal('expense')}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: theme.expenseColor + '20' }]}>
              <ArrowUp size={18} color={theme.expenseColor} />
            </View>
            <Text style={[styles.quickTileLabel, { color: theme.text }]}>
              {isTamil ? 'செலவு' : 'Expense'}
            </Text>
          </TouchableOpacity>

          {/* Tithe */}
          <TouchableOpacity
            style={[
              styles.quickTile,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              theme.cardShadow,
            ]}
            onPress={() => openFinanceModal('tithe')}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: theme.titheColor + '20' }]}>
              <Heart size={17} color={theme.titheColor} />
            </View>
            <Text style={[styles.quickTileLabel, { color: theme.text }]}>
              {isTamil ? 'தசமபாகம்' : 'Tithe'}
            </Text>
          </TouchableOpacity>

          {/* Savings (Coins Icon) */}
          <TouchableOpacity
            style={[
              styles.quickTile,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              theme.cardShadow,
            ]}
            onPress={() => openFinanceModal('savings')}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: theme.balanceColor + '20' }]}>
              <Coins size={17} color={theme.balanceColor} />
            </View>
            <Text style={[styles.quickTileLabel, { color: theme.text }]}>
              {isTamil ? 'சேமிப்பு' : 'Savings'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* DAILY HABITS & SPIRITUAL DISCIPLINES WIDGET */}
        <View style={styles.sectionHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Zap size={16} color="#8B5CF6" />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {isTamil ? 'ஆவிக்குரிய பழக்கங்கள்' : 'Daily Habits & Disciplines'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Habits')}>
            <Text style={[styles.seeAllText, { color: theme.primary }]}>
              {habitStats.completedToday}/{publicHabits.length} {isTamil ? 'முடிந்தது' : 'Done'} {'>'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.tasksCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}>
          {/* Vibrant Donut Chart Summary Banner */}
          <View style={[styles.habitDashboardChartRow, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}>
            <ProgressRing
              size={60}
              strokeWidth={6}
              progress={habitStats.completionRatio}
              color="#8B5CF6"
              bgColor={theme.ringBg}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.habitDashboardChartTitle, { color: theme.text }]}>
                {habitStats.completionRatio}% {isTamil ? 'இன்றைய நிறைவு' : 'Completed Today'}
              </Text>
              <Text style={[styles.habitDashboardChartSub, { color: theme.textMuted }]}>
                {habitStats.completedToday} of {publicHabits.length} {isTamil ? 'பழக்கங்கள் முடிந்தது' : 'disciplines done'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <View style={[styles.habitStreakBadge, { backgroundColor: '#F59E0B20' }]}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#F59E0B' }}>
                    🔥 {habitStats.overallBestStreak}d {isTamil ? 'உச்சபட்ச தொடர்' : 'Best Streak'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {publicHabits.length === 0 ? (
            <View style={{ padding: spacing.md, alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 12, color: theme.textMuted, textAlign: 'center' }}>
                {isTamil ? 'பழக்கங்கள் எதுவும் சேர்க்கப்படவில்லை' : 'No habits added yet'}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Habits')}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: borderRadius.md,
                  backgroundColor: theme.primary + '20',
                  marginTop: 4,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '800', color: theme.primary }}>
                  {isTamil ? '+ புதிய பழக்கத்தைச் சேர்க்க' : '+ Add Habits'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            publicHabits.slice(0, 5).map((h) => {
              const isDone = h.completedDates?.includes(todayStr);
              return (
                <View
                  key={h.id}
                  style={[styles.taskRow, { borderBottomColor: theme.cardBorder }]}
                >
                  {/* Check Button */}
                  <TouchableOpacity
                    style={[
                      styles.taskCheck,
                      {
                        borderColor: isDone ? h.color || theme.success : theme.textMuted,
                        backgroundColor: isDone ? h.color || theme.success : 'transparent',
                      },
                    ]}
                    onPress={() => toggleHabit(h.id)}
                    activeOpacity={0.7}
                  >
                    {isDone && <Check size={12} color="#FFF" />}
                  </TouchableOpacity>

                  {/* Habit Title - Touching opens Month & Day History Modal */}
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => {
                      setSelectedHabitForHistory(h);
                      setShowHabitHistoryModal(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.taskText,
                        {
                          color: isDone ? theme.textMuted : theme.text,
                          textDecorationLine: isDone ? 'line-through' : 'none',
                        },
                      ]}
                    >
                      {isTamil && h.titleTa ? h.titleTa : h.title}
                    </Text>
                    <Text style={[styles.taskCategoryBadge, { color: h.color || theme.primary }]}>
                      {h.category}
                    </Text>
                  </TouchableOpacity>

                  {/* Right: Streak & Calendar Button */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#F59E0B' }}>
                      🔥 {h.currentStreak || 0}d
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedHabitForHistory(h);
                        setShowHabitHistoryModal(true);
                      }}
                      style={styles.calendarMiniBtn}
                    >
                      <Calendar size={13} color={theme.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* TODAY'S TASKS */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {isTamil ? 'இன்றைய பணிகள்' : 'Today’s Tasks'}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('More')}>
            <Text style={[styles.seeAllText, { color: theme.primary }]}>
              {isTamil ? 'அனைத்தும் >' : 'All >'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.tasksCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}>
          {todayTodos.length > 0 ? (
            todayTodos.map((todo) => (
              <TouchableOpacity
                key={todo.id}
                style={[styles.taskRow, { borderBottomColor: theme.cardBorder }]}
                onPress={() => toggleTodo(todo.id)}
              >
                <View
                  style={[
                    styles.taskCheck,
                    {
                      borderColor: todo.isCompleted ? theme.success : theme.textMuted,
                      backgroundColor: todo.isCompleted ? theme.success : 'transparent',
                    },
                  ]}
                >
                  {todo.isCompleted && <Check size={12} color="#FFF" />}
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.taskText,
                      {
                        color: todo.isCompleted ? theme.textMuted : theme.text,
                        textDecorationLine: todo.isCompleted ? 'line-through' : 'none',
                      },
                    ]}
                  >
                    {isTamil && todo.title === 'Read Bible Today'
                      ? 'இன்றைய வேதாகம வாசிப்பு'
                      : isTamil && todo.title === 'Prayer Today'
                      ? 'இன்றைய ஜெபம்'
                      : todo.title}
                  </Text>
                  <Text style={[styles.taskCategoryBadge, { color: theme.primary }]}>
                    {isTamil && todo.category === 'Spiritual' ? 'ஆவிக்குரியவை' : todo.category}
                  </Text>
                </View>

                {todo.priority && todo.priority !== 'low' && (
                  <View
                    style={[
                      styles.priorityTag,
                      {
                        backgroundColor:
                          todo.priority === 'urgent'
                            ? theme.danger + '20'
                            : todo.priority === 'high'
                            ? theme.warning + '20'
                            : theme.primary + '20',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityTagText,
                        {
                          color:
                            todo.priority === 'urgent'
                              ? theme.danger
                              : todo.priority === 'high'
                              ? theme.warning
                              : theme.primary,
                        },
                      ]}
                    >
                      {todo.priority}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyBox}>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                {isTamil ? 'இன்றைய பணிகள் எதுவும் இல்லை!' : 'No tasks scheduled for today.'}
              </Text>
            </View>
          )}
        </View>

        {/* FINANCIAL SUMMARY STRIP (GIVING HIGHLIGHT) */}
        <View style={[styles.financeQuickCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}>
          <View style={styles.financeQuickHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Wallet size={15} color={theme.titheColor} />
              <Text style={[styles.financeQuickTitle, { color: theme.text }]}>
                {isTamil ? 'இந்த மாத நிதி அறிக்கை' : 'Monthly Financial Pulse'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Finance')}>
              <Text style={[styles.seeAllText, { color: theme.primary }]}>
                {isTamil ? 'விவரம் >' : 'Details >'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.financeStatsRow}>
            <View style={styles.financeStatCol}>
              <Text style={[styles.financeStatLabel, { color: theme.textMuted }]}>
                {isTamil ? 'வருமானம்' : 'Income'}
              </Text>
              <Text style={[styles.financeStatVal, { color: theme.incomeColor }]}>
                +{currencySym}{financialSummary.monthlyIncome.toLocaleString()}
              </Text>
            </View>

            <View style={styles.financeStatCol}>
              <Text style={[styles.financeStatLabel, { color: theme.textMuted }]}>
                {isTamil ? 'தசமபாகம்' : 'Tithe'}
              </Text>
              <Text style={[styles.financeStatVal, { color: theme.titheColor }]}>
                {currencySym}{financialSummary.monthlyTithes.toLocaleString()}
              </Text>
            </View>

            <View style={styles.financeStatCol}>
              <Text style={[styles.financeStatLabel, { color: theme.textMuted }]}>
                {isTamil ? 'செலவு' : 'Expense'}
              </Text>
              <Text style={[styles.financeStatVal, { color: theme.expenseColor }]}>
                -{currencySym}{financialSummary.monthlyExpenses.toLocaleString()}
              </Text>
            </View>

            <View style={styles.financeStatCol}>
              <Text style={[styles.financeStatLabel, { color: theme.textMuted }]}>
                {isTamil ? 'இருப்பு' : 'Balance'}
              </Text>
              <Text style={[styles.financeStatVal, { color: theme.primary }]}>
                {currencySym}{financialSummary.netBalance.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <PreviousVersesModal
        visible={showPreviousVersesModal}
        onClose={() => setShowPreviousVersesModal(false)}
        onSelectVerse={(idx) => setDailyVerseIndex(idx)}
      />
      <AddTransactionModal
        visible={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        defaultType={transactionModalType}
      />
      <AddPrayerModal visible={showPrayerModal} onClose={() => setShowPrayerModal(false)} />
      <AddTodoModal visible={showTodoModal} onClose={() => setShowTodoModal(false)} />
      <PrayerTimerModal visible={showPrayerTimerModal} onClose={() => setShowPrayerTimerModal(false)} />
      <HabitHistoryModal
        visible={showHabitHistoryModal}
        habit={selectedHabitForHistory}
        onClose={() => setShowHabitHistoryModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollBody: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.hero + 40,
  },
  fastingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  fastingBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  fastingBannerDesc: {
    fontSize: 11,
    marginTop: 1,
  },
  elegantVodCard: {
    padding: spacing.md + 2,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  vodTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm + 4,
  },
  vodDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  vodDateText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  vodActionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  historyPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  iconButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vodBodyRow: {
    flexDirection: 'row',
    gap: spacing.sm + 2,
    marginBottom: spacing.sm + 2,
  },
  vodAccentLine: {
    width: 3.5,
    borderRadius: 2,
    marginTop: 2,
    marginBottom: 2,
  },
  primaryVerseText: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  secondaryVerseText: {
    fontSize: 12.5,
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 4,
  },
  vodBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
    marginTop: 2,
  },
  referenceBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  referenceBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  reflectionPill: {
    flex: 1,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: borderRadius.pill,
  },
  reflectionPillText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  ringsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  ringCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  ringTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },
  ringSub: {
    fontSize: 10,
    marginTop: 1,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  quickTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  quickIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  quickTileLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  tasksCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  taskCheck: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskText: {
    fontSize: 13,
    fontWeight: '600',
  },
  taskCategoryBadge: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  emptyBox: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
  },
  financeQuickCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  financeQuickHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  financeQuickTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  financeStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  financeStatCol: {
    alignItems: 'center',
  },
  financeStatLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  financeStatVal: {
    fontSize: 13,
    fontWeight: '800',
  },
  habitDashboardChartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  habitDashboardChartTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  habitDashboardChartSub: {
    fontSize: 11,
    marginTop: 1,
  },
  habitStreakBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  calendarMiniBtn: {
    padding: 5,
    borderRadius: 6,
  },
  activeTimerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    marginBottom: spacing.md,
  },
  timerPulseCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTimerTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  activeTimerCountdown: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  priorityTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityTagText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
