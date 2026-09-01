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
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { AbideLogo } from '../components/common/AbideLogo';
import { UserProfile } from '../types/auth';
import { Mail, Lock, LogIn, UserPlus, Users, ArrowRight, ShieldCheck, Trash2, X } from 'lucide-react-native';
import { spacing, borderRadius } from '../theme/spacing';

interface AuthScreenProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onClose }) => {
  const { theme, settings, loginUser, loginWithGoogle, savedUsers, switchUser, removeSavedUser, user } = useApp();
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
    } catch (e) {
      console.error(e);
      Alert.alert('Authentication', isTamil ? 'உள்நுழைவு முடிந்தது.' : 'Authentication completed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (e: any) {
      console.error(e);
      Alert.alert('Google Sign-In', e?.message || (isTamil ? 'Google உள்நுழைவு தோல்வியடைந்தது.' : 'Google Sign-In was cancelled or failed.'));
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
    Alert.alert(
      isTamil ? 'கணக்கை அகற்றவா?' : 'Remove Saved Account',
      isTamil ? `${name} கணக்கை சேமிக்கப்பட்ட பட்டியலிலிருந்து அகற்ற விரும்புகிறீர்களா?` : `Remove ${name} from saved accounts?`,
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Abide+ Pure Text Header without Icon Box */}
        <View style={styles.logoHeader}>
          <AbideLogo fontSize={38} />
          <Text style={[styles.tagline, { color: theme.textMuted }]}>
            {isTamil
              ? 'கிறிஸ்தவ ஆவிக்குரிய & காரியஸ்த தோழன்'
              : 'Christian Spiritual & Stewardship Companion'}
          </Text>
        </View>

        {/* Main Auth Card */}
        <View style={[styles.authCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          {/* GOOGLE SIGN IN BUTTON */}
          <TouchableOpacity
            style={[styles.googleBtn, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}
            onPress={handleGoogleSignIn}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Svg width={18} height={18} viewBox="0 0 48 48">
              <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </Svg>
            <Text style={[styles.googleBtnText, { color: theme.text }]}>
              {isTamil ? 'Google மூலம் தொடரவும்' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.line, { backgroundColor: theme.cardBorder }]} />
            <Text style={[styles.dividerText, { color: theme.textMuted }]}>
              {isTamil ? 'அல்லது மின்னஞ்சல்' : 'or Email & Password'}
            </Text>
            <View style={[styles.line, { backgroundColor: theme.cardBorder }]} />
          </View>

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
                        <Text style={styles.avatarInitial}>{u.displayName.charAt(0).toUpperCase()}</Text>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.hero + 20,
    paddingBottom: spacing.hero,
    alignItems: 'center',
  },
  logoHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  tagline: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  authCard: {
    width: '100%',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  googleBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: 8,
  },
  line: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '600',
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
