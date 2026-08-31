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
import { ProgressRing } from '../components/common/ProgressRing';
import { BibleReaderModal } from '../components/modals/BibleReaderModal';
import { BibleBook, ReadingPlan, VerseNote } from '../types/spiritual';
import {
  BookOpen,
  Search,
  CheckCircle,
  Sparkles,
  ChevronRight,
  X,
  Check,
  CheckCheck,
  StickyNote,
  Trash2,
  Plus,
  Edit3,
} from 'lucide-react-native';
import { spacing, borderRadius } from '../theme/spacing';

export const BibleScreen: React.FC = () => {
  const {
    theme,
    settings,
    bibleBooks,
    bibleProgress,
    readingPlans,
    togglePlanDay,
    toggleChapterRead,
    markAllChaptersRead,
    verseNotes,
    addVerseNote,
    updateVerseNote,
    deleteVerseNote,
  } = useApp();

  const isTamil = settings.displayLanguage === 'ta';

  // Tabs: OT first, NT second, Plans third, Notes fourth
  const [activeTab, setActiveTab] = useState<'OT' | 'NT' | 'Plans' | 'Notes'>('OT');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookForChapters, setSelectedBookForChapters] = useState<BibleBook | null>(null);

  // Reader Modal
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [readerVisible, setReaderVisible] = useState(false);
  const [readerInitialChapter, setReaderInitialChapter] = useState(1);

  // Standalone Add Note Modal from Notes tab
  const [showGlobalNoteModal, setShowGlobalNoteModal] = useState(false);
  const [manualReferenceInput, setManualReferenceInput] = useState('Genesis 1:1');
  const [manualVerseText, setManualVerseText] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [noteHighlightColor, setNoteHighlightColor] = useState('#F59E0B');

  // Filter books
  const filteredBooks = bibleBooks.filter((b) => {
    if (activeTab === 'OT' && b.testament !== 'OT') return false;
    if (activeTab === 'NT' && b.testament !== 'NT') return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.nameEn.toLowerCase().includes(q) ||
      b.nameTa.toLowerCase().includes(q) ||
      b.shortEn.toLowerCase().includes(q) ||
      b.shortTa.toLowerCase().includes(q)
    );
  });

  const filteredNotes = verseNotes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.verseRefEn.toLowerCase().includes(q) ||
      (n.verseRefTa && n.verseRefTa.toLowerCase().includes(q)) ||
      (n.verseText && n.verseText.toLowerCase().includes(q)) ||
      n.noteText.toLowerCase().includes(q)
    );
  });

  const openBookReader = (book: BibleBook, chapter: number = 1) => {
    setSelectedBook(book);
    setReaderInitialChapter(chapter);
    setSelectedBookForChapters(null);
    setTimeout(() => {
      setReaderVisible(true);
    }, 60);
  };

  const handleGlobalNoteSubmit = async () => {
    if (!noteBody.trim() && !manualVerseText.trim()) return;

    const refEn = manualReferenceInput.trim() || 'Scripture Note';
    let matchedBookId = 'GEN';
    let chapterNum = 1;
    const parts = refEn.split(' ');
    if (parts.length >= 2) {
      const bookName = parts.slice(0, parts.length - 1).join(' ').toLowerCase();
      const matched = bibleBooks.find((b) => b.nameEn.toLowerCase() === bookName || b.shortEn.toLowerCase() === bookName);
      if (matched) matchedBookId = matched.id;
      const chVersePart = parts[parts.length - 1];
      const ch = parseInt(chVersePart.split(':')[0]);
      if (!isNaN(ch) && ch > 0) chapterNum = ch;
    }

    await addVerseNote({
      bookId: matchedBookId,
      chapter: chapterNum,
      verseRefEn: refEn,
      verseRefTa: refEn,
      verseText: manualVerseText.trim(),
      noteText: noteBody.trim(),
      colorHighlight: noteHighlightColor,
    });

    setManualVerseText('');
    setNoteBody('');
    setShowGlobalNoteModal(false);
  };

  const currentActiveBook = selectedBookForChapters
    ? bibleBooks.find((b) => b.id === selectedBookForChapters.id) || selectedBookForChapters
    : null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title={isTamil ? 'பரிசுத்த வேதாகமம்' : 'Holy Scripture'}
        subtitle={
          isTamil
            ? '66 புத்தகங்கள் • வாசிப்புத் திட்டம் • குறிப்புகள்'
            : '66 Books • Plans • Verse Notes'
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Total Bible Progress Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}>
          <View style={styles.heroLeft}>
            <Text style={[styles.heroTitle, { color: theme.text }]}>
              {isTamil ? 'வேதாகம வாசிப்பு' : 'Scripture Progress'}
            </Text>
            <Text style={[styles.heroSub, { color: theme.textMuted }]}>
              {bibleProgress.readChaptersCount} / {bibleProgress.totalChapters} {isTamil ? 'அதிகாரங்கள்' : 'chapters'}
            </Text>

            <View style={styles.testamentStatsRow}>
              <View style={[styles.statPill, { backgroundColor: theme.cardAlt }]}>
                <Text style={[styles.statPillLabel, { color: theme.textMuted }]}>OT:</Text>
                <Text style={[styles.statPillVal, { color: theme.primary }]}>
                  {bibleProgress.otPercentage}%
                </Text>
              </View>
              <View style={[styles.statPill, { backgroundColor: theme.cardAlt }]}>
                <Text style={[styles.statPillLabel, { color: theme.textMuted }]}>NT:</Text>
                <Text style={[styles.statPillVal, { color: theme.accentSage }]}>
                  {bibleProgress.ntPercentage}%
                </Text>
              </View>
            </View>
          </View>

          <ProgressRing
            size={76}
            strokeWidth={6}
            progress={bibleProgress.totalPercentage}
            color={theme.primary}
            bgColor={theme.cardAlt}
          />
        </View>

        {/* 4 Tabs: OT | NT | Plans | Notes */}
        <View style={[styles.tabBar, { backgroundColor: theme.cardAlt }]}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'OT' && { backgroundColor: theme.primary }]}
            onPress={() => setActiveTab('OT')}
          >
            <Text style={[styles.tabBtnText, { color: activeTab === 'OT' ? '#000' : theme.textMuted }]}>
              {isTamil ? 'பழைய (39)' : 'OT (39)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'NT' && { backgroundColor: theme.primary }]}
            onPress={() => setActiveTab('NT')}
          >
            <Text style={[styles.tabBtnText, { color: activeTab === 'NT' ? '#000' : theme.textMuted }]}>
              {isTamil ? 'புதிய (27)' : 'NT (27)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'Plans' && { backgroundColor: theme.primary }]}
            onPress={() => setActiveTab('Plans')}
          >
            <Text style={[styles.tabBtnText, { color: activeTab === 'Plans' ? '#000' : theme.textMuted }]}>
              {isTamil ? 'திட்டம்' : 'Plans'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'Notes' && { backgroundColor: theme.primary }]}
            onPress={() => setActiveTab('Notes')}
          >
            <Text style={[styles.tabBtnText, { color: activeTab === 'Notes' ? '#000' : theme.textMuted }]}>
              {isTamil ? 'குறிப்புகள்' : 'Notes'} ({verseNotes.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}>
          <Search size={15} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={
              activeTab === 'Notes'
                ? isTamil
                  ? 'வசனக் குறிப்புகளைத் தேடுக...'
                  : 'Search verse notes...'
                : isTamil
                ? 'புத்தகத்தைத் தேடுக (எ.கா. ஆதியாகமம், யோவான்)...'
                : 'Search books...'
            }
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* BIBLE BOOKS (OT / NT) */}
        {(activeTab === 'OT' || activeTab === 'NT') && (
          <View style={styles.booksGrid}>
            {filteredBooks.map((book) => {
              const readCount = book.readChapters?.length || 0;
              const isCompleted = readCount === book.totalChapters && book.totalChapters > 0;
              const percent = Math.round((readCount / book.totalChapters) * 100);

              return (
                <TouchableOpacity
                  key={book.id}
                  style={[
                    styles.bookCard,
                    {
                      backgroundColor: theme.card,
                      borderColor: isCompleted ? theme.success : theme.cardBorder,
                    },
                    theme.cardShadow,
                  ]}
                  onPress={() => setSelectedBookForChapters(book)}
                  activeOpacity={0.75}
                >
                  <View style={styles.bookCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.bookNameTamil, { color: theme.text }]}>
                        {book.nameTa}
                      </Text>
                      <Text style={[styles.bookNameEnglish, { color: theme.textMuted }]}>
                        {book.nameEn}
                      </Text>
                    </View>

                    {isCompleted ? (
                      <View style={[styles.completedBadge, { backgroundColor: theme.success + '20' }]}>
                        <Check size={14} color={theme.success} />
                        <Text style={[styles.completedBadgeText, { color: theme.success }]}>100%</Text>
                      </View>
                    ) : (
                      <View style={[styles.percentBadge, { backgroundColor: theme.cardAlt }]}>
                        <Text style={[styles.percentBadgeText, { color: theme.primary }]}>
                          {percent}%
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.bookProgressRow}>
                    <View style={[styles.progressBarTrack, { backgroundColor: theme.cardAlt }]}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${percent}%`,
                            backgroundColor: isCompleted ? theme.success : theme.primary,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.chapterCountLabel, { color: theme.textMuted }]}>
                      {readCount}/{book.totalChapters} {isTamil ? 'அதி.' : 'chs'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* GUIDED READING PLANS */}
        {activeTab === 'Plans' && (
          <View style={styles.plansContainer}>
            {readingPlans.map((plan) => {
              const completedCount = plan.completedDays?.length || 0;
              const planPercent = Math.round((completedCount / plan.daysTotal) * 100);

              return (
                <View
                  key={plan.id}
                  style={[styles.planCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}
                >
                  <View style={styles.planHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.planTitle, { color: theme.text }]}>
                        {isTamil ? plan.titleTa : plan.titleEn}
                      </Text>
                      <Text style={[styles.planDesc, { color: theme.textMuted }]}>
                        {isTamil ? plan.descriptionTa : plan.descriptionEn}
                      </Text>
                    </View>
                    <ProgressRing
                      size={54}
                      strokeWidth={5}
                      progress={planPercent}
                      color={theme.accentSage}
                      bgColor={theme.cardAlt}
                    />
                  </View>

                  <View style={styles.planReadingsList}>
                    {plan.dailyReadings.slice(0, 6).map((reading) => {
                      const isDone = plan.completedDays?.includes(reading.day);
                      return (
                        <TouchableOpacity
                          key={reading.day}
                          style={[
                            styles.planDayRow,
                            {
                              backgroundColor: isDone ? theme.success + '15' : theme.cardAlt,
                              borderColor: isDone ? theme.success : 'transparent',
                            },
                          ]}
                          onPress={() => togglePlanDay(plan.id, reading.day)}
                        >
                          <View
                            style={[
                              styles.planDayCircle,
                              {
                                backgroundColor: isDone ? theme.success : theme.card,
                                borderColor: isDone ? theme.success : theme.cardBorder,
                              },
                            ]}
                          >
                            <Text style={[styles.planDayNumber, { color: isDone ? '#FFF' : theme.text }]}>
                              {reading.day}
                            </Text>
                          </View>

                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.planPassageText,
                                {
                                 color: isDone ? theme.textMuted : theme.text,
                                  textDecorationLine: isDone ? 'line-through' : 'none',
                                },
                              ]}
                            >
                              {isTamil ? reading.passageTa : reading.passageEn}
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.checkbox,
                              {
                                backgroundColor: isDone ? theme.success : 'transparent',
                                borderColor: isDone ? theme.success : theme.textMuted,
                              },
                            ]}
                          >
                            {isDone && <Check size={12} color="#FFF" />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* VERSE NOTES ARCHIVE & SINGLE ADD NOTE BUTTON */}
        {activeTab === 'Notes' && (
          <View style={styles.notesContainer}>
            {/* Single '+' Action button */}
            <TouchableOpacity
              style={[styles.addNoteMainCta, { backgroundColor: theme.primary }, theme.cardShadow]}
              onPress={() => setShowGlobalNoteModal(true)}
            >
              <Plus size={16} color="#000" />
              <Text style={styles.addNoteMainCtaText}>
                {isTamil ? 'வசனக் குறிப்பு எழுதுக' : 'Add Scripture Verse & Note'}
              </Text>
            </TouchableOpacity>

            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => {
                const targetBook = bibleBooks.find((b) => b.id === note.bookId);
                return (
                  <View
                    key={note.id}
                    style={[
                      styles.noteCard,
                      {
                        backgroundColor: theme.card,
                        borderColor: note.colorHighlight || theme.cardBorder,
                        borderLeftWidth: 4,
                        borderLeftColor: note.colorHighlight || theme.primary,
                      },
                      theme.cardShadow,
                    ]}
                  >
                    <View style={styles.noteCardHeader}>
                      <TouchableOpacity
                        onPress={() => {
                          if (targetBook) {
                            openBookReader(targetBook, note.chapter);
                          }
                        }}
                      >
                        <Text style={[styles.noteRefTamil, { color: theme.primary }]}>
                          📖 {note.verseRefEn || note.verseRefTa}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => deleteVerseNote(note.id)}>
                        <Trash2 size={14} color={theme.textMuted} />
                      </TouchableOpacity>
                    </View>

                    {note.verseText ? (
                      <Text style={[styles.noteVerseQuote, { color: theme.text }]}>
                        "{note.verseText}"
                      </Text>
                    ) : null}

                    {note.noteText ? (
                      <Text style={[styles.noteBodyText, { color: theme.textLight }]}>
                        {note.noteText}
                      </Text>
                    ) : null}
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyBox}>
                <StickyNote size={32} color={theme.primary} style={{ opacity: 0.7 }} />
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                  {isTamil
                    ? 'குறிப்புகள் எதுவும் இல்லை. மேலே உள்ள பொத்தானை அழுத்தி வசனம் (எ.கா. Genesis 1:1, Genesis 1:30) மற்றும் உமது குறிப்புகளைச் சேர்க்கவும்.'
                    : 'No notes yet. Tap "Add Scripture Verse & Note" above to record any verse (e.g. Genesis 1:1, Genesis 1:30) and your study reflections!'}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* GLOBAL ADD VERSE NOTE MODAL - MANUAL REFERENCE INPUT */}
      <Modal
        visible={showGlobalNoteModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowGlobalNoteModal(false)}
      >
        <View style={styles.chapterModalBackdrop}>
          <View style={[styles.chapterModalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.chapterModalHeader}>
              <Text style={[styles.chapterModalBookName, { color: theme.text }]}>
                {isTamil ? 'வசனக் குறிப்பு எழுதுக' : 'Add Scripture Verse & Note'}
              </Text>
              <TouchableOpacity onPress={() => setShowGlobalNoteModal(false)}>
                <X size={18} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: '85%' }}>
              {/* Manual Reference (e.g. Genesis 1:1, Genesis 1:30) */}
              <Text style={[styles.pickerLabel, { color: theme.textMuted }]}>
                {isTamil ? 'வேத வசனக் குறிப்பு (Scripture Reference):' : 'Scripture Reference:'}
              </Text>
              <TextInput
                style={[styles.referenceTextInput, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
                value={manualReferenceInput}
                onChangeText={setManualReferenceInput}
                placeholder="e.g. Genesis 1:1 or Genesis 1:30"
                placeholderTextColor={theme.textMuted}
                autoFocus
              />

              {/* Optional Scripture Verse Text */}
              <Text style={[styles.pickerLabel, { color: theme.textMuted }]}>
                {isTamil ? 'வேத வசனம் (Scripture Verse Text - விருப்பமானது):' : 'Scripture Verse Text (Optional):'}
              </Text>
              <TextInput
                style={[styles.verseTextInputArea, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
                placeholder={isTamil ? 'வசனத்தை தட்டச்சு செய்க...' : 'Type scripture verse text...'}
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={2}
                value={manualVerseText}
                onChangeText={setManualVerseText}
              />

              {/* Color Highlight Picker */}
              <Text style={[styles.pickerLabel, { color: theme.textMuted }]}>
                {isTamil ? 'வண்ணக் குறிப்பான்:' : 'Highlight Color:'}
              </Text>
              <View style={styles.colorPickerRow}>
                {['#F59E0B', '#10B981', '#38BDF8', '#8B5CF6', '#EC4899'].map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorDot,
                      { backgroundColor: c },
                      noteHighlightColor === c && styles.colorDotSelected,
                    ]}
                    onPress={() => setNoteHighlightColor(c)}
                  />
                ))}
              </View>

              {/* Note Textarea */}
              <Text style={[styles.pickerLabel, { color: theme.textMuted }]}>
                {isTamil ? 'உமது தியானக் குறிப்பு (Study Note / Reflection):' : 'Your Study Note / Reflection:'}
              </Text>
              <TextInput
                style={[styles.globalNoteArea, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
                placeholder={isTamil ? 'இந்த வசனத்தின் தியானக் குறிப்பை எழுதவும்...' : 'Type your personal notes / reflections...'}
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={4}
                value={noteBody}
                onChangeText={setNoteBody}
              />

              <TouchableOpacity style={[styles.saveGlobalNoteBtn, { backgroundColor: theme.primary }]} onPress={handleGlobalNoteSubmit}>
                <Check size={16} color="#000" />
                <Text style={styles.saveGlobalNoteBtnText}>{isTamil ? 'சேமிக்க' : 'Save Note'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* CHAPTER SELECTION MODAL */}
      <Modal
        visible={!!currentActiveBook}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedBookForChapters(null)}
      >
        <View style={styles.chapterModalBackdrop}>
          <View style={[styles.chapterModalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            {currentActiveBook && (
              <>
                <View style={styles.chapterModalHeader}>
                  <View>
                    <Text style={[styles.chapterModalBookName, { color: theme.text }]}>
                      {isTamil ? currentActiveBook.nameTa : currentActiveBook.nameEn}
                    </Text>
                    <Text style={[styles.chapterModalBookSub, { color: theme.primary }]}>
                      {isTamil ? currentActiveBook.nameEn : currentActiveBook.nameTa} • {currentActiveBook.readChapters?.length || 0} / {currentActiveBook.totalChapters} {isTamil ? 'அதிகாரங்கள்' : 'chapters'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => setSelectedBookForChapters(null)}
                    style={[styles.closeModalBtn, { backgroundColor: theme.cardAlt }]}
                  >
                    <X size={18} color={theme.text} />
                  </TouchableOpacity>
                </View>

                {/* Quick actions for chapters */}
                <View style={styles.chapterQuickActionsRow}>
                  <TouchableOpacity
                    style={[styles.quickMarkBtn, { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}
                    onPress={() => markAllChaptersRead(currentActiveBook.id, true)}
                  >
                    <CheckCheck size={14} color={theme.primary} />
                    <Text style={[styles.quickMarkText, { color: theme.primary }]}>
                      {isTamil ? 'அனைத்தும் வாசித்தது' : 'Mark All Read'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.quickMarkBtn, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}
                    onPress={() => markAllChaptersRead(currentActiveBook.id, false)}
                  >
                    <X size={14} color={theme.textMuted} />
                    <Text style={[styles.quickMarkText, { color: theme.textMuted }]}>
                      {isTamil ? 'அழிக்க' : 'Reset'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Chapter Numbers Grid */}
                <ScrollView contentContainerStyle={styles.chapterGridScroll} showsVerticalScrollIndicator={false}>
                  <View style={styles.chapterGrid}>
                    {Array.from({ length: currentActiveBook.totalChapters }, (_, i) => i + 1).map((ch) => {
                      const isRead = currentActiveBook.readChapters?.includes(ch);
                      return (
                        <TouchableOpacity
                          key={ch}
                          style={[
                            styles.chapterGridBox,
                            {
                              backgroundColor: isRead ? theme.success : theme.cardAlt,
                              borderColor: isRead ? theme.success : theme.cardBorder,
                            },
                          ]}
                          onPress={() => openBookReader(currentActiveBook, ch)}
                          onLongPress={() => toggleChapterRead(currentActiveBook.id, ch)}
                        >
                          <Text
                            style={[
                              styles.chapterGridNumber,
                              { color: isRead ? '#FFF' : theme.text },
                            ]}
                          >
                            {ch}
                          </Text>
                          {isRead && <Check size={9} color="#FFF" style={{ marginTop: 1 }} />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Reader Modal */}
      <BibleReaderModal
        visible={readerVisible}
        onClose={() => setReaderVisible(false)}
        book={selectedBook}
        initialChapter={readerInitialChapter}
      />
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
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md + 2,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  heroLeft: {
    flex: 1,
    paddingRight: spacing.md,
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  heroSub: {
    fontSize: 12,
    marginTop: 2,
  },
  testamentStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.sm,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  statPillLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  statPillVal: {
    fontSize: 11,
    fontWeight: '800',
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    padding: 3,
    marginBottom: spacing.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
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
  booksGrid: {
    gap: 8,
  },
  bookCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  bookCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  bookNameTamil: {
    fontSize: 15,
    fontWeight: '700',
  },
  bookNameEnglish: {
    fontSize: 12,
    marginTop: 1,
  },
  percentBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  percentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  completedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  bookProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBarTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  chapterCountLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  plansContainer: {
    gap: spacing.md,
  },
  planCard: {
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  planTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  planDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  planReadingsList: {
    gap: 6,
  },
  planDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    gap: 8,
  },
  planDayCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planDayNumber: {
    fontSize: 10,
    fontWeight: '800',
  },
  planPassageText: {
    fontSize: 12,
    fontWeight: '600',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesContainer: {
    gap: 10,
  },
  addNoteMainCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: borderRadius.md,
    marginBottom: 4,
  },
  addNoteMainCtaText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '800',
  },
  noteCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  noteCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  noteRefTamil: {
    fontSize: 14,
    fontWeight: '800',
  },
  noteVerseQuote: {
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '600',
    marginBottom: 6,
  },
  noteBodyText: {
    fontSize: 12,
    lineHeight: 18,
  },
  chapterModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  chapterModalCard: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderWidth: 1,
    maxHeight: '85%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  chapterModalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  chapterModalBookName: {
    fontSize: 17,
    fontWeight: '800',
  },
  chapterModalBookSub: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterQuickActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  quickMarkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  quickMarkText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chapterGridScroll: {
    paddingBottom: spacing.xxl,
  },
  chapterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
  },
  chapterGridBox: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterGridNumber: {
    fontSize: 13,
    fontWeight: '800',
  },
  pickerLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  referenceTextInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: '700',
  },
  verseTextInputArea: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 12,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  colorPickerRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 6,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#FFF',
  },
  globalNoteArea: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 13,
    minHeight: 85,
    textAlignVertical: 'top',
    marginTop: 4,
    marginBottom: 10,
  },
  saveGlobalNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  saveGlobalNoteBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '800',
  },
  emptyBox: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
