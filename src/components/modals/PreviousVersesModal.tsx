import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Share,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { DAILY_VERSES } from '../../data/dailyVerses';
import { VerseOfTheDay } from '../../types/spiritual';
import { X, Search, Share2, Calendar, BookOpen } from 'lucide-react-native';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface PreviousVersesModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectVerse: (index: number) => void;
}

export const PreviousVersesModal: React.FC<PreviousVersesModalProps> = ({
  visible,
  onClose,
  onSelectVerse,
}) => {
  const { theme, settings } = useApp();
  const isTamil = settings.displayLanguage === 'ta';
  const [searchQuery, setSearchQuery] = useState('');

  // Generate date for each historical verse
  const getVerseDate = (offsetDays: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    return d.toLocaleDateString(isTamil ? 'ta-IN' : 'en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredVerses = DAILY_VERSES.map((verse, idx) => ({
    ...verse,
    originalIndex: idx,
    dateString: idx === 0 ? (isTamil ? 'இன்று' : 'Today') : idx === 1 ? (isTamil ? 'நேற்று' : 'Yesterday') : getVerseDate(idx),
  })).filter((v) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.referenceEn.toLowerCase().includes(q) ||
      v.referenceTa.toLowerCase().includes(q) ||
      v.textEn.toLowerCase().includes(q) ||
      v.textTa.toLowerCase().includes(q) ||
      v.theme.toLowerCase().includes(q) ||
      v.themeTa.toLowerCase().includes(q) ||
      v.dateString.toLowerCase().includes(q)
    );
  });

  const handleShare = async (verse: VerseOfTheDay) => {
    try {
      const shareText = `🕊️ Scripture Verse (Abide+ App):\n\n"${verse.textEn}"\n${verse.referenceEn} (NIV)\n\n"${verse.textTa}"\n${verse.referenceTa} (TAOVBSI)\n\nReflection: ${verse.reflectionEn}`;
      await Share.share({ message: shareText });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                {isTamil ? 'முந்தைய நாள் வேத வசனங்கள்' : 'Previous Daily Verses'}
              </Text>
              <Text style={[styles.headerSub, { color: theme.primary }]}>
                {isTamil ? 'நாட்காட்டி & தியானத் தொகுப்பு' : 'Scripture Archive with Dates'}
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.cardAlt }]}>
              <X size={16} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchBar, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}>
            <Search size={14} color={theme.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder={isTamil ? 'தேதி, வசனம் அல்லது கருத்தைத் தேடுக...' : 'Search by date, reference, theme...'}
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Verses Scroll List */}
          <ScrollView contentContainerStyle={styles.versesList} showsVerticalScrollIndicator={false}>
            {filteredVerses.map((verse) => (
              <TouchableOpacity
                key={verse.id}
                style={[styles.verseItemCard, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}
                onPress={() => {
                  onSelectVerse(verse.originalIndex);
                  onClose();
                }}
                activeOpacity={0.8}
              >
                <View style={styles.verseCardTop}>
                  <View style={[styles.dateBadge, { backgroundColor: theme.primary + '20' }]}>
                    <Calendar size={11} color={theme.primary} />
                    <Text style={[styles.dateBadgeText, { color: theme.primary }]}>
                      {verse.dateString}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={[styles.themeBadge, { backgroundColor: theme.card }]}>
                      <Text style={[styles.themeBadgeText, { color: theme.textMuted }]}>
                        {isTamil ? verse.themeTa : verse.theme}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleShare(verse)} style={styles.shareBtn}>
                      <Share2 size={13} color={theme.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Tamil Verse */}
                <Text style={[styles.verseTextTamil, { color: theme.text, fontFamily: typography.tamilFont }]}>
                  {verse.textTa}
                </Text>
                <Text style={[styles.verseRefTamil, { color: theme.primary, fontFamily: typography.tamilFont }]}>
                  {verse.referenceTa} (TAOVBSI)
                </Text>

                {/* English Verse */}
                <View style={[styles.divider, { borderColor: theme.cardBorder }]}>
                  <Text style={[styles.verseTextEnglish, { color: theme.textLight }]}>
                    {verse.textEn}
                  </Text>
                  <Text style={[styles.verseRefEnglish, { color: theme.primaryLight }]}>
                    {verse.referenceEn} (NIV)
                  </Text>
                </View>

                {/* Devotional Note */}
                <View style={[styles.devotionalBox, { backgroundColor: theme.card }]}>
                  <Text style={[styles.devotionalLabel, { color: theme.primary }]}>
                    💡 {isTamil ? 'தியானம்:' : 'Insight:'}
                  </Text>
                  <Text style={[styles.devotionalText, { color: theme.textMuted }]}>
                    {isTamil ? verse.reflectionTa : verse.reflectionEn}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderWidth: 1,
    maxHeight: '88%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
  },
  versesList: {
    gap: 12,
    paddingBottom: spacing.xxl,
  },
  verseItemCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  verseCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  dateBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  themeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  themeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  shareBtn: {
    padding: 4,
  },
  verseTextTamil: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
  },
  verseRefTamil: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 3,
    marginBottom: 6,
  },
  divider: {
    borderTopWidth: 1,
    paddingTop: 6,
    marginTop: 2,
  },
  verseTextEnglish: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  verseRefEnglish: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  devotionalBox: {
    padding: 8,
    borderRadius: borderRadius.sm,
    marginTop: 8,
  },
  devotionalLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 2,
  },
  devotionalText: {
    fontSize: 11,
    lineHeight: 16,
  },
});
