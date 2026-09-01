import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../../context/AppContext';
import { THOUSAND_PRAISES, PraiseItem } from '../../data/thousandPraises';
import { X, Search, CheckCircle, Circle, Copy, Sparkles, RotateCcw, Share2, Flame } from 'lucide-react-native';
import { spacing, borderRadius } from '../../theme/spacing';

interface ThousandPraisesModalProps {
  visible: boolean;
  onClose: () => void;
}

const PRAISE_RANGES = [
  { label: 'All (1000)', min: 1, max: 1000 },
  { label: '1 - 100', min: 1, max: 100 },
  { label: '101 - 200', min: 101, max: 200 },
  { label: '201 - 300', min: 201, max: 300 },
  { label: '301 - 400', min: 301, max: 400 },
  { label: '401 - 500', min: 401, max: 500 },
  { label: '501 - 600', min: 501, max: 600 },
  { label: '601 - 700', min: 601, max: 700 },
  { label: '701 - 800', min: 701, max: 800 },
  { label: '801 - 900', min: 801, max: 900 },
  { label: '901 - 1000', min: 901, max: 1000 },
];

const STORAGE_KEY_READ_PRAISES = '@abide_read_praises_set';

export const ThousandPraisesModal: React.FC<ThousandPraisesModalProps> = ({ visible, onClose }) => {
  const { theme, settings } = useApp();
  const isTamil = settings.displayLanguage === 'ta';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(0);
  const [readPraiseIds, setReadPraiseIds] = useState<number[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Load saved progress
  useEffect(() => {
    async function loadProgress() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_READ_PRAISES);
        if (stored) {
          setReadPraiseIds(JSON.parse(stored));
        }
      } catch (e) {
        console.warn('Error loading praise read history:', e);
      }
    }
    if (visible) {
      loadProgress();
    }
  }, [visible]);

  // Toggle read status
  const toggleRead = async (id: number) => {
    let next: number[];
    if (readPraiseIds.includes(id)) {
      next = readPraiseIds.filter((item) => item !== id);
    } else {
      next = [...readPraiseIds, id];
    }
    setReadPraiseIds(next);
    await AsyncStorage.setItem(STORAGE_KEY_READ_PRAISES, JSON.stringify(next));
  };

  const handleResetProgress = () => {
    const confirmMsg = isTamil
      ? 'வாசித்த பலிகளின் பதிவுகளை மீட்டமைக்க விரும்புகிறீர்களா?'
      : 'Reset your 1000 Praises progress?';

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        setReadPraiseIds([]);
        AsyncStorage.removeItem(STORAGE_KEY_READ_PRAISES);
      }
      return;
    }

    Alert.alert(
      isTamil ? 'மீட்டமைக்கவா?' : 'Reset Progress',
      confirmMsg,
      [
        { text: isTamil ? 'ரத்து' : 'Cancel', style: 'cancel' },
        {
          text: isTamil ? 'மீட்டமை' : 'Reset',
          style: 'destructive',
          onPress: async () => {
            setReadPraiseIds([]);
            await AsyncStorage.removeItem(STORAGE_KEY_READ_PRAISES);
          },
        },
      ]
    );
  };

  const handleCopy = (item: PraiseItem) => {
    const copyText = `${item.number}. ${item.text} 🙏 #1000Praises #AbidePlus`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(copyText);
    }
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredPraises = useMemo(() => {
    const range = PRAISE_RANGES[selectedRangeIndex];
    let list = THOUSAND_PRAISES;

    if (range.min !== 1 || range.max !== 1000) {
      list = list.filter((p) => p.number >= range.min && p.number <= range.max);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      // If user typed a number
      const numQuery = parseInt(q.replace('#', ''), 10);
      if (!isNaN(numQuery)) {
        list = THOUSAND_PRAISES.filter((p) => p.number === numQuery || p.number.toString().includes(q));
      } else {
        list = list.filter(
          (p) =>
            p.text.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.number.toString() === q
        );
      }
    }

    return list;
  }, [selectedRangeIndex, searchQuery]);

  const progressPercent = Math.min(100, Math.round((readPraiseIds.length / 1000) * 100));

  const renderItem = ({ item }: { item: PraiseItem }) => {
    const isRead = readPraiseIds.includes(item.id);
    const isCopied = copiedId === item.id;

    return (
      <View
        style={[
          styles.praiseCard,
          {
            backgroundColor: isRead ? theme.cardAlt : theme.card,
            borderColor: isRead ? theme.primary + '50' : theme.cardBorder,
          },
          theme.cardShadow,
        ]}
      >
        <View style={styles.praiseCardHeader}>
          <View style={styles.badgeRow}>
            <View style={[styles.numberBadge, { backgroundColor: isRead ? theme.primary : theme.cardAlt, borderColor: theme.cardBorder }]}>
              <Text style={[styles.numberBadgeText, { color: isRead ? '#000' : theme.primary }]}>
                #{item.number}
              </Text>
            </View>
            <Text style={[styles.categoryTag, { color: theme.textMuted }]} numberOfLines={1}>
              {item.category}
            </Text>
          </View>

          <View style={styles.actionIconsRow}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: isCopied ? theme.success + '25' : theme.cardAlt }]}
              onPress={() => handleCopy(item)}
              activeOpacity={0.7}
            >
              <Copy size={13} color={isCopied ? theme.success : theme.textMuted} />
              {isCopied && <Text style={{ fontSize: 10, color: theme.success, fontWeight: '700' }}>Copied</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: isRead ? theme.primary + '25' : theme.cardAlt }]}
              onPress={() => toggleRead(item.id)}
              activeOpacity={0.7}
            >
              {isRead ? (
                <CheckCircle size={16} color={theme.primary} />
              ) : (
                <Circle size={16} color={theme.textMuted} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.praiseText, { color: isRead ? theme.textMuted : theme.text }]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* TOP HEADER */}
        <View style={[styles.headerBar, { borderBottomColor: theme.cardBorder, backgroundColor: theme.card }]}>
          <View style={styles.headerTitleCol}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Flame size={20} color="#F59E0B" />
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {isTamil ? '1000 ஸ்தோத்திர பலிகள்' : '1000 Praises (Tamil)'}
              </Text>
            </View>
            <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
              {isTamil ? 'துதிகளின் மத்தியில் வாசம் செய்யும் தேவனைத் துதிப்போம்' : 'Praising God who inhabits the praises of His people'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <X size={18} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* DEVOTION PROGRESS CARD */}
        <View style={[styles.progressCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}>
          <View style={styles.progressTop}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Sparkles size={15} color={theme.primary} />
              <Text style={[styles.progressLabel, { color: theme.text }]}>
                {isTamil ? 'ஜெப முன்னேற்றம்' : 'Devotion Progress'}: {readPraiseIds.length} / 1000 ({progressPercent}%)
              </Text>
            </View>

            {readPraiseIds.length > 0 && (
              <TouchableOpacity onPress={handleResetProgress} style={styles.resetBtn}>
                <RotateCcw size={12} color={theme.textMuted} />
                <Text style={[styles.resetBtnText, { color: theme.textMuted }]}>
                  {isTamil ? 'மீட்டமை' : 'Reset'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.progressBarTrack, { backgroundColor: theme.cardAlt }]}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: theme.primary }]} />
          </View>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}>
            <Search size={16} color={theme.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder={isTamil ? 'எண் அல்லது வார்த்தை கொண்டு தேடுக (#25, பிதா...)' : 'Search by number or keyword (#45, Father...)'}
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={14} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* CATEGORY / NUMBER RANGE PILLS */}
        <View style={styles.rangePillsSection}>
          <FlatList
            horizontal
            data={PRAISE_RANGES}
            keyExtractor={(item) => item.label}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rangePillsList}
            renderItem={({ item, index }) => {
              const isSelected = selectedRangeIndex === index && !searchQuery.trim();
              return (
                <TouchableOpacity
                  style={[
                    styles.rangePill,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.card,
                      borderColor: isSelected ? theme.primary : theme.cardBorder,
                    },
                  ]}
                  onPress={() => {
                    setSelectedRangeIndex(index);
                    setSearchQuery('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.rangePillText,
                      { color: isSelected ? '#000' : theme.textMuted, fontWeight: isSelected ? '800' : '600' },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* PRAISES LIST */}
        <FlatList
          data={filteredPraises}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          initialNumToRender={15}
          maxToRenderPerBatch={25}
          windowSize={10}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: theme.textMuted }]}>
                {isTamil ? 'பொருத்தமான ஸ்தோத்திரங்கள் எதுவும் இல்லை.' : 'No praises found matching your search.'}
              </Text>
            </View>
          }
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerTitleCol: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  progressCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: 8,
  },
  progressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resetBtnText: {
    fontSize: 11,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  rangePillsSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  rangePillsList: {
    paddingHorizontal: spacing.lg,
    gap: 8,
  },
  rangePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  rangePillText: {
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 40,
    gap: 10,
  },
  praiseCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: 8,
  },
  praiseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  numberBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  numberBadgeText: {
    fontSize: 11,
    fontWeight: '900',
  },
  categoryTag: {
    fontSize: 11,
    flex: 1,
  },
  actionIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  praiseText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  emptyState: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 13,
  },
});
