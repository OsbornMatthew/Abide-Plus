import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { X, Play, Pause, RotateCcw, Volume2, Sparkles, Heart } from 'lucide-react-native';
import { spacing, borderRadius } from '../../theme/spacing';

interface PrayerTimerModalProps {
  visible: boolean;
  onClose: () => void;
}

const PRAYER_PROMPTS = [
  {
    en: 'Be still, and know that I am God. (Psalm 46:10)',
    ta: 'அமர்ந்திருந்து, நானே தேவனென்று அறிந்துகொள்ளுங்கள். (சங்கீதம் 46:10)',
  },
  {
    en: 'The LORD is near to all who call on him, to all who call on him in truth. (Psalm 145:18)',
    ta: 'தம்மை நோக்கிக் கூப்பிடுகிற யாவருக்கும், உண்மையாய் தம்மை நோக்கிக் கூப்பிடுகிற யாவருக்கும் கர்த்தர் சமீபமாயிருக்கிறார். (சங்கீதம் 145:18)',
  },
  {
    en: 'Come to me, all you who are weary and burdened, and I will give you rest. (Matthew 11:28)',
    ta: 'வருத்தப்பட்டுப் பாரஞ்சுமக்கிறவர்களே! நீங்கள் எல்லாரும் என்னிடத்தில் வாருங்கள்; நான் உங்களுக்கு இளைப்பாறுதல் தருவேன். (மத்தேயு 11:28)',
  },
  {
    en: 'Call to me and I will answer you and tell you great and unsearchable things you do not know. (Jeremiah 33:3)',
    ta: 'என்னை நோக்கிக் கூப்பிடு, அப்பொழுது நான் உனக்கு உத்தரவு கொடுத்து, நீ அறியாததும் உனக்கு எட்டாததுமான பெரிய காரியங்களை உனக்கு அறிவிப்பேன். (எரேமியா 33:3)',
  },
];

export const PrayerTimerModal: React.FC<PrayerTimerModalProps> = ({ visible, onClose }) => {
  const { theme, settings } = useApp();
  const isTamil = settings.displayLanguage === 'ta';

  const [selectedMinutes, setSelectedMinutes] = useState(10);
  const [secondsLeft, setSecondsLeft] = useState(10 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);

  useEffect(() => {
    if (visible) {
      setSecondsLeft(selectedMinutes * 60);
      setIsRunning(false);
    }
  }, [visible, selectedMinutes]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  // Rotate scripture prompts every 30s
  useEffect(() => {
    if (!isRunning) return;
    const pInterval = setInterval(() => {
      setPromptIndex((prev) => (prev + 1) % PRAYER_PROMPTS.length);
    }, 25000);
    return () => clearInterval(pInterval);
  }, [isRunning]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(selectedMinutes * 60);
  };

  const currentPrompt = PRAYER_PROMPTS[promptIndex];

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Sparkles size={18} color={theme.primary} />
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              {isTamil ? 'அமைதியான தனி ஜெப நேரம்' : 'Quiet Time & Prayer Sanctuary'}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.card }]}>
            <X size={20} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Minutes Selector */}
        {!isRunning && secondsLeft === selectedMinutes * 60 && (
          <View style={styles.durationSelector}>
            {[5, 10, 15, 30].map((mins) => {
              const isSelected = selectedMinutes === mins;
              return (
                <TouchableOpacity
                  key={mins}
                  style={[
                    styles.durationChip,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.card,
                      borderColor: isSelected ? theme.primary : theme.cardBorder,
                    },
                  ]}
                  onPress={() => setSelectedMinutes(mins)}
                >
                  <Text style={[styles.durationChipText, { color: isSelected ? '#000' : theme.text }]}>
                    {mins} {isTamil ? 'நிமி' : 'min'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Center Timer Display */}
        <View style={styles.centerSection}>
          <View
            style={[
              styles.timerRing,
              {
                borderColor: isRunning ? theme.primary : theme.cardBorder,
                backgroundColor: theme.card,
                shadowColor: theme.primary,
                shadowOpacity: isRunning ? 0.35 : 0.05,
                shadowRadius: 20,
              },
            ]}
          >
            <Text style={[styles.timeDigits, { color: theme.text }]}>{formatTime(secondsLeft)}</Text>
            <Text style={[styles.timerStatus, { color: isRunning ? theme.primary : theme.textMuted }]}>
              {isRunning
                ? isTamil
                  ? 'தேவ சமூகத்தில் காத்திருத்தல்...'
                  : 'Abiding in His Presence...'
                : secondsLeft === 0
                ? isTamil
                  ? 'ஜெபம் நிறைவுற்றது! ஆமென்.'
                  : 'Amen! Prayer Completed.'
                : isTamil
                ? 'தொடங்கத் தயாராக உள்ளது'
                : 'Ready for Prayer'}
            </Text>
          </View>

          {/* Scripture Encouragement Box */}
          <View style={[styles.promptCard, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}>
            <Heart size={18} color={theme.primary} style={{ alignSelf: 'center', marginBottom: 8 }} />
            <Text style={[styles.promptText, { color: theme.text }]}>
              {isTamil ? currentPrompt.ta : currentPrompt.en}
            </Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlBtnSecondary, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            onPress={handleReset}
          >
            <RotateCcw size={22} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.playBtn,
              {
                backgroundColor: theme.primary,
                shadowColor: theme.primary,
                shadowOpacity: 0.4,
                shadowRadius: 10,
              },
            ]}
            onPress={() => setIsRunning(!isRunning)}
          >
            {isRunning ? <Pause size={30} color="#000" /> : <Play size={30} color="#000" style={{ marginLeft: 4 }} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtnSecondary, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            onPress={() => setPromptIndex((prev) => (prev + 1) % PRAYER_PROMPTS.length)}
          >
            <Sparkles size={22} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: spacing.md,
  },
  durationChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  durationChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  timerRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  timeDigits: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
  },
  timerStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  promptCard: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    maxWidth: '90%',
    alignItems: 'center',
  },
  promptText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    paddingBottom: spacing.xxl,
  },
  controlBtnSecondary: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
});
