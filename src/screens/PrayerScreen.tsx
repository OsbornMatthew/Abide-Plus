import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Header } from '../components/common/Header';
import { AddPrayerModal } from '../components/modals/AddPrayerModal';
import { PrayerTimerModal } from '../components/modals/PrayerTimerModal';
import { PrayerCategory, PrayerItem } from '../types/spiritual';
import {
  Heart,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  Sparkles,
  Search,
  Timer,
  Check,
  X,
  Calendar,
  Edit2,
} from 'lucide-react-native';
import { spacing, borderRadius } from '../theme/spacing';

export const PrayerScreen: React.FC = () => {
  const { theme, settings, prayers, deletePrayer, markPrayerAnswered } = useApp();
  const isTamil = settings.displayLanguage === 'ta';

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'answered' | 'waiting'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState<PrayerItem | null>(null);
  const [showTimerModal, setShowTimerModal] = useState(false);

  // Testimony modal for answered prayer
  const [answeringPrayerId, setAnsweringPrayerId] = useState<string | null>(null);
  const [testimonyText, setTestimonyText] = useState('');

  const filteredPrayers = prayers.filter((p) => {
    if (activeTab !== 'all' && p.status !== activeTab) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.details?.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const handleOpenAnswerModal = (prayerId: string) => {
    setAnsweringPrayerId(prayerId);
    setTestimonyText('');
  };

  const handleConfirmAnswered = async () => {
    if (answeringPrayerId) {
      await markPrayerAnswered(answeringPrayerId, testimonyText.trim());
      setAnsweringPrayerId(null);
      setTestimonyText('');
    }
  };

  // Distinct vibrant ACTS colors
  const actsCategories: { letter: string; nameEn: string; nameTa: string; cat: PrayerCategory; color: string }[] = [
    { letter: 'A', nameEn: 'Adoration', nameTa: 'துதி', cat: 'Adoration', color: '#F59E0B' },       // Amber Gold
    { letter: 'C', nameEn: 'Confession', nameTa: 'அறிக்கை', cat: 'Confession', color: '#8B5CF6' },   // Royal Violet
    { letter: 'T', nameEn: 'Thanksgiving', nameTa: 'நன்றி', cat: 'Thanksgiving', color: '#EC4899' },  // Cyber Rose / Hot Pink
    { letter: 'S', nameEn: 'Supplication', nameTa: 'விண்ணப்பம்', cat: 'Supplication', color: '#06B6D4' }, // Cyan
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title={isTamil ? 'ஜெப அறை' : 'Prayer War Room'}
        subtitle={
          isTamil
            ? 'விண்ணப்பங்கள் • சாட்சிகள் • ஜெப நேரம்'
            : 'Requests • Praise Wall • Secret Place'
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ACTS PRAYER MODEL & SECRET PLACE TIMER CARD */}
        <View style={[styles.heroBanner, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}>
          <View style={styles.heroBannerTop}>
            <View>
              <Text style={[styles.heroBannerTitle, { color: theme.text }]}>
                {isTamil ? 'A.C.T.S ஜெப மாதிரி' : 'A.C.T.S. Prayer Model'}
              </Text>
              <Text style={[styles.heroBannerDesc, { color: theme.textMuted }]}>
                {isTamil ? 'துதி • அறிக்கை • நன்றி • விண்ணப்பம்' : 'Adoration • Confession • Thanks • Supplication'}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.timerLaunchBtn, { backgroundColor: theme.primary }]}
              onPress={() => setShowTimerModal(true)}
              activeOpacity={0.8}
            >
              <Timer size={14} color="#000" />
              <Text style={styles.timerLaunchBtnText}>{isTamil ? 'ஜெப நேரம்' : 'Timer'}</Text>
            </TouchableOpacity>
          </View>

          {/* 4 Distinct ACTS badges */}
          <View style={styles.actsBadgesRow}>
            {actsCategories.map((item) => (
              <View
                key={item.letter}
                style={[
                  styles.actsPill,
                  {
                    backgroundColor: item.color + '18',
                    borderColor: item.color,
                  },
                ]}
              >
                <Text style={[styles.actsLetter, { color: item.color }]}>{item.letter}</Text>
                <Text style={[styles.actsName, { color: item.color }]}>
                  {isTamil ? item.nameTa : item.nameEn}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* STATUS TABS */}
        <View style={[styles.tabBar, { backgroundColor: theme.cardAlt }]}>
          {(['all', 'active', 'answered', 'waiting'] as const).map((tabKey) => {
            const isSelected = activeTab === tabKey;
            return (
              <TouchableOpacity
                key={tabKey}
                style={[
                  styles.tabBtn,
                  isSelected && { backgroundColor: theme.primary },
                ]}
                onPress={() => setActiveTab(tabKey)}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    { color: isSelected ? '#000' : theme.textMuted },
                  ]}
                >
                  {tabKey === 'all'
                    ? isTamil
                      ? 'அனைத்தும்'
                      : 'All'
                    : tabKey === 'active'
                    ? isTamil
                      ? 'செயலில்'
                      : 'Active'
                    : tabKey === 'answered'
                    ? isTamil
                      ? 'பதில் கிடைத்தது'
                      : 'Answered'
                    : isTamil
                    ? 'காத்திருப்பு'
                    : 'Waiting'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* SEARCH BAR */}
        <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}>
          <Search size={15} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={
              isTamil
                ? 'ஜெபங்களை அல்லது பிரிவுகளைத் தேடுக...'
                : 'Search prayer requests or category...'
            }
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* ADD PRAYER CTA */}
        <TouchableOpacity
          style={[styles.addPrayerCta, { backgroundColor: theme.primary }, theme.cardShadow]}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.85}
        >
          <Plus size={16} color="#000" />
          <Text style={styles.addPrayerCtaText}>
            {isTamil ? 'புதிய ஜெப விண்ணப்பம்' : 'Add Prayer Request'}
          </Text>
        </TouchableOpacity>

        {/* PRAYERS LIST WITH CREATION DATES */}
        <View style={styles.prayersList}>
          {filteredPrayers.length > 0 ? (
            filteredPrayers.map((prayer) => {
              const formattedDate = new Date(prayer.createdAt).toLocaleDateString(isTamil ? 'ta-IN' : 'en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
              const ansDate = prayer.answeredDate
                ? new Date(prayer.answeredDate).toLocaleDateString(isTamil ? 'ta-IN' : 'en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '';

              return (
                <View
                  key={prayer.id}
                  style={[
                    styles.prayerCard,
                    {
                      backgroundColor: theme.card,
                      borderColor:
                        prayer.status === 'answered'
                          ? theme.success
                          : prayer.priority === 'Urgent'
                          ? theme.danger
                          : theme.cardBorder,
                    },
                    theme.cardShadow,
                  ]}
                >
                  <View style={styles.prayerCardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={[styles.categoryTag, { backgroundColor: theme.cardAlt }]}>
                        <Text style={[styles.categoryTagText, { color: theme.primary }]}>
                          {prayer.category}
                        </Text>
                      </View>

                      {/* Prayer Creation Date */}
                      <View style={styles.dateBadge}>
                        <Calendar size={11} color={theme.textMuted} />
                        <Text style={[styles.dateText, { color: theme.textMuted }]}>{formattedDate}</Text>
                      </View>
                    </View>

                    <View style={styles.headerRightControls}>
                      {prayer.priority && prayer.priority !== 'Normal' && (
                        <View
                          style={[
                            styles.priorityBadge,
                            { backgroundColor: prayer.priority === 'Urgent' ? theme.danger : theme.warning },
                          ]}
                        >
                          <Text style={styles.priorityBadgeText}>{prayer.priority}</Text>
                        </View>
                      )}
                      <TouchableOpacity
                        style={styles.iconActionBtn}
                        onPress={() => {
                          setEditingPrayer(prayer);
                          setShowAddModal(true);
                        }}
                      >
                        <Edit2 size={14} color={theme.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.iconActionBtn}
                        onPress={() => deletePrayer(prayer.id)}
                      >
                        <Trash2 size={14} color={theme.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={[styles.prayerTitle, { color: theme.text }]}>{prayer.title}</Text>
                  {prayer.details ? (
                    <Text style={[styles.prayerDetails, { color: theme.textMuted }]}>
                      {prayer.details}
                    </Text>
                  ) : null}

                  {prayer.linkedVerse ? (
                    <View style={[styles.verseBox, { backgroundColor: theme.cardAlt }]}>
                      <Text style={[styles.verseBoxText, { color: theme.primary }]}>
                        📖 {prayer.linkedVerse}
                      </Text>
                    </View>
                  ) : null}

                  {/* If Answered: Testimony and Answer Date */}
                  {prayer.status === 'answered' && (
                    <View style={[styles.testimonyBox, { backgroundColor: theme.success + '15', borderColor: theme.success }]}>
                      <Sparkles size={15} color={theme.success} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.testimonyTitle, { color: theme.success }]}>
                          {isTamil ? 'சாட்சி' : 'Testimony'} ({ansDate}):
                        </Text>
                        <Text style={[styles.testimonyText, { color: theme.text }]}>
                          {prayer.testimony || 'God answered this prayer faithfully.'}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Mark Answered Button (for active prayers) */}
                  {prayer.status !== 'answered' && (
                    <TouchableOpacity
                      style={[styles.markAnsweredBtn, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}
                      onPress={() => handleOpenAnswerModal(prayer.id)}
                    >
                      <CheckCircle2 size={15} color={theme.success} />
                      <Text style={[styles.markAnsweredBtnText, { color: theme.success }]}>
                        {isTamil ? 'பதில் கிடைத்தது (சாட்சி பதிவு)' : 'Mark as Answered'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          ) : (
            <View style={styles.emptyCard}>
              <Heart size={32} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                {isTamil ? 'ஜெபங்கள் எதுவும் இல்லை' : 'No prayer items found.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Testimony Modal */}
      <Modal visible={!!answeringPrayerId} animationType="fade" transparent onRequestClose={() => setAnsweringPrayerId(null)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Sparkles size={18} color={theme.success} />
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {isTamil ? 'தேவனின் சாட்சி பதிவு' : 'Record Praise Testimony'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setAnsweringPrayerId(null)}>
                <X size={16} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.modalTextArea, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
              placeholder={isTamil ? 'சாட்சியை எழுதவும்...' : 'Describe how God answered...'}
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={4}
              value={testimonyText}
              onChangeText={setTestimonyText}
            />

            <TouchableOpacity style={[styles.saveTestimonyBtn, { backgroundColor: theme.success }]} onPress={handleConfirmAnswered}>
              <Check size={16} color="#FFF" />
              <Text style={styles.saveTestimonyBtnText}>
                {isTamil ? 'சாட்சியைச் சேமிக்க' : 'Save to Praise Wall'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modals */}
      <AddPrayerModal
        visible={showAddModal}
        initialPrayer={editingPrayer}
        onClose={() => {
          setShowAddModal(false);
          setEditingPrayer(null);
        }}
      />
      <PrayerTimerModal visible={showTimerModal} onClose={() => setShowTimerModal(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.hero + 40,
  },
  heroBanner: {
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  heroBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  heroBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  heroBannerDesc: {
    fontSize: 11,
    marginTop: 1,
  },
  timerLaunchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
  },
  timerLaunchBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000',
  },
  actsBadgesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  actsPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 5,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  actsLetter: {
    fontSize: 11,
    fontWeight: '900',
  },
  actsName: {
    fontSize: 10,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    padding: 3,
    marginBottom: spacing.md,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    borderRadius: borderRadius.sm,
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: 8,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  addPrayerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: borderRadius.md,
    gap: 6,
    marginBottom: spacing.md,
  },
  addPrayerCtaText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '800',
  },
  prayersList: {
    gap: 10,
  },
  prayerCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  prayerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dateText: {
    fontSize: 10,
    fontWeight: '600',
  },
  headerRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconActionBtn: {
    padding: 4,
    borderRadius: 4,
  },
  priorityBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  priorityBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  prayerTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  prayerDetails: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  verseBox: {
    padding: 6,
    borderRadius: borderRadius.sm,
    marginBottom: 6,
  },
  verseBoxText: {
    fontSize: 11,
    fontWeight: '600',
  },
  testimonyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginTop: 4,
  },
  testimonyTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  testimonyText: {
    fontSize: 12,
    lineHeight: 16,
  },
  markAnsweredBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginTop: 6,
  },
  markAnsweredBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyCard: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: 6,
  },
  emptyText: {
    fontSize: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalBox: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  modalTextArea: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 13,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  saveTestimonyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: borderRadius.md,
  },
  saveTestimonyBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
