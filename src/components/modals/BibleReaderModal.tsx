import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Share,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { BibleBook, VerseNote } from '../../types/spiritual';
import {
  X,
  Share2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  StickyNote,
  BookOpen,
  Trash2,
  Check,
  Edit2,
  PenTool,
} from 'lucide-react-native';
import { spacing, borderRadius } from '../../theme/spacing';

interface BibleReaderModalProps {
  visible: boolean;
  onClose: () => void;
  book: BibleBook | null;
  initialChapter?: number;
}

export const BibleReaderModal: React.FC<BibleReaderModalProps> = ({
  visible,
  onClose,
  book,
  initialChapter = 1,
}) => {
  const {
    theme,
    settings,
    toggleChapterRead,
    verseNotes,
    addVerseNote,
    updateVerseNote,
    deleteVerseNote,
  } = useApp();

  const [currentChapter, setCurrentChapter] = useState(initialChapter);
  const [fontSize, setFontSize] = useState<number>(16);

  // Manual Verse & Note Creator Modal
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [manualReferenceInput, setManualReferenceInput] = useState('');
  const [manualVerseTextInput, setManualVerseTextInput] = useState('');
  const [manualNoteInput, setManualNoteInput] = useState('');
  const [selectedHighlightColor, setSelectedHighlightColor] = useState<string>('#F59E0B');

  const isTamil = settings.displayLanguage === 'ta';

  React.useEffect(() => {
    if (visible && book) {
      setCurrentChapter(initialChapter);
    }
  }, [visible, initialChapter, book]);

  // Notes belonging exclusively to this specific chapter
  const chapterNotes = useMemo(() => {
    if (!book) return [];
    return verseNotes.filter(
      (n) => n.bookId === book.id && n.chapter === currentChapter
    );
  }, [verseNotes, book, currentChapter]);

  if (!book) return null;

  const isRead = book.readChapters?.includes(currentChapter) || false;

  const handleShareChapter = async () => {
    try {
      const bookTitle = isTamil ? book.nameTa : book.nameEn;
      const notesSample = chapterNotes
        .map((n) => `• ${n.verseRefEn}\n${n.verseText ? `"${n.verseText}"\n` : ''}${n.noteText}`)
        .join('\n\n');
      const shareContent = `📖 ${bookTitle} ${currentChapter}\n\n${notesSample || 'Meditated on this chapter in Abide+ App!'}`;
      await Share.share({ message: shareContent });
    } catch (e) {
      console.error(e);
    }
  };

  // Open clean blank note editor
  const handleOpenNewNote = () => {
    setEditingNoteId(null);
    const defaultRef = `${book.nameEn} ${currentChapter}:1`;
    setManualReferenceInput(defaultRef);
    setManualVerseTextInput('');
    setManualNoteInput('');
    setSelectedHighlightColor('#F59E0B');
    setShowNoteEditor(true);
  };

  const handleEditNote = (note: VerseNote) => {
    setEditingNoteId(note.id);
    setManualReferenceInput(note.verseRefEn || `${book.nameEn} ${currentChapter}:1`);
    setManualVerseTextInput(note.verseText || '');
    setManualNoteInput(note.noteText || '');
    setSelectedHighlightColor(note.colorHighlight || '#F59E0B');
    setShowNoteEditor(true);
  };

  const handleSaveManualNote = async () => {
    if (!manualNoteInput.trim() && !manualVerseTextInput.trim()) {
      setShowNoteEditor(false);
      return;
    }

    const refEn = manualReferenceInput.trim() || `${book.nameEn} ${currentChapter}`;
    const refTa = isTamil ? `${book.nameTa} ${currentChapter}` : refEn;

    if (editingNoteId) {
      await updateVerseNote(editingNoteId, {
        noteText: manualNoteInput.trim(),
        colorHighlight: selectedHighlightColor,
        verseRefEn: refEn,
        verseRefTa: refTa,
        verseText: manualVerseTextInput.trim(),
      });
    } else {
      await addVerseNote({
        bookId: book.id,
        chapter: currentChapter,
        verseRefEn: refEn,
        verseRefTa: refTa,
        verseText: manualVerseTextInput.trim(),
        noteText: manualNoteInput.trim(),
        colorHighlight: selectedHighlightColor,
      });
    }

    setShowNoteEditor(false);
    setEditingNoteId(null);
    setManualReferenceInput('');
    setManualVerseTextInput('');
    setManualNoteInput('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Top App Bar */}
        <View style={[styles.topBar, { backgroundColor: theme.card, borderBottomColor: theme.cardBorder }]}>
          <TouchableOpacity onPress={onClose} style={[styles.backBtn, { backgroundColor: theme.cardAlt }]}>
            <X size={18} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.bookTitleCol}>
            <Text style={[styles.topBookTitle, { color: theme.text }]} numberOfLines={1}>
              {isTamil ? book.nameTa : book.nameEn} {currentChapter}
            </Text>
            <Text style={[styles.topTranslationSub, { color: theme.primary }]}>
              {isTamil ? book.nameEn : book.nameTa} • {isTamil ? `${currentChapter}-ம் அதிகாரம்` : `Chapter ${currentChapter}`}
            </Text>
          </View>

          <View style={styles.topRightControls}>
            {/* SINGLE '+' ICON TO MANUALLY ADD VERSE & NOTE */}
            <TouchableOpacity
              style={[styles.makeNoteBtn, { backgroundColor: theme.primary }]}
              onPress={handleOpenNewNote}
              activeOpacity={0.8}
            >
              <Plus size={15} color="#000" />
              <Text style={styles.makeNoteBtnText}>{isTamil ? 'குறிப்பு' : 'Add Note'}</Text>
            </TouchableOpacity>

            {/* Font size adjustments */}
            <TouchableOpacity
              style={[styles.fontBtn, { backgroundColor: theme.cardAlt }]}
              onPress={() => setFontSize((f) => Math.max(13, f - 2))}
            >
              <Text style={[styles.fontBtnText, { color: theme.text }]}>A-</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.fontBtn, { backgroundColor: theme.cardAlt }]}
              onPress={() => setFontSize((f) => Math.min(22, f + 2))}
            >
              <Text style={[styles.fontBtnText, { color: theme.text }]}>A+</Text>
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity onPress={handleShareChapter} style={[styles.actionIconBtn, { backgroundColor: theme.cardAlt }]}>
              <Share2 size={14} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Chapter Workspace Body */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scriptureScrollContent} showsVerticalScrollIndicator={false}>
          {/* Chapter Header Card */}
          <View style={[styles.chapterHeaderCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <BookOpen size={24} color={theme.primary} style={{ marginBottom: 4 }} />
            <Text style={[styles.chapterHeadingText, { color: theme.text }]}>
              {isTamil ? book.nameTa : book.nameEn}
            </Text>
            <Text style={[styles.chapterNumberBig, { color: theme.primary }]}>
              {isTamil ? `${currentChapter}-ம் அதிகாரம்` : `Chapter ${currentChapter}`}
            </Text>
          </View>

          {/* User's Manual Verses & Notes List for this Chapter */}
          {chapterNotes.length > 0 ? (
            <View style={styles.notesListContainer}>
              {chapterNotes.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.manualVerseCard,
                    {
                      backgroundColor: theme.card,
                      borderColor: item.colorHighlight || theme.cardBorder,
                      borderLeftColor: item.colorHighlight || theme.primary,
                      borderLeftWidth: 4,
                    },
                  ]}
                >
                  <View style={styles.verseCardHeader}>
                    <View style={styles.refPill}>
                      <Text style={[styles.verseRefTitle, { color: item.colorHighlight || theme.primary }]}>
                        📖 {item.verseRefEn || `${book.nameEn} ${currentChapter}`}
                      </Text>
                    </View>

                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity onPress={() => handleEditNote(item)} style={styles.actionSmallBtn}>
                        <Edit2 size={13} color={theme.textMuted} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteVerseNote(item.id)} style={styles.actionSmallBtn}>
                        <Trash2 size={13} color={theme.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Optional Manual Verse text */}
                  {item.verseText ? (
                    <Text
                      style={[
                        styles.manualVerseText,
                        {
                          color: theme.text,
                          fontSize,
                          lineHeight: fontSize * 1.55,
                        },
                      ]}
                    >
                      "{item.verseText}"
                    </Text>
                  ) : null}

                  {/* Study Reflection / Notes */}
                  {item.noteText ? (
                    <View style={[styles.noteContentBox, { backgroundColor: theme.cardAlt }]}>
                      <Text style={[styles.noteBodyText, { color: theme.textLight, fontSize: fontSize - 1 }]}>
                        {item.noteText}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ))}

              {/* Add another note button (clean without duplicate +) */}
              <TouchableOpacity
                style={[styles.addAnotherBtn, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}
                onPress={handleOpenNewNote}
              >
                <Plus size={15} color={theme.primary} />
                <Text style={[styles.addAnotherText, { color: theme.primary }]}>
                  {isTamil ? 'மேலும் ஒரு வசனம் / குறிப்பு சேர்க்க' : 'Add Another Verse / Note'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Clean Blank Workspace */
            <View style={[styles.blankCanvasCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <PenTool size={36} color={theme.primary} style={{ opacity: 0.8, marginBottom: 8 }} />
              <Text style={[styles.blankTitle, { color: theme.text }]}>
                {isTamil ? 'வெற்று பக்கத்தில் குறிப்பு எழுதுக' : 'Blank Chapter Canvas'}
              </Text>
              <Text style={[styles.blankSub, { color: theme.textMuted }]}>
                {isTamil
                  ? `இந்த ${book.nameTa} ${currentChapter}-ம் அதிகாரத்திற்கான வசனங்கள் (எ.கா. Genesis 1:1, Genesis 1:30) மற்றும் உமது தியானக் குறிப்புகளைச் சேர்க்கவும்.`
                  : `Record Scripture verses (e.g. Genesis 1:1, Genesis 1:30) and your study notes for ${book.nameEn} ${currentChapter}.`}
              </Text>

              <TouchableOpacity
                style={[styles.blankCtaBtn, { backgroundColor: theme.primary }]}
                onPress={handleOpenNewNote}
                activeOpacity={0.85}
              >
                <Plus size={16} color="#000" />
                <Text style={styles.blankCtaBtnText}>
                  {isTamil ? 'வசனம் & குறிப்பு எழுத' : 'Write Verse & Note'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Bottom Completion Action & Pagination */}
          <View style={styles.bottomReaderActions}>
            <TouchableOpacity
              style={[
                styles.markReadBtn,
                {
                  backgroundColor: isRead ? theme.success : theme.primary,
                },
              ]}
              onPress={() => toggleChapterRead(book.id, currentChapter)}
            >
              <CheckCircle2 size={16} color={isRead ? '#FFF' : '#000'} />
              <Text style={[styles.markReadBtnText, { color: isRead ? '#FFF' : '#000' }]}>
                {isRead
                  ? isTamil
                    ? 'வாசித்து முடிக்கப்பட்டது ✓'
                    : 'Chapter Completed ✓'
                  : isTamil
                  ? 'அதிகாரத்தை முடித்ததாகக் குறிக்க'
                  : 'Mark Chapter as Read'}
              </Text>
            </TouchableOpacity>

            <View style={styles.chapterPaginationRow}>
              <TouchableOpacity
                style={[
                  styles.pageBtn,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                  currentChapter <= 1 && { opacity: 0.4 },
                ]}
                disabled={currentChapter <= 1}
                onPress={() => setCurrentChapter((c) => Math.max(1, c - 1))}
              >
                <ChevronLeft size={16} color={theme.text} />
                <Text style={[styles.pageBtnText, { color: theme.text }]}>
                  {isTamil ? 'முந்தைய அதிகாரம்' : 'Prev Chapter'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.pageBtn,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                  currentChapter >= book.totalChapters && { opacity: 0.4 },
                ]}
                disabled={currentChapter >= book.totalChapters}
                onPress={() => setCurrentChapter((c) => Math.min(book.totalChapters, c + 1))}
              >
                <Text style={[styles.pageBtnText, { color: theme.text }]}>
                  {isTamil ? 'அடுத்த அதிகாரம்' : 'Next Chapter'}
                </Text>
                <ChevronRight size={16} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* MANUAL VERSE & NOTE MODAL */}
        <Modal
          visible={showNoteEditor}
          animationType="slide"
          transparent
          onRequestClose={() => setShowNoteEditor(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.noteModalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              {/* Modal Header */}
              <View style={styles.noteModalHeader}>
                <Text style={[styles.noteModalTitle, { color: theme.text }]}>
                  {editingNoteId
                    ? isTamil
                      ? 'குறிப்பைத் திருத்துக'
                      : 'Edit Verse & Note'
                    : isTamil
                    ? 'வசனம் & குறிப்பு சேர்க்க'
                    : 'Add Verse & Note'}
                </Text>
                <TouchableOpacity onPress={() => setShowNoteEditor(false)}>
                  <X size={18} color={theme.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Manual Reference (e.g. Genesis 1:1, Genesis 1:30) */}
                <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                  {isTamil ? 'வேத வசனக் குறிப்பு (Scripture Reference):' : 'Scripture Reference:'}
                </Text>
                <TextInput
                  style={[styles.referenceTextInput, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
                  value={manualReferenceInput}
                  onChangeText={setManualReferenceInput}
                  placeholder={`e.g. ${book.nameEn} ${currentChapter}:1 or ${book.nameEn} ${currentChapter}:30`}
                  placeholderTextColor={theme.textMuted}
                  autoFocus
                />

                {/* Optional Scripture Verse Text */}
                <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                  {isTamil ? 'வேத வசனம் (Scripture Verse Text - விருப்பமானது):' : 'Scripture Verse Text (Optional):'}
                </Text>
                <TextInput
                  style={[styles.verseTextInputArea, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
                  placeholder={isTamil ? 'வசனத்தை தட்டச்சு செய்க...' : 'Type scripture verse text...'}
                  placeholderTextColor={theme.textMuted}
                  multiline
                  numberOfLines={2}
                  value={manualVerseTextInput}
                  onChangeText={setManualVerseTextInput}
                />

                {/* Highlight Color Picker */}
                <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                  {isTamil ? 'வண்ணக் குறிப்பான்:' : 'Highlight Color:'}
                </Text>
                <View style={styles.colorPickerRow}>
                  {['#F59E0B', '#10B981', '#38BDF8', '#8B5CF6', '#EC4899'].map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.colorDot,
                        { backgroundColor: c },
                        selectedHighlightColor === c && styles.colorDotSelected,
                      ]}
                      onPress={() => setSelectedHighlightColor(c)}
                    />
                  ))}
                </View>

                {/* Note Textarea */}
                <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                  {isTamil ? 'உமது தியானக் குறிப்பு (Study Note / Reflection):' : 'Your Study Note / Reflection:'}
                </Text>
                <TextInput
                  style={[styles.noteInputArea, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
                  placeholder={isTamil ? 'இந்த வசனத்தின் தியானக் குறிப்பை எழுதவும்...' : 'Type your personal reflection or study notes...'}
                  placeholderTextColor={theme.textMuted}
                  multiline
                  numberOfLines={4}
                  value={manualNoteInput}
                  onChangeText={setManualNoteInput}
                />

                {/* Save Button */}
                <View style={styles.noteActionButtons}>
                  <TouchableOpacity style={[styles.saveNoteBtn, { backgroundColor: theme.primary }]} onPress={handleSaveManualNote}>
                    <Check size={16} color="#000" />
                    <Text style={styles.saveNoteBtnText}>
                      {editingNoteId
                        ? isTamil
                          ? 'புதுப்பிக்க'
                          : 'Update Note'
                        : isTamil
                        ? 'சேமிக்கவும்'
                        : 'Save Note'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    gap: 8,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookTitleCol: {
    flex: 1,
  },
  topBookTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  topTranslationSub: {
    fontSize: 10,
    fontWeight: '700',
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  makeNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
  },
  makeNoteBtnText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '800',
  },
  fontBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  fontBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scriptureScrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.hero + 60,
  },
  chapterHeaderCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  chapterHeadingText: {
    fontSize: 18,
    fontWeight: '800',
  },
  chapterNumberBig: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  notesListContainer: {
    gap: 12,
  },
  manualVerseCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  verseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  refPill: {
    flex: 1,
  },
  verseRefTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionSmallBtn: {
    padding: 4,
  },
  manualVerseText: {
    fontStyle: 'italic',
    fontWeight: '600',
    marginBottom: 6,
  },
  noteContentBox: {
    padding: 8,
    borderRadius: borderRadius.sm,
    marginTop: 4,
  },
  noteBodyText: {
    lineHeight: 18,
  },
  addAnotherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addAnotherText: {
    fontSize: 12,
    fontWeight: '700',
  },
  blankCanvasCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
    borderStyle: 'dashed',
  },
  blankTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  blankSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  blankCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  blankCtaBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '800',
  },
  bottomReaderActions: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    gap: 8,
  },
  markReadBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  chapterPaginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  pageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: 6,
  },
  pageBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  noteModalCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    maxHeight: '90%',
  },
  noteModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  noteModalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  fieldLabel: {
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
    marginVertical: 4,
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
  noteInputArea: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 13,
    minHeight: 85,
    textAlignVertical: 'top',
  },
  noteActionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
  },
  saveNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  saveNoteBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '800',
  },
});
