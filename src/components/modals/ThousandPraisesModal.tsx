import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { THOUSAND_PRAISES, PraiseItem } from '../../data/thousandPraises';
import { X, Search, Flame } from 'lucide-react-native';
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

export const ThousandPraisesModal: React.FC<ThousandPraisesModalProps> = ({ visible, onClose }) => {
  const { theme, settings } = useApp();
  const isTamil = settings.displayLanguage === 'ta';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(0);

  const filteredPraises = useMemo(() => {
    const range = PRAISE_RANGES[selectedRangeIndex];
    let list = THOUSAND_PRAISES;

    if (range.min !== 1 || range.max !== 1000) {
      list = list.filter((p) => p.number >= range.min && p.number <= range.max);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const numQuery = parseInt(q.replace('#', ''), 10);
      if (!isNaN(numQuery)) {
        list = THOUSAND_PRAISES.filter((p) => p.number === numQuery || p.number.toString().includes(q));
      } else {
        list = list.filter(
          (p) =>
            p.text.toLowerCase().includes(q) ||
            p.number.toString() === q
        );
      }
    }

    return list;
  }, [selectedRangeIndex, searchQuery]);

  const renderItem = ({ item }: { item: PraiseItem }) => {
    return (
      <View
        style={[
          styles.praiseCard,
          {
            backgroundColor: theme.card,
            borderColor: theme.cardBorder,
          },
          theme.cardShadow,
        ]}
      >
        <View style={styles.praiseRow}>
          <View style={[styles.numberBadge, { backgroundColor: theme.primary + '18', borderColor: theme.primary + '35' }]}>
            <Text style={[styles.numberBadgeText, { color: theme.primary }]}>
              #{item.number}
            </Text>
          </View>
          <Text style={[styles.praiseText, { color: theme.text }]}>
            {item.text}
          </Text>
        </View>
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

        {/* NUMBER RANGE PILLS */}
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
          initialNumToRender={20}
          maxToRenderPerBatch={30}
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
  searchSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
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
    gap: 8,
  },
  praiseCard: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  praiseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  numberBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 2,
  },
  numberBadgeText: {
    fontSize: 11,
    fontWeight: '900',
  },
  praiseText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 23,
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
