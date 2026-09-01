import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import { useApp } from '../../context/AppContext';
import { AbideLogo } from './AbideLogo';
import { AuthScreen } from '../../screens/AuthScreen';
import { Moon, Sun, Globe, User } from 'lucide-react-native';
import { spacing, borderRadius } from '../../theme/spacing';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showLanguageToggle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showLanguageToggle = true,
}) => {
  const { theme, settings, toggleTheme, toggleLanguage, user } = useApp();
  const isTamil = settings.displayLanguage === 'ta';
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: theme.background, borderBottomColor: theme.cardBorder }]}>
      <View style={styles.leftCol}>
        {/* Exact Abide+ Logo with vibrant rainbow + without emoji */}
        <AbideLogo fontSize={21} showIconImage={false} />
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>
        ) : (
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            {isTamil ? 'ஆவிக்குரிய & காரியஸ்த தோழன்' : 'Spiritual & Stewardship Companion'}
          </Text>
        )}
      </View>

      <View style={styles.rightActions}>
        {/* Language switch */}
        {showLanguageToggle && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            onPress={toggleLanguage}
            activeOpacity={0.7}
          >
            <Globe size={13} color={theme.primary} />
            <Text style={[styles.btnText, { color: theme.primary }]}>
              {isTamil ? 'தமிழ்' : 'ENG'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Theme switch */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          {settings.isDarkMode ? (
            <Sun size={14} color={theme.primaryLight} />
          ) : (
            <Moon size={14} color={theme.primaryDark} />
          )}
        </TouchableOpacity>

        {/* User Account / Profile */}
        <TouchableOpacity
          style={[
            styles.userAvatarBtn,
            {
              backgroundColor: user?.avatarColor || theme.primary,
            },
          ]}
          onPress={() => setShowAuthModal(true)}
          activeOpacity={0.7}
        >
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
          ) : user ? (
            <Text style={styles.userInitial}>{user.displayName.charAt(0).toUpperCase()}</Text>
          ) : (
            <User size={14} color="#000" />
          )}
        </TouchableOpacity>
      </View>

      {/* Auth / Account Switcher Modal */}
      <Modal visible={showAuthModal} animationType="slide" onRequestClose={() => setShowAuthModal(false)}>
        <AuthScreen onClose={() => setShowAuthModal(false)} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  leftCol: {
    flex: 1,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  btnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  userAvatarBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  userInitial: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
  },
});
