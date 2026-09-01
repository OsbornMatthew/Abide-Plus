export type HabitCategory = 'Spiritual' | 'Health' | 'Mindset' | 'Stewardship' | 'Relationships';
export type HabitFrequency = 'daily' | 'weekly';

export interface Habit {
  id: string;
  title: string;
  titleTa: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetDaysPerWeek: number;
  icon: string;
  color: string;
  completedDates: string[]; // YYYY-MM-DD format
  currentStreak: number;
  bestStreak: number;
  isPrivate?: boolean; // Hide from public dashboard widget
  reminderTime?: string;
  createdAt: string;
}

export const DEFAULT_HABITS: Habit[] = [];
