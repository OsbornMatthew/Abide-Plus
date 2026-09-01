import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { History, Trash2, X, Calendar, Clock, Sparkles } from 'lucide-react-native';
import { spacing, borderRadius } from '../../theme/spacing';

interface DecisionHistoryModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DecisionHistoryModal: React.FC<DecisionHistoryModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme, settings, decisionResults, clearDecisionHistory } = useApp();
  const isTamil = settings.displayLanguage === 'ta';

  const handleClear = () => {
    const confirmMsg = isTamil
      ? 'அனைத்து முடிவுகளின் வரலாற்றையும் அழிக்க விரும்புகிறீர்களா?'
      : 'Clear all decision history records?';

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        clearDecisionHistory();
      }
      return;
    }

    Alert.alert(
      isTamil ? 'வரலாற்றை அழிக்கவா?' : 'Clear History',
      confirmMsg,
      [
        { text: isTamil ? 'ரத்து' : 'Cancel', style: 'cancel' },
        {
          text: isTamil ? 'அழி' : 'Clear All',
          style: 'destructive',
          onPress: clearDecisionHistory,
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropDismiss} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}>
          {/* Sheet Handle */}
          <View style={styles.sheetHandleBar}>
            <View style={[styles.sheetHandle, { backgroundColor: theme.textMuted + '35' }]} />
          </View>

          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <History size={20} color={theme.primary} />
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {isTamil ? 'தீர்மானங்களின் வரலாறு' : 'Decision History'} ({decisionResults.length})
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {decisionResults.length > 0 && (
                <TouchableOpacity
                  onPress={handleClear}
                  style={[styles.clearBtn, { backgroundColor: theme.danger + '18' }]}
                >
                  <Trash2 size={13} color={theme.danger} />
                  <Text style={[styles.clearBtnText, { color: theme.danger }]}>
                    {isTamil ? 'அனைத்தையும் அழி' : 'Clear'}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.cardAlt }]}>
                <X size={18} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {decisionResults.length > 0 ? (
              decisionResults.map((item) => {
                const dateObj = new Date(item.timestamp);
                const formattedDate = dateObj.toLocaleDateString(isTamil ? 'ta-IN' : 'en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <View
                    key={item.id}
                    style={[styles.historyItemCard, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}
                  >
                    <View style={styles.historyTopRow}>
                      <Text style={[styles.wheelNameText, { color: theme.primary }]}>
                        🎯 {item.wheelTitle}
                      </Text>
                      <View style={styles.timeBadge}>
                        <Clock size={11} color={theme.textMuted} />
                        <Text style={[styles.timeText, { color: theme.textMuted }]}>
                          {formattedDate} • {formattedTime}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.resultChip, { backgroundColor: (item.optionColor || theme.primary) + '22', borderColor: item.optionColor || theme.primary }]}>
                      <Sparkles size={13} color={item.optionColor || theme.primary} />
                      <Text style={[styles.resultText, { color: theme.text }]}>
                        {item.selectedOption}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <History size={36} color={theme.textMuted + '60'} />
                <Text style={[styles.emptyStateText, { color: theme.textMuted }]}>
                  {isTamil
                    ? 'முடிவுகள் வரலாறு எதுவும் இல்லை. சக்கரத்தை சுழற்றி உங்கள் முதல் முடிவை எடுங்கள்!'
                    : 'No decision history yet. Spin the wheel to record your decisions!'}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backdropDismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: '100%',
    maxWidth: 540,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '85%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? 36 : spacing.lg,
  },
  sheetHandleBar: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
    gap: 8,
  },
  historyItemCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: 6,
  },
  historyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wheelNameText: {
    fontSize: 12,
    fontWeight: '800',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 10.5,
  },
  resultChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  resultText: {
    fontSize: 13,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: 10,
  },
  emptyStateText: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    lineHeight: 18,
  },
});
