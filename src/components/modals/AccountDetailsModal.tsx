import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types/auth';
import {
  User,
  Mail,
  Shield,
  Cloud,
  Trash2,
  X,
  Users,
  AlertTriangle,
  LogOut,
  Calendar,
} from 'lucide-react-native';
import { spacing, borderRadius } from '../../theme/spacing';

interface AccountDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenSwitchAccount: () => void;
}

export const AccountDetailsModal: React.FC<AccountDetailsModalProps> = ({
  visible,
  onClose,
  onOpenSwitchAccount,
}) => {
  const {
    theme,
    settings,
    user,
    logoutUser,
    deleteAccount,
    prayers,
    transactions,
    habits,
    todos,
    sermons,
    decisionWheels,
  } = useApp();

  const isTamil = settings.displayLanguage === 'ta';
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!user) return null;

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(isTamil ? 'ta-IN' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Active';

  const handleDeleteAccountFinal = async () => {
    const confirmMsg = isTamil
      ? 'கணக்கை நிரந்தரமாக நீக்கினால் உங்கள் அனைத்து கிளவுட் மற்றும் உள்ளூர் தகவல்களும் அழிக்கப்படும். தொடரவா?'
      : 'Permanently deleting your account will wipe all cloud and local prayers, transactions, habits, and notes. This cannot be undone. Proceed?';

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        await deleteAccount();
        onClose();
      }
      return;
    }

    Alert.alert(
      isTamil ? 'கணக்கை நிரந்தரமாக நீக்குக' : 'Permanent Account Deletion',
      confirmMsg,
      [
        { text: isTamil ? 'ரத்து' : 'Cancel', style: 'cancel' },
        {
          text: isTamil ? 'ஆம், நீக்குக' : 'Yes, Delete My Account',
          style: 'destructive',
          onPress: async () => {
            await deleteAccount();
            onClose();
          },
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
              <Shield size={20} color={theme.primary} />
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {isTamil ? 'கணக்கு விவரங்கள் & பாதுகாப்பு' : 'Account Details & Security'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.cardAlt }]}>
              <X size={18} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* User Profile Card */}
            <View style={[styles.profileCard, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}>
              <View
                style={[
                  styles.avatarLarge,
                  { backgroundColor: user.avatarColor || theme.primary },
                ]}
              >
                {user.photoURL ? (
                  <Image source={{ uri: user.photoURL }} style={styles.avatarLargeImage} />
                ) : (
                  <Text style={styles.avatarLargeText}>
                    {user.displayName.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.profileName, { color: theme.text }]}>
                  {user.displayName}
                </Text>
                <View style={styles.profileEmailRow}>
                  <Mail size={12} color={theme.textMuted} />
                  <Text style={[styles.profileEmail, { color: theme.textMuted }]}>
                    {user.email}
                  </Text>
                </View>
                <View style={styles.profileJoinedRow}>
                  <Calendar size={12} color={theme.primary} />
                  <Text style={[styles.profileJoined, { color: theme.primary }]}>
                    {isTamil ? 'இணைந்த நாள்:' : 'Joined:'} {joinDate}
                  </Text>
                </View>
              </View>
            </View>

            {/* Cloud Sync Status */}
            <View style={[styles.statRowBlock, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}>
              <View style={styles.statRowLeft}>
                <Cloud size={16} color={theme.success} />
                <Text style={[styles.statLabel, { color: theme.text }]}>
                  {isTamil ? 'கிளவுட் ஒத்திசைவு நிலை' : 'Cloud Sync Status'}
                </Text>
              </View>
              <View style={[styles.syncStatusPill, { backgroundColor: theme.success + '20' }]}>
                <View style={[styles.greenDot, { backgroundColor: theme.success }]} />
                <Text style={[styles.syncStatusText, { color: theme.success }]}>
                  {isTamil ? 'இணைக்கப்பட்டுள்ளது' : 'Realtime Active'}
                </Text>
              </View>
            </View>

            {/* Synchronized Data Summary */}
            <View style={[styles.dataSummaryCard, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}>
              <Text style={[styles.summaryTitle, { color: theme.textMuted }]}>
                📊 {isTamil ? 'ஒத்திசைக்கப்பட்ட தரவு சுருக்கம்' : 'Synced Application Data'}
              </Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryNum, { color: theme.primary }]}>{prayers.length}</Text>
                  <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>{isTamil ? 'ஜெபங்கள்' : 'Prayers'}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryNum, { color: theme.incomeColor }]}>{transactions.length}</Text>
                  <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>{isTamil ? 'பரிவர்த்தனை' : 'Finances'}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryNum, { color: '#8B5CF6' }]}>{habits.length}</Text>
                  <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>{isTamil ? 'பழக்கங்கள்' : 'Habits'}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryNum, { color: theme.taskColor }]}>{todos.length}</Text>
                  <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>{isTamil ? 'பணிகள்' : 'Tasks'}</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons: Switch Account / Sign Out */}
            <View style={{ gap: 8, marginTop: spacing.xs }}>
              <TouchableOpacity
                style={[styles.accountBtn, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, borderWidth: 1 }]}
                onPress={() => {
                  onClose();
                  onOpenSwitchAccount();
                }}
              >
                <Users size={16} color={theme.text} />
                <Text style={[styles.accountBtnText, { color: theme.text }]}>
                  {isTamil ? 'வேறு கணக்கிற்கு மாறுக' : 'Switch / Add Another Account'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.accountBtn, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, borderWidth: 1 }]}
                onPress={async () => {
                  await logoutUser();
                  onClose();
                }}
              >
                <LogOut size={16} color={theme.warning} />
                <Text style={[styles.accountBtnText, { color: theme.warning }]}>
                  {isTamil ? 'வெளியேறுக (Log Out)' : 'Log Out of this Device'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* DANGER ZONE: Collapsible Delete Account Safeguard */}
            <View style={[styles.dangerZoneCard, { backgroundColor: '#EA433510', borderColor: '#EA433540' }]}>
              <View style={styles.dangerHeaderRow}>
                <AlertTriangle size={16} color="#EA4335" />
                <Text style={styles.dangerHeaderTitle}>
                  {isTamil ? 'ஆபத்து மண்டலம் • கணக்கை நீக்குதல்' : 'Danger Zone • Delete Account'}
                </Text>
              </View>
              <Text style={[styles.dangerDesc, { color: theme.textMuted }]}>
                {isTamil
                  ? 'தற்செயலாக நீக்கப்படுவதைத் தவிர்க்க, இங்கே கிளிக் செய்து உறுதிப்படுத்திய பின்னரே கணக்கு அழிக்கப்படும்.'
                  : 'To protect against accidental taps, deletion requires explicit verification. All local and cloud records will be wiped.'}
              </Text>

              <TouchableOpacity
                style={styles.deleteAccountSecureBtn}
                onPress={handleDeleteAccountFinal}
              >
                <Trash2 size={15} color="#FFF" />
                <Text style={styles.deleteAccountSecureBtnText}>
                  {isTamil ? 'கணக்கை நிரந்தரமாக நீக்குக' : 'Permanently Delete Account'}
                </Text>
              </TouchableOpacity>
            </View>
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
    maxHeight: '90%',
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
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
    gap: 12,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  avatarLarge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarLargeImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarLargeText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 22,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
  },
  profileEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  profileEmail: {
    fontSize: 12,
  },
  profileJoinedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  profileJoined: {
    fontSize: 11,
    fontWeight: '700',
  },
  statRowBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  statRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  syncStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  syncStatusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  dataSummaryCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 4,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNum: {
    fontSize: 16,
    fontWeight: '900',
  },
  summaryLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 1,
  },
  accountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: borderRadius.md,
  },
  accountBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  dangerZoneCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: 8,
    marginTop: spacing.xs,
  },
  dangerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dangerHeaderTitle: {
    color: '#EA4335',
    fontSize: 13,
    fontWeight: '800',
  },
  dangerDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  deleteAccountSecureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EA4335',
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    marginTop: 4,
  },
  deleteAccountSecureBtnText: {
    color: '#FFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
});
