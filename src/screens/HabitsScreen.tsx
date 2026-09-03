import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import { Header } from '../components/common/Header';
import { HabitTrackerSection } from '../components/habits/HabitTrackerSection';
import { spacing } from '../theme/spacing';

export const HabitsScreen: React.FC = React.memo(() => {
  const { theme, settings } = useApp();
  const isTamil = settings.displayLanguage === 'ta';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title={isTamil ? 'ஆவிக்குரிய பழக்கங்கள்' : 'Spiritual Habits'}
        subtitle={
          isTamil
            ? 'அன்றாட ஆவிக்குரிய ஒழுக்கங்கள் & நிலைத்தன்மை'
            : 'Daily Disciplines & Consistency Tracker'
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <HabitTrackerSection />
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.hero + 40,
  },
});
