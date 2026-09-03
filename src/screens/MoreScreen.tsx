import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Header } from '../components/common/Header';
import { AuthScreen } from './AuthScreen';
import { TodoSection } from '../components/todo/TodoSection';
import { FastingRecord, SermonNote, ScriptureMemoryCard } from '../types/spiritual';
import { DecisionWheel } from '../types/decision';
import { SUPPORTED_CURRENCIES } from '../types/finance';
import { DecisionWheelView } from '../components/decision/DecisionWheelView';
import { EditWheelModal } from '../components/modals/EditWheelModal';
import { DecisionHistoryModal } from '../components/modals/DecisionHistoryModal';
import { AccountDetailsModal } from '../components/modals/AccountDetailsModal';
import {
  Flame,
  BookMarked,
  Brain,
  Settings,
  Download,
  Upload,
  Plus,
  Play,
  Square,
  Check,
  X,
  Trash2,
  ChevronRight,
  Moon,
  Sun,
  Calendar,
  Clock,
  Edit2,
  Zap,
  CheckSquare,
  Disc,
  Shield,
  User,
} from 'lucide-react-native';
import { spacing, borderRadius } from '../theme/spacing';
import { typography } from '../theme/typography';

export const MoreScreen: React.FC = () => {
  const {
    theme,
    settings,
    updateSettings,
    toggleTheme,
    setCurrency,
    user,
    deleteAccount,
    activeFast,
    fastingHistory,
    startFast,
    stopFast,
    deleteFastingRecord,
    sermons,
    addSermon,
    updateSermon,
    deleteSermon,
    memoryVerses,
    addMemoryVerse,
    updateMemoryVerse,
    toggleMemoryVerse,
    deleteMemoryVerse,
    exportBackupData,
    importBackupData,
    restoreAllUserData,
  } = useApp();

  const isTamil = settings.displayLanguage === 'ta';

  const [activeSection, setActiveSection] = useState<'tasks' | 'fasting' | 'decision' | 'sermons' | 'memory' | 'settings'>('tasks');

  // Decision Wheel Modals
  const [showEditWheelModal, setShowEditWheelModal] = useState(false);
  const [wheelToEdit, setWheelToEdit] = useState<DecisionWheel | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Account Details Modal
  const [showAccountDetailsModal, setShowAccountDetailsModal] = useState(false);

  // Fasting modal
  const [showStartFastModal, setShowStartFastModal] = useState(false);
  const [fastType, setFastType] = useState<FastingRecord['fastType']>('Water');
  const [fastTargetHours, setFastTargetHours] = useState('24');
  const [fastIntention, setFastIntention] = useState('');

  // Sermon modal
  const [showAddSermonModal, setShowAddSermonModal] = useState(false);
  const [editingSermon, setEditingSermon] = useState<SermonNote | null>(null);
  const [sermonTitle, setSermonTitle] = useState('');
  const [sermonPreacher, setSermonPreacher] = useState('');
  const [sermonPassage, setSermonPassage] = useState('');
  const [sermonNotes, setSermonNotes] = useState('');
  const [sermonTakeaway, setSermonTakeaway] = useState('');

  // Memory modal
  const [showAddMemoryModal, setShowAddMemoryModal] = useState(false);
  const [editingMemory, setEditingMemory] = useState<ScriptureMemoryCard | null>(null);
  const [memRefEn, setMemRefEn] = useState('');
  const [memRefTa, setMemRefTa] = useState('');
  const [memTextEn, setMemTextEn] = useState('');
  const [memTextTa, setMemTextTa] = useState('');

  // Backup modal
  const [backupJson, setBackupJson] = useState('');
  const [showBackupModal, setShowBackupModal] = useState(false);

  // Auth modal
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handleRestoreUserData = async () => {
    setRestoring(true);
    try {
      const ok = await restoreAllUserData();
      if (ok) {
        Alert.alert(
          isTamil ? 'தரவு மீட்டெடுக்கப்பட்டது! 🎉' : 'Data Restored! 🎉',
          isTamil
            ? 'உங்கள் அனைத்து ஜெபங்கள், வரவு செலவுகள், பழக்கங்கள் மற்றும் வேதாகம வாசிப்பு பதிவுகள் வெற்றிகரமாக மீட்டெடுக்கப்பட்டன.'
            : 'All your prayers, transactions, habits, sermons, and Bible reading progress have been successfully restored!'
        );
      } else {
        Alert.alert(
          isTamil ? 'மீட்டெடுப்பு தகவல்' : 'Restore Notice',
          isTamil
            ? 'கிளவுட் அல்லது உள்ளூர் சேமிப்பகத்திலிருந்து தரவு புதுப்பிக்கப்பட்டது.'
            : 'Data refreshed from storage.'
        );
      }
    } catch (e: any) {
      Alert.alert('Restore Error', e?.message || 'Failed to restore data.');
    } finally {
      setRestoring(false);
    }
  };

  const handleDeleteAccountPrompt = async () => {
    const confirmMsg = isTamil
      ? 'உங்கள் பயனர் கணக்கு மற்றும் Firebase கிளவுட்டில் உள்ள அனைத்து தரவுகளும் (ஜெபங்கள், குறிப்புகள், வரவு செலவுகள்) நிரந்தரமாக நீக்கப்படும். தொடரவா?'
      : 'This will permanently delete your account and wipe all your data (prayers, expenses, notes, tasks) from Firebase Cloud. Are you sure you want to proceed?';

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        await deleteAccount();
        window.alert(
          isTamil
            ? 'உங்கள் கணக்கு மற்றும் கிளவுட் தரவுகள் முழுமையாக நீக்கப்பட்டன.'
            : 'Your account and cloud data have been completely deleted.'
        );
      }
      return;
    }

    Alert.alert(
      isTamil ? 'கணக்கை நிரந்தரமாக நீக்கவா?' : 'Delete Account & Cloud Data',
      confirmMsg,
      [
        { text: isTamil ? 'ரத்து' : 'Cancel', style: 'cancel' },
        {
          text: isTamil ? 'ஆம், நீக்கு' : 'Yes, Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteAccount();
            Alert.alert(
              isTamil ? 'நீக்கப்பட்டது' : 'Account Deleted',
              isTamil
                ? 'உங்கள் கணக்கு மற்றும் கிளவுட் தரவுகள் முழுமையாக நீக்கப்பட்டன.'
                : 'Your account and cloud data have been completely deleted.'
            );
          },
        },
      ]
    );
  };

  const handleStartFastSubmit = async () => {
    await startFast(fastType, parseInt(fastTargetHours) || 24, fastIntention.trim() || 'Seeking the Lord');
    setFastIntention('');
    setShowStartFastModal(false);
  };

  const handleOpenEditSermon = (sermon: SermonNote) => {
    setEditingSermon(sermon);
    setSermonTitle(sermon.title);
    setSermonPreacher(sermon.preacher);
    setSermonPassage(sermon.scripturePassage);
    setSermonNotes(sermon.notes);
    setSermonTakeaway(sermon.keyTakeaways?.[0] || '');
    setShowAddSermonModal(true);
  };

  const handleOpenNewSermon = () => {
    setEditingSermon(null);
    setSermonTitle('');
    setSermonPreacher('');
    setSermonPassage('');
    setSermonNotes('');
    setSermonTakeaway('');
    setShowAddSermonModal(true);
  };

  const handleAddSermonSubmit = async () => {
    if (!sermonTitle.trim()) return;

    if (editingSermon) {
      await updateSermon(editingSermon.id, {
        title: sermonTitle.trim(),
        preacher: sermonPreacher.trim() || 'Pastor',
        scripturePassage: sermonPassage.trim() || 'Scripture',
        notes: sermonNotes.trim(),
        keyTakeaways: sermonTakeaway.trim() ? [sermonTakeaway.trim()] : [],
      });
    } else {
      await addSermon({
        title: sermonTitle.trim(),
        preacher: sermonPreacher.trim() || 'Pastor',
        date: new Date().toLocaleDateString(isTamil ? 'ta-IN' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        scripturePassage: sermonPassage.trim() || 'Scripture',
        notes: sermonNotes.trim(),
        keyTakeaways: sermonTakeaway.trim() ? [sermonTakeaway.trim()] : [],
        actionItems: [],
      });
    }

    setEditingSermon(null);
    setSermonTitle('');
    setSermonPreacher('');
    setSermonPassage('');
    setSermonNotes('');
    setSermonTakeaway('');
    setShowAddSermonModal(false);
  };

  const handleOpenEditMemory = (card: ScriptureMemoryCard) => {
    setEditingMemory(card);
    setMemRefEn(card.verseRefEn);
    setMemRefTa(card.verseRefTa);
    setMemTextEn(card.textEn);
    setMemTextTa(card.textTa);
    setShowAddMemoryModal(true);
  };

  const handleOpenNewMemory = () => {
    setEditingMemory(null);
    setMemRefEn('');
    setMemRefTa('');
    setMemTextEn('');
    setMemTextTa('');
    setShowAddMemoryModal(true);
  };

  const handleAddMemorySubmit = async () => {
    if (!memRefEn.trim() || !memTextEn.trim()) return;

    if (editingMemory) {
      await updateMemoryVerse(editingMemory.id, {
        verseRefEn: memRefEn.trim(),
        verseRefTa: memRefTa.trim() || memRefEn.trim(),
        textEn: memTextEn.trim(),
        textTa: memTextTa.trim() || memTextEn.trim(),
      });
    } else {
      await addMemoryVerse({
        verseRefEn: memRefEn.trim(),
        verseRefTa: memRefTa.trim() || memRefEn.trim(),
        textEn: memTextEn.trim(),
        textTa: memTextTa.trim() || memTextEn.trim(),
        isMemorized: false,
      });
    }

    setEditingMemory(null);
    setMemRefEn('');
    setMemRefTa('');
    setMemTextEn('');
    setMemTextTa('');
    setShowAddMemoryModal(false);
  };

  const handleExport = async () => {
    try {
      const data = await exportBackupData();
      setBackupJson(data);
      if (Platform.OS === 'web') {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const dateStr = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `abide_plus_backup_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Alert.alert('Backup Exported', isTamil ? 'காப்புப்பிரதி கோப்பு பதிவிறக்கம் செய்யப்பட்டது!' : 'Backup JSON file downloaded successfully!');
      } else {
        setShowBackupModal(true);
      }
    } catch (e) {
      console.error('Export error', e);
      setShowBackupModal(true);
    }
  };

  const handleImport = async () => {
    if (!backupJson.trim()) {
      Alert.alert('Required', isTamil ? 'காப்புப்பிரதி JSON உள்ளிடவும்.' : 'Please paste valid JSON backup content.');
      return;
    }
    const ok = await importBackupData(backupJson);
    if (ok) {
      setShowBackupModal(false);
      Alert.alert('Success', isTamil ? 'காப்புப்பிரதி வெற்றிகரமாக மீட்டமைக்கப்பட்டது!' : 'Backup restored successfully! All prayers, habits, and finances updated.');
    } else {
      Alert.alert('Error', isTamil ? 'செல்லுபடியாகாத JSON வடிவம்.' : 'Invalid JSON backup format.');
    }
  };

  const handleWebFileSelect = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.onchange = (event: any) => {
        const file = event.target?.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const text = e.target?.result as string;
            if (text) {
              setBackupJson(text);
              const ok = await importBackupData(text);
              if (ok) {
                Alert.alert('Success', isTamil ? 'காப்புப்பிரதி வெற்றிகரமாக மீட்டமைக்கப்பட்டது!' : 'Backup restored successfully from file!');
                setShowBackupModal(false);
              } else {
                Alert.alert('Error', isTamil ? 'செல்லுபடியாகாத JSON வடிவம்.' : 'Invalid JSON backup file.');
              }
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    } else {
      setShowBackupModal(true);
    }
  };

  // Date computations for active fast
  const activeFastStartDate = activeFast
    ? new Date(activeFast.startTime).toLocaleDateString(isTamil ? 'ta-IN' : 'en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const activeFastTargetEndDate = activeFast
    ? new Date(new Date(activeFast.startTime).getTime() + (activeFast.targetHours || 24) * 3600 * 1000).toLocaleDateString(
        isTamil ? 'ta-IN' : 'en-US',
        {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }
      )
    : '';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title={isTamil ? 'ஆவிக்குரிய கருவிகள்' : 'Spiritual Tools'}
        subtitle={
          isTamil
            ? 'பணிகள் • உபவாசம் • சக்கரம் • பிரசங்கம் • மனனம் • அமைப்பு'
            : 'To-Do • Fasting • Wheel • Sermons • Memory • Settings'
        }
      />

      {/* Horizontal Scrollable Clean Tool Selector */}
      <View style={styles.sectionTabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sectionTabsContent}
        >
          {[
            { key: 'tasks', icon: CheckSquare, labelEn: 'To-Do', labelTa: 'பணிகள்' },
            { key: 'fasting', icon: Flame, labelEn: 'Fasting', labelTa: 'உபவாசம்' },
            { key: 'decision', icon: Disc, labelEn: 'Decision Wheel', labelTa: 'சக்கரம்' },
            { key: 'sermons', icon: BookMarked, labelEn: 'Sermons', labelTa: 'பிரசங்கம்' },
            { key: 'memory', icon: Brain, labelEn: 'Memory Cards', labelTa: 'மனனம்' },
            { key: 'settings', icon: Settings, labelEn: 'Settings & Cloud', labelTa: 'அமைப்புகள்' },
          ].map((tab) => {
            const isSelected = activeSection === tab.key;
            const Icon = tab.icon;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.sectionTabPill,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.cardAlt,
                    borderColor: isSelected ? theme.primary : theme.cardBorder,
                  },
                ]}
                onPress={() => setActiveSection(tab.key as any)}
                activeOpacity={0.8}
              >
                <Icon size={14} color={isSelected ? '#000' : theme.textMuted} />
                <Text
                  style={[
                    styles.sectionTabText,
                    {
                      color: isSelected ? '#000' : theme.text,
                      fontFamily: isTamil ? typography.tamilFont : typography.fontFamily,
                      fontWeight: isSelected ? '800' : '600',
                    },
                  ]}
                >
                  {isTamil ? tab.labelTa : tab.labelEn}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* TO-DO PLANNER */}
        {activeSection === 'tasks' && (
          <View style={styles.sectionContainer}>
            <TodoSection />
          </View>
        )}

        {/* FASTING TRACKER WITH COMPLETE DATES */}
        {activeSection === 'fasting' && (
          <View style={styles.sectionContainer}>
            {activeFast ? (
              <View style={[styles.activeFastBox, { backgroundColor: theme.card, borderColor: theme.primary }, theme.cardShadow]}>
                <View style={styles.activeFastHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Flame size={22} color={theme.primary} />
                    <View>
                      <Text style={[styles.activeFastTitle, { color: theme.text }]}>
                        {activeFast.fastType} Fast
                      </Text>
                      <Text style={[styles.activeFastSub, { color: theme.primary }]}>
                        {activeFast.targetHours} {isTamil ? 'மணி நேரம் உபவாசம்' : 'Hours Session'}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <TouchableOpacity
                      style={[styles.stopFastBtn, { backgroundColor: theme.danger }]}
                      onPress={stopFast}
                    >
                      <Square size={13} color="#FFF" />
                      <Text style={styles.stopFastBtnText}>{isTamil ? 'முடிக்க' : 'End Fast'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.deleteFastMiniBtn, { backgroundColor: theme.danger + '18' }]}
                      onPress={() => deleteFastingRecord(activeFast.id)}
                    >
                      <Trash2 size={13} color={theme.danger} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Clear Start & Target End Dates */}
                <View style={[styles.fastingDatesCard, { backgroundColor: theme.cardAlt }]}>
                  <View style={styles.fastDateRow}>
                    <Calendar size={14} color={theme.primary} />
                    <Text style={[styles.fastDateLabel, { color: theme.textMuted }]}>
                      {isTamil ? 'தொடங்கிய நாள்:' : 'Started Date:'}
                    </Text>
                    <Text style={[styles.fastDateValue, { color: theme.text }]}>
                      {activeFastStartDate}
                    </Text>
                  </View>

                  <View style={styles.fastDateRow}>
                    <Clock size={14} color={theme.accentSage} />
                    <Text style={[styles.fastDateLabel, { color: theme.textMuted }]}>
                      {isTamil ? 'இலக்கு முடிவு நாள்:' : 'Target Completion:'}
                    </Text>
                    <Text style={[styles.fastDateValue, { color: theme.accentSage }]}>
                      {activeFastTargetEndDate}
                    </Text>
                  </View>
                </View>

                {activeFast.prayerIntention ? (
                  <View style={[styles.intentionBox, { backgroundColor: theme.cardAlt }]}>
                    <Text style={[styles.intentionLabel, { color: theme.textMuted }]}>
                      🙏 {isTamil ? 'ஜெப நோக்கம்:' : 'Prayer Intention:'}
                    </Text>
                    <Text style={[styles.intentionText, { color: theme.text }]}>
                      {activeFast.prayerIntention}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <View style={[styles.startFastPrompt, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}>
                <Flame size={32} color={theme.primary} />
                <Text style={[styles.promptTitle, { color: theme.text }]}>
                  {isTamil ? 'ஆவிக்குரிய உபவாசம்' : 'Spiritual Fasting'}
                </Text>
                <Text style={[styles.promptDesc, { color: theme.textMuted }]}>
                  {isTamil
                    ? '"இந்த ஜாதி பிசாசு ஜெபத்தினாலும் உபவாசத்தினாலுமேயன்றி மற்றெதனாலும் புறப்பட்டுப் போகாது" (மத்தேயு 17:21).'
                    : '"This kind cannot come out by anything but prayer and fasting." (Mark 9:29)'}
                </Text>
                <TouchableOpacity
                  style={[styles.startFastActionBtn, { backgroundColor: theme.primary }]}
                  onPress={() => setShowStartFastModal(true)}
                >
                  <Play size={15} color="#000" />
                  <Text style={styles.startFastActionText}>
                    {isTamil ? 'உபவாசம் தொடங்க' : 'Begin Fasting'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Fasting History */}
            <View style={styles.historySection}>
              <Text style={[styles.subHeaderTitle, { color: theme.text }]}>
                {isTamil ? 'கடந்த கால உபவாசப் பதிவுகள்' : 'Fasting Milestones & Dates'}
              </Text>
              {fastingHistory.length > 0 ? (
                fastingHistory.map((fast) => {
                  const sDate = new Date(fast.startTime).toLocaleDateString(isTamil ? 'ta-IN' : 'en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  return (
                    <View
                      key={fast.id}
                      style={[styles.historyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}
                    >
                      <View style={styles.historyTop}>
                        <Text style={[styles.historyType, { color: theme.primary }]}>
                          {fast.fastType} Fast ({fast.targetHours}h)
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={[styles.historyStatus, { color: fast.status === 'completed' ? theme.success : theme.textMuted }]}>
                            {fast.status.toUpperCase()}
                          </Text>
                          <TouchableOpacity
                            onPress={() => deleteFastingRecord(fast.id)}
                            style={styles.deleteFastIconBtn}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Trash2 size={13} color={theme.danger} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text style={[styles.historyIntention, { color: theme.text }]}>
                        {fast.prayerIntention}
                      </Text>
                      <View style={styles.historyDateRow}>
                        <Calendar size={12} color={theme.textMuted} />
                        <Text style={[styles.historyDate, { color: theme.textMuted }]}>
                          {sDate}
                        </Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={[styles.noItemsText, { color: theme.textMuted }]}>
                  {isTamil ? 'பதிவுகள் எதுவும் இல்லை' : 'No past fasting records.'}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* DECISION MAKER WHEEL */}
        {activeSection === 'decision' && (
          <View style={styles.sectionContainer}>
            <DecisionWheelView
              onOpenCreateWheel={() => {
                setWheelToEdit(null);
                setShowEditWheelModal(true);
              }}
              onOpenEditWheel={(w) => {
                setWheelToEdit(w);
                setShowEditWheelModal(true);
              }}
              onOpenHistory={() => setShowHistoryModal(true)}
            />
          </View>
        )}

        {/* SERMON NOTES */}
        {activeSection === 'sermons' && (
          <View style={styles.sectionContainer}>
            <TouchableOpacity
              style={[styles.addCtaBtn, { backgroundColor: theme.primary }, theme.cardShadow]}
              onPress={handleOpenNewSermon}
            >
              <Plus size={16} color="#000" />
              <Text style={styles.addCtaBtnText}>
                {isTamil ? 'பிரசங்கக் குறிப்பு சேர்க்க' : 'Add Sermon Notes'}
              </Text>
            </TouchableOpacity>

            <View style={styles.sermonsList}>
              {sermons.map((sermon) => (
                <View
                  key={sermon.id}
                  style={[styles.sermonCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}
                >
                  <View style={styles.sermonHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.sermonTitle, { color: theme.text }]}>{sermon.title}</Text>
                      <Text style={[styles.sermonMeta, { color: theme.primary }]}>
                        {sermon.preacher} • {sermon.scripturePassage}
                      </Text>
                      <Text style={[styles.sermonDate, { color: theme.textMuted }]}>{sermon.date}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <TouchableOpacity onPress={() => handleOpenEditSermon(sermon)}>
                        <Edit2 size={14} color={theme.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteSermon(sermon.id)}>
                        <Trash2 size={14} color={theme.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={[styles.sermonBody, { color: theme.text }]}>{sermon.notes}</Text>

                  {sermon.keyTakeaways?.length > 0 && (
                    <View style={[styles.takeawayBox, { backgroundColor: theme.cardAlt }]}>
                      <Text style={[styles.takeawayHeading, { color: theme.primary }]}>
                        💡 {isTamil ? 'முக்கிய போதனைகள்:' : 'Key Takeaways:'}
                      </Text>
                      {sermon.keyTakeaways.map((t, idx) => (
                        <Text key={idx} style={[styles.takeawayItem, { color: theme.text }]}>
                          • {t}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* SCRIPTURE MEMORY */}
        {activeSection === 'memory' && (
          <View style={styles.sectionContainer}>
            <TouchableOpacity
              style={[styles.addCtaBtn, { backgroundColor: theme.primary }, theme.cardShadow]}
              onPress={handleOpenNewMemory}
            >
              <Plus size={16} color="#000" />
              <Text style={styles.addCtaBtnText}>
                {isTamil ? 'மனன வசனம் சேர்க்க' : 'Add Memory Card'}
              </Text>
            </TouchableOpacity>

            <View style={styles.memoryGrid}>
              {memoryVerses.map((card) => (
                <View
                  key={card.id}
                  style={[
                    styles.memoryCard,
                    {
                      backgroundColor: theme.card,
                      borderColor: card.isMemorized ? theme.success : theme.cardBorder,
                    },
                    theme.cardShadow,
                  ]}
                >
                  <View style={styles.memoryHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.memoryRefTamil, { color: theme.primary }]}>
                        {card.verseRefTa}
                      </Text>
                      <Text style={[styles.memoryRefEnglish, { color: theme.primaryLight }]}>
                        {card.verseRefEn}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <TouchableOpacity onPress={() => handleOpenEditMemory(card)}>
                        <Edit2 size={14} color={theme.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteMemoryVerse(card.id)}>
                        <Trash2 size={14} color={theme.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={[styles.memoryTextTamil, { color: theme.text }]}>
                    "{card.textTa}"
                  </Text>
                  <Text style={[styles.memoryTextEnglish, { color: theme.textLight }]}>
                    "{card.textEn}"
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.toggleMemorizedBtn,
                      {
                        backgroundColor: card.isMemorized ? theme.success : theme.cardAlt,
                        borderColor: card.isMemorized ? theme.success : theme.cardBorder,
                      },
                    ]}
                    onPress={() => toggleMemoryVerse(card.id)}
                  >
                    <Check size={15} color={card.isMemorized ? '#FFF' : theme.textMuted} />
                    <Text
                      style={[
                        styles.toggleMemorizedText,
                        { color: card.isMemorized ? '#FFF' : theme.text },
                      ]}
                    >
                      {card.isMemorized
                        ? isTamil
                          ? 'மனப்பாடம் செய்யப்பட்டது ✓'
                          : 'Memorized ✓'
                        : isTamil
                        ? 'மனப்பாடம் செய்ததாகக் குறிக்க'
                        : 'Mark as Memorized'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* SETTINGS */}
        {activeSection === 'settings' && (
          <View style={styles.sectionContainer}>
            {/* Bible Translation */}
            <View style={[styles.settingBlock, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                📖 {isTamil ? 'வேதாகம மொழிபெயர்ப்பு' : 'Bible Translation'}
              </Text>
              <View style={styles.settingOptionsRow}>
                <TouchableOpacity
                  style={[
                    styles.settingChoiceBtn,
                    settings.bibleTranslation === 'NIV' && { backgroundColor: theme.primary },
                  ]}
                  onPress={() => updateSettings({ bibleTranslation: 'NIV' })}
                >
                  <Text
                    style={[
                      styles.settingChoiceText,
                      { color: settings.bibleTranslation === 'NIV' ? '#000' : theme.text },
                    ]}
                  >
                    English (NIV)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.settingChoiceBtn,
                    settings.bibleTranslation === 'TAOVBSI' && { backgroundColor: theme.primary },
                  ]}
                  onPress={() => updateSettings({ bibleTranslation: 'TAOVBSI' })}
                >
                  <Text
                    style={[
                      styles.settingChoiceText,
                      { color: settings.bibleTranslation === 'TAOVBSI' ? '#000' : theme.text },
                    ]}
                  >
                    தமிழ் (TAOVBSI)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Currency */}
            <View style={[styles.settingBlock, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                💰 {isTamil ? 'நாணயம்' : 'Currency Symbol'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginTop: 8 }}>
                {SUPPORTED_CURRENCIES.map((curr) => {
                  const isSel = settings.currency.code === curr.code;
                  return (
                    <TouchableOpacity
                      key={curr.code}
                      style={[
                        styles.currPill,
                        {
                          backgroundColor: isSel ? theme.primary : theme.cardAlt,
                          borderColor: isSel ? theme.primary : theme.cardBorder,
                        },
                      ]}
                      onPress={() => setCurrency(curr)}
                    >
                      <Text style={[styles.currPillText, { color: isSel ? '#000' : theme.text }]}>
                        {curr.symbol} {curr.code}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Theme Toggle */}
            <TouchableOpacity
              style={[styles.settingRowBlock, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}
              onPress={toggleTheme}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {settings.isDarkMode ? <Moon size={16} color={theme.primary} /> : <Sun size={16} color={theme.primary} />}
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  {settings.isDarkMode ? 'Dark Mode (Active)' : 'Light Mode (Active)'}
                </Text>
              </View>
              <ChevronRight size={15} color={theme.textMuted} />
            </TouchableOpacity>

            {/* Cloud Account & Realtime Sync */}
            <View style={[styles.settingBlock, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  ☁️ {isTamil ? 'கிளவுட் கணக்கு & நிகழ்நேர ஒத்திசைவு' : 'Account & Realtime Cloud Sync'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: user ? theme.success : theme.textMuted }} />
                  <Text style={{ fontSize: 10, fontWeight: '700', color: user ? theme.success : theme.textMuted }}>
                    {user ? (isTamil ? 'நிகழ்நேரம் இயங்குகிறது' : 'Realtime Active') : (isTamil ? 'இணைக்கப்படவில்லை' : 'Not Connected')}
                  </Text>
                </View>
              </View>

              {user ? (
                <View style={{ gap: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, backgroundColor: theme.cardAlt, borderRadius: borderRadius.md }}>
                    <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: user.avatarColor || theme.primary, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#000', fontWeight: '900', fontSize: 14 }}>{user.displayName.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: theme.text }}>{user.displayName}</Text>
                      <Text style={{ fontSize: 11, color: theme.textMuted }}>{user.email}</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      style={[styles.accountActionBtn, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, borderWidth: 1 }]}
                      onPress={() => setShowAccountDetailsModal(true)}
                    >
                      <Shield size={14} color={theme.primary} />
                      <Text style={[styles.accountActionBtnText, { color: theme.text }]}>
                        {isTamil ? 'கணக்கு விவரங்கள்' : 'Account Details'}
                      </Text>
                      <ChevronRight size={13} color={theme.textMuted} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.accountActionBtn, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, borderWidth: 1 }]}
                      onPress={() => setShowAuthModal(true)}
                    >
                      <User size={14} color={theme.text} />
                      <Text style={[styles.accountActionBtnText, { color: theme.text }]}>
                        {isTamil ? 'மாற்று' : 'Switch'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.backupBtn, { backgroundColor: theme.primary, width: '100%' }]}
                  onPress={() => setShowAuthModal(true)}
                >
                  <Text style={styles.backupBtnText}>
                    {isTamil ? 'Google / மின்னஞ்சல் மூலம் உள்நுழைக' : 'Sign In with Google / Email'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* 1-Click Emergency Data Restore */}
            <View style={[styles.settingBlock, { backgroundColor: theme.card, borderColor: '#10B981', borderWidth: 1.5 }, theme.cardShadow]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Shield size={16} color="#10B981" />
                  <Text style={[styles.settingLabel, { color: theme.text, fontWeight: '700' }]}>
                    {isTamil ? '1-கிளிக் முழு தரவு மீட்டெடுப்பு' : '1-Click Cloud & Local Data Restore'}
                  </Text>
                </View>
                <Text style={{ fontSize: 10, color: '#10B981', fontWeight: '800', textTransform: 'uppercase' }}>
                  {isTamil ? 'பாதுகாப்பானது' : 'Always Safe'}
                </Text>
              </View>
              <Text style={{ fontSize: 11, color: theme.textMuted, marginBottom: 12 }}>
                {isTamil
                  ? 'உங்கள் ஜெபங்கள், வரவு செலவுகள், பழக்கங்கள் மற்றும் வேதாகம வாசிப்பு பதிவுகள் எதுவும் எப்போதும் அழியாது. 1-கிளிக்கில் கிளவுட் மற்றும் உள்ளூர் சேமிப்பகத்திலிருந்து மீட்டெடுக்கவும்.'
                  : 'Your data is permanently protected. Tap below to instantly refresh and restore all your prayers, transactions, habits, and Bible progress from cloud and local backups.'}
              </Text>
              <TouchableOpacity
                style={[styles.backupBtn, { backgroundColor: '#10B981', width: '100%' }]}
                onPress={handleRestoreUserData}
                disabled={restoring}
              >
                <Shield size={15} color="#000" />
                <Text style={[styles.backupBtnText, { color: '#000', fontWeight: '800' }]}>
                  {restoring
                    ? isTamil
                      ? 'மீட்டெடுக்கப்படுகிறது...'
                      : 'Restoring Data...'
                    : isTamil
                    ? '🔄 எனது அனைத்து தரவையும் மீட்டெடு'
                    : '🔄 Restore All My Data Now'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Offline JSON Backup */}
            <View style={[styles.settingBlock, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  🔒 {isTamil ? 'ஆஃப்லைன் காப்புப்பிரதி (JSON)' : 'Offline Backup (JSON)'}
                </Text>
                <Text style={{ fontSize: 10.5, color: theme.primary, fontWeight: '700' }}>
                  {isTamil ? 'பதிவிறக்கம் / பதிவேற்றம்' : 'Export / Import File'}
                </Text>
              </View>
              <Text style={{ fontSize: 11, color: theme.textMuted, marginBottom: 10 }}>
                {isTamil
                  ? 'உங்கள் அனைத்து ஜெபங்கள், வரவு செலவு, பழக்கங்கள் மற்றும் சக்கரங்களை JSON கோப்பாக பாதுகாப்பாக சேமிக்கவும்.'
                  : 'Download or upload your complete prayers, transactions, habits, and decision wheels as a JSON backup file.'}
              </Text>
              <View style={styles.backupBtnsRow}>
                <TouchableOpacity
                  style={[styles.backupBtn, { backgroundColor: theme.primary }]}
                  onPress={handleExport}
                >
                  <Download size={15} color="#000" />
                  <Text style={styles.backupBtnText}>{isTamil ? 'கோப்பு பதிவிறக்கம்' : 'Download File'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.backupBtn, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, borderWidth: 1 }]}
                  onPress={handleWebFileSelect}
                >
                  <Upload size={15} color={theme.text} />
                  <Text style={[styles.backupBtnText, { color: theme.text }]}>
                    {isTamil ? 'கோப்பு பதிவேற்று' : 'Upload File'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Start Fast Modal with Date Display */}
      <Modal visible={showStartFastModal} animationType="slide" transparent onRequestClose={() => setShowStartFastModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {isTamil ? 'உபவாசம் தொடங்குதல்' : 'Begin Fasting'}
              </Text>
              <TouchableOpacity onPress={() => setShowStartFastModal(false)}>
                <X size={16} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.fastTypeRow}>
              {(['Water', 'Daniel', 'Intermittent', 'FullDay'] as const).map((ft) => (
                <TouchableOpacity
                  key={ft}
                  style={[
                    styles.fastTypeChip,
                    {
                      backgroundColor: fastType === ft ? theme.primary : theme.cardAlt,
                      borderColor: fastType === ft ? theme.primary : theme.cardBorder,
                    },
                  ]}
                  onPress={() => setFastType(ft)}
                >
                  <Text style={[styles.fastTypeChipText, { color: fastType === ft ? '#000' : theme.text }]}>
                    {ft}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Current Date Display */}
            <View style={[styles.startDateIndicator, { backgroundColor: theme.cardAlt }]}>
              <Calendar size={14} color={theme.primary} />
              <Text style={[styles.startDateIndicatorText, { color: theme.textLight }]}>
                {isTamil ? 'தொடங்கும் நாள்:' : 'Start Date:'} {new Date().toLocaleDateString(isTamil ? 'ta-IN' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>

            <TextInput
              style={[styles.textInput, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
              keyboardType="numeric"
              value={fastTargetHours}
              placeholder="Target Hours (e.g., 24)"
              placeholderTextColor={theme.textMuted}
              onChangeText={setFastTargetHours}
            />

            <TextInput
              style={[styles.textInput, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
              placeholder={isTamil ? 'ஜெப நோக்கம்...' : 'Prayer Intention...'}
              placeholderTextColor={theme.textMuted}
              value={fastIntention}
              onChangeText={setFastIntention}
            />

            <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: theme.primary }]} onPress={handleStartFastSubmit}>
              <Check size={16} color="#000" />
              <Text style={styles.confirmBtnText}>{isTamil ? 'தொடங்க' : 'Start Fast'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Sermon Modal */}
      <Modal
        visible={showAddSermonModal}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setShowAddSermonModal(false);
          setEditingSermon(null);
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {editingSermon
                  ? isTamil
                    ? 'பிரசங்கக் குறிப்பை திருத்த'
                    : 'Edit Sermon Note'
                  : isTamil
                  ? 'பிரசங்கக் குறிப்பு'
                  : 'Sermon Note'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddSermonModal(false);
                  setEditingSermon(null);
                }}
              >
                <X size={16} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.textInput, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
              placeholder={isTamil ? 'தலைப்பு *' : 'Title *'}
              placeholderTextColor={theme.textMuted}
              value={sermonTitle}
              onChangeText={setSermonTitle}
            />
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
              placeholder={isTamil ? 'போதகர்' : 'Preacher'}
              placeholderTextColor={theme.textMuted}
              value={sermonPreacher}
              onChangeText={setSermonPreacher}
            />
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
              placeholder={isTamil ? 'வேதப்பகுதி' : 'Passage'}
              placeholderTextColor={theme.textMuted}
              value={sermonPassage}
              onChangeText={setSermonPassage}
            />
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
              placeholder={isTamil ? 'குறிப்புகள்...' : 'Notes...'}
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={4}
              value={sermonNotes}
              onChangeText={setSermonNotes}
            />
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
              placeholder={isTamil ? 'முக்கிய போதனை / Takeaway' : 'Key Takeaway'}
              placeholderTextColor={theme.textMuted}
              value={sermonTakeaway}
              onChangeText={setSermonTakeaway}
            />

            <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: theme.primary }]} onPress={handleAddSermonSubmit}>
              <Check size={16} color="#000" />
              <Text style={styles.confirmBtnText}>
                {editingSermon
                  ? isTamil
                    ? 'மாற்றங்களை சேமிக்க'
                    : 'Update Sermon'
                  : isTamil
                  ? 'சேமிக்க'
                  : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Memory Verse Modal */}
      <Modal
        visible={showAddMemoryModal}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setShowAddMemoryModal(false);
          setEditingMemory(null);
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {editingMemory
                  ? isTamil
                    ? 'மனன வசனத்தை திருத்த'
                    : 'Edit Memory Card'
                  : isTamil
                  ? 'மனன வசனம்'
                  : 'Memory Card'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddMemoryModal(false);
                  setEditingMemory(null);
                }}
              >
                <X size={16} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.textInput, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
              placeholder="Scripture Ref (ENG) e.g., Phil 4:13"
              placeholderTextColor={theme.textMuted}
              value={memRefEn}
              onChangeText={setMemRefEn}
            />
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
              placeholder="வேத குறிப்பு (தமிழ்) எ.கா., பிலிப்பியர் 4:13"
              placeholderTextColor={theme.textMuted}
              value={memRefTa}
              onChangeText={setMemRefTa}
            />
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
              placeholder="Verse Text (English NIV)..."
              placeholderTextColor={theme.textMuted}
              multiline
              value={memTextEn}
              onChangeText={setMemTextEn}
            />
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
              placeholder="வசன வாசகம் (தமிழ் TAOVBSI)..."
              placeholderTextColor={theme.textMuted}
              multiline
              value={memTextTa}
              onChangeText={setMemTextTa}
            />

            <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: theme.primary }]} onPress={handleAddMemorySubmit}>
              <Check size={16} color="#000" />
              <Text style={styles.confirmBtnText}>
                {editingMemory
                  ? isTamil
                    ? 'மாற்றங்களை சேமிக்க'
                    : 'Update Memory'
                  : isTamil
                  ? 'சேமிக்க'
                  : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Backup Modal */}
      <Modal visible={showBackupModal} animationType="slide" transparent onRequestClose={() => setShowBackupModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {isTamil ? 'காப்புப்பிரதி' : 'Backup JSON'}
              </Text>
              <TouchableOpacity onPress={() => setShowBackupModal(false)}>
                <X size={16} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.textArea, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text, minHeight: 160 }]}
              placeholder="Paste JSON backup..."
              placeholderTextColor={theme.textMuted}
              multiline
              value={backupJson}
              onChangeText={setBackupJson}
            />

            <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: theme.primary }]} onPress={handleImport}>
              <Check size={16} color="#000" />
              <Text style={styles.confirmBtnText}>{isTamil ? 'மீட்டமைக்க' : 'Restore'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Decision Wheel Modal */}
      <EditWheelModal
        visible={showEditWheelModal}
        onClose={() => {
          setShowEditWheelModal(false);
          setWheelToEdit(null);
        }}
        wheelToEdit={wheelToEdit}
      />

      {/* Decision History Modal */}
      <DecisionHistoryModal
        visible={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />

      {/* Account Details & Security Modal */}
      <AccountDetailsModal
        visible={showAccountDetailsModal}
        onClose={() => setShowAccountDetailsModal(false)}
        onOpenSwitchAccount={() => setShowAuthModal(true)}
      />

      {/* Auth / Account Switcher Modal */}
      <Modal visible={showAuthModal} animationType="slide" onRequestClose={() => setShowAuthModal(false)}>
        <AuthScreen onClose={() => setShowAuthModal(false)} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  accountActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: borderRadius.md,
  },
  accountActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTabsWrapper: {
    marginVertical: spacing.xs + 2,
  },
  sectionTabsContent: {
    paddingHorizontal: spacing.lg,
    gap: 8,
    alignItems: 'center',
  },
  sectionTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  sectionTabText: {
    fontSize: 12.5,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.hero + 40,
  },
  sectionContainer: {
    gap: spacing.md,
  },
  activeFastBox: {
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
  },
  activeFastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeFastTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  activeFastSub: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  stopFastBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
  },
  stopFastBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  deleteFastMiniBtn: {
    padding: 6,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteFastIconBtn: {
    padding: 4,
    borderRadius: borderRadius.sm,
  },
  fastingDatesCard: {
    marginTop: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: borderRadius.md,
    gap: 6,
  },
  fastDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fastDateLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  fastDateValue: {
    fontSize: 11,
    fontWeight: '800',
  },
  startDateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  startDateIndicatorText: {
    fontSize: 11,
    fontWeight: '700',
  },
  intentionBox: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  intentionLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  intentionText: {
    fontSize: 12,
    marginTop: 1,
  },
  startFastPrompt: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  promptTitle: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  promptDesc: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  startFastActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    marginTop: 6,
  },
  startFastActionText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '800',
  },
  historySection: {
    marginTop: spacing.sm,
    gap: 6,
  },
  subHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  historyCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  historyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  historyType: {
    fontSize: 12,
    fontWeight: '700',
  },
  historyStatus: {
    fontSize: 9,
    fontWeight: '800',
  },
  historyIntention: {
    fontSize: 12,
    marginBottom: 4,
  },
  historyDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyDate: {
    fontSize: 10,
  },
  noItemsText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  addCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: borderRadius.md,
  },
  addCtaBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '800',
  },
  sermonsList: {
    gap: spacing.md,
  },
  sermonCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  sermonHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sermonTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  sermonMeta: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  sermonDate: {
    fontSize: 9,
  },
  sermonBody: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6,
  },
  takeawayBox: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  takeawayHeading: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },
  takeawayItem: {
    fontSize: 11,
    lineHeight: 16,
  },
  memoryGrid: {
    gap: spacing.md,
  },
  memoryCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  memoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  memoryRefTamil: {
    fontSize: 14,
    fontWeight: '800',
  },
  memoryRefEnglish: {
    fontSize: 11,
    fontWeight: '600',
  },
  memoryTextTamil: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 3,
  },
  memoryTextEnglish: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 8,
  },
  toggleMemorizedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  toggleMemorizedText: {
    fontSize: 11,
    fontWeight: '700',
  },
  settingBlock: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  settingRowBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  settingOptionsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  settingChoiceBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: borderRadius.sm,
    backgroundColor: '#1E293B',
    alignItems: 'center',
  },
  settingChoiceText: {
    fontSize: 11,
    fontWeight: '700',
  },
  currPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  currPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  backupBtnsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  backupBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  backupBtnText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '800',
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
    maxHeight: '85%',
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
  fastTypeRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: spacing.md,
  },
  fastTypeChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  fastTypeChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: 12,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: spacing.sm,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 11,
    borderRadius: borderRadius.md,
  },
  confirmBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '800',
  },
});
