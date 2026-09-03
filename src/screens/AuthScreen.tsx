import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { AbideLogo } from '../components/common/AbideLogo';
import { UserProfile } from '../types/auth';
import { Mail, Lock, LogIn, UserPlus, Users, ArrowRight, ShieldCheck, Trash2, X } from 'lucide-react-native';
import { spacing, borderRadius } from '../theme/spacing';

interface AuthScreenProps {
  onSuccess?: () => void;
  onClose?: () => void;
  isMandatory?: boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onClose, isMandatory }) => {
  const { theme, settings, loginUser, savedUsers, switchUser, removeSavedUser, user } = useApp();
  const isTamil = settings.displayLanguage === 'ta';

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', isTamil ? 'மின்னஞ்சல் மற்றும் கடவுச்சொல் தேவை' : 'Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      await loginUser(email.trim(), password.trim(), displayName.trim(), isRegisterMode);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (e: any) {
      console.error('Auth error:', e);
      let msg = e?.message || '';
      const code = e?.code || '';

      if (code === 'auth/invalid-credential' || msg.includes('invalid-credential') || code === 'auth/wrong-password' || msg.includes('wrong-password') || code === 'auth/user-not-found' || msg.includes('user-not-found')) {
        Alert.alert(
          isTamil ? 'உள்நுழைவு தோல்வியடைந்தது' : 'Sign In Failed',
          isTamil
            ? 'தவறான மின்னஞ்சல் அல்லது கடவுச்சொல். புதிய கணக்கு உருவாக்க "கணக்கு உருவாக்கவும்" என்பதை கிளிக் செய்யவும்.'
            : 'Invalid email or password. If this is a new account, please tap "Create Account".'
        );
        return;
      } else if (code === 'auth/email-already-in-use' || msg.includes('email-already-in-use')) {
        Alert.alert(
          isTamil ? 'மின்னஞ்சல் ஏற்கனவே பயன்பாட்டில் உள்ளது' : 'Email Already in Use',
          isTamil
            ? 'இந்த மின்னஞ்சல் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது. உள்நுழைய கடவுச்சொல்லை உள்ளிடவும்.'
            : 'An account with this email already exists. Please sign in with your password.',
          [
            { text: isTamil ? 'சரி' : 'OK', style: 'cancel' },
          ]
        );
        setIsRegisterMode(false);
        return;
      } else if (code === 'auth/weak-password' || msg.includes('weak-password')) {
        Alert.alert(
          isTamil ? 'வலுவற்ற கடவுச்சொல்' : 'Weak Password',
          isTamil ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்.' : 'Password must be at least 6 characters.'
        );
        return;
      }

      Alert.alert(
        isTamil ? 'உள்நுழைவு பிழை' : 'Authentication Error',
        msg || (isTamil ? 'சரிபார்ப்பு தோல்வியடைந்தது.' : 'Authentication failed. Please check your credentials.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSwitch = async (target: UserProfile) => {
    await switchUser(target);
    if (onSuccess) onSuccess();
    if (onClose) onClose();
  };

  const handleRemoveSavedUser = async (targetId: string, name: string) => {
    const confirmMsg = isTamil
      ? `${name} கணக்கை சேமிக்கப்பட்ட பட்டியலிலிருந்து அகற்ற விரும்புகிறீர்களா?`
      : `Remove ${name} from saved accounts?`;

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        await removeSavedUser(targetId);
      }
      return;
    }

    Alert.alert(
      isTamil ? 'கணக்கை அகற்றவா?' : 'Remove Saved Account',
      confirmMsg,
      [
        { text: isTamil ? 'ரத்து' : 'Cancel', style: 'cancel' },
        {
          text: isTamil ? 'அகற்று' : 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeSavedUser(targetId);
          },
        },
      ]
    );
  };

  const handleDismiss = () => {
    if (onClose) {
      onClose();
    } else if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Top Bar */}
      {!isMandatory && (
        <View style={[styles.topCloseBar, { borderBottomColor: theme.cardBorder }]}>
          <Text style={[styles.topBarTitle, { color: theme.textMuted }]}>
            {user ? (isTamil ? 'பயனர் கணக்கு' : 'User Profile') : (isTamil ? 'உள்நுழைக' : 'Sign In')}
          </Text>
          <TouchableOpacity
            style={[styles.closePillBtn, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}
            onPress={handleDismiss}
            activeOpacity={0.7}
          >
            <X size={16} color={theme.text} />
            <Text style={[styles.closePillText, { color: theme.text }]}>
              {isTamil ? 'மூடு' : 'Close'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={[styles.scrollContent, isMandatory && { paddingTop: Platform.OS === 'web' ? spacing.xl * 2 : spacing.hero }]} showsVerticalScrollIndicator={false}>
        {/* Abide+ Pure Text Header without Icon Box */}
        <View style={styles.logoHeader}>
          <AbideLogo fontSize={42} />
          <Text style={[styles.tagline, { color: theme.textMuted }]}>
            {isTamil
              ? 'கிறிஸ்தவ ஆவிக்குரிய & காரியஸ்த தோழன்'
              : 'Christian Spiritual & Stewardship Companion'}
          </Text>
        </View>

        {/* Main Auth Card */}
        <View style={[styles.authCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.authTitle, { color: theme.text }]}>
            {isRegisterMode
              ? isTamil
                ? 'புதிய கணக்கை உருவாக்கவும்'
                : 'Create Abide+ Account'
              : isTamil
              ? 'மின்னஞ்சல் மூலம் உள்நுழைக'
              : 'Sign in to Abide+'}
          </Text>

          {isRegisterMode && (
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
                {isTamil ? 'பெயர்' : 'Your Name'}
              </Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
                placeholder={isTamil ? 'எ.கா. டேவிட்' : 'e.g. David Solomon'}
                placeholderTextColor={theme.textMuted}
                value={displayName}
                onChangeText={setDisplayName}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
              {isTamil ? 'மின்னஞ்சல் முகவரி' : 'Email Address'}
            </Text>
            <View style={[styles.inputFieldWithIcon, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}>
              <Mail size={16} color={theme.textMuted} />
              <TextInput
                style={[styles.inputInner, { color: theme.text }]}
                placeholder="servant@abide.plus"
                placeholderTextColor={theme.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
              {isTamil ? 'கடவுச்சொல்' : 'Password'}
            </Text>
            <View style={[styles.inputFieldWithIcon, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}>
              <Lock size={16} color={theme.textMuted} />
              <TextInput
                style={[styles.inputInner, { color: theme.text }]}
                placeholder="••••••••"
                placeholderTextColor={theme.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitAuthBtn, { backgroundColor: theme.primary }]}
            onPress={handleAuthSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : isRegisterMode ? (
              <UserPlus size={16} color="#000" />
            ) : (
              <LogIn size={16} color="#000" />
            )}
            <Text style={styles.submitAuthBtnText}>
              {loading
                ? isTamil
                  ? 'காத்திருக்கவும்...'
                  : 'Please wait...'
                : isRegisterMode
                ? isTamil
                  ? 'கணக்கு உருவாக்கவும்'
                  : 'Create Account'
                : isTamil
                ? 'உள்நுழைக'
                : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Mode Switcher */}
          <TouchableOpacity
            style={styles.switchModeRow}
            onPress={() => setIsRegisterMode(!isRegisterMode)}
          >
            <Text style={[styles.switchModeText, { color: theme.textMuted }]}>
              {isRegisterMode
                ? isTamil
                  ? 'ஏற்கனவே கணக்கு உள்ளதா? '
                  : 'Already have an account? '
                : isTamil
                ? 'புதிய பயனரா? '
                : "Don't have an account? "}
              <Text style={{ color: theme.primary, fontWeight: '700' }}>
                {isRegisterMode
                  ? isTamil
                    ? 'உள்நுழைக'
                    : 'Sign In'
                  : isTamil
                  ? 'பதிவு செய்க'
                  : 'Create Account'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Saved User Accounts with Quick-Switch & Remove */}
        {savedUsers.length > 0 && (
          <View style={styles.savedUsersSection}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Users size={14} color={theme.primary} />
              <Text style={[styles.savedUsersTitle, { color: theme.text }]}>
                {isTamil ? 'சேமிக்கப்பட்ட பயனர்கள் (விரைவு உள்நுழைவு):' : 'Saved Accounts (Quick Login):'}
              </Text>
            </View>

            <View style={styles.usersList}>
              {savedUsers.map((u) => {
                const isActive = user?.id === u.id;
                return (
                  <View
                    key={u.id}
                    style={[
                      styles.userCardPill,
                      {
                        backgroundColor: isActive ? theme.primary + '20' : theme.card,
                        borderColor: isActive ? theme.primary : theme.cardBorder,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 }}
                      onPress={() => handleQuickSwitch(u)}
                    >
                      <View
                        style={[
                          styles.avatarCircle,
                          { backgroundColor: u.avatarColor || theme.primary },
                        ]}
                      >
                        {u.photoURL ? (
                          <Image source={{ uri: u.photoURL }} style={styles.avatarImage} />
                        ) : (
                          <Text style={styles.avatarInitial}>{u.displayName.charAt(0).toUpperCase()}</Text>
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.userDisplayName, { color: theme.text }]}>{u.displayName}</Text>
                        <Text style={[styles.userEmail, { color: theme.textMuted }]}>{u.email}</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.removeUserBtn}
                      onPress={() => handleRemoveSavedUser(u.id, u.displayName)}
                    >
                      <Trash2 size={14} color={theme.textMuted} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Bottom Back to Dashboard Button (only if not mandatory) */}
        {!isMandatory && (
          <TouchableOpacity
            style={[styles.bottomCloseBtn, { borderColor: theme.cardBorder, backgroundColor: theme.cardAlt }]}
            onPress={handleDismiss}
          >
            <Text style={[styles.bottomCloseText, { color: theme.text }]}>
              ← {isTamil ? 'முகப்புக்கு திரும்பு' : 'Back to Dashboard'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topCloseBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'web' ? spacing.md : spacing.xl,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  topBarTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  closePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  closePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bottomCloseBtn: {
    marginTop: spacing.xl,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  bottomCloseText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  logoHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    width: '100%',
    maxWidth: 420,
  },
  tagline: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  authCard: {
    width: '100%',
    maxWidth: 420,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  authTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 5,
  },
  inputField: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 13,
  },
  inputFieldWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    gap: 8,
  },
  inputInner: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
  },
  submitAuthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  submitAuthBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
  },
  switchModeRow: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: 12,
  },
  savedUsersSection: {
    width: '100%',
    marginTop: spacing.sm,
  },
  savedUsersTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  usersList: {
    gap: 8,
  },
  userCardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarInitial: {
    color: '#000',
    fontSize: 14,
    fontWeight: '900',
  },
  userDisplayName: {
    fontSize: 13,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 11,
  },
  removeUserBtn: {
    padding: 6,
    borderRadius: 6,
  },
});
