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

export const DEFAULT_HABITS: Habit[] = [
  {
    id: 'habit-morning-prayer',
    title: 'Morning Prayer & Devotion',
    titleTa: 'காலை ஜெபம் & தியானம்',
    category: 'Spiritual',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    icon: 'Flame',
    color: '#F59E0B',
    completedDates: [],
    currentStreak: 0,
    bestStreak: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-bible-reading',
    title: 'Read 3 Bible Chapters',
    titleTa: '3 அதிகாரங்கள் வாசிப்பு',
    category: 'Spiritual',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    icon: 'BookOpen',
    color: '#10B981',
    completedDates: [],
    currentStreak: 0,
    bestStreak: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-intercession',
    title: 'Intercession for Others',
    titleTa: 'பிறருக்கான பரிந்துரை ஜெபம்',
    category: 'Spiritual',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    icon: 'HeartHandshake',
    color: '#8B5CF6',
    completedDates: [],
    currentStreak: 0,
    bestStreak: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-acts-kindness',
    title: 'Act of Love & Kindness',
    titleTa: 'அன்பின் செயல் / உதவி',
    category: 'Relationships',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    icon: 'Heart',
    color: '#EC4899',
    completedDates: [],
    currentStreak: 0,
    bestStreak: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-gratitude',
    title: 'Gratitude & Praise Reflection',
    titleTa: 'நன்றி செலுத்துதல் & துதித்தல்',
    category: 'Mindset',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    icon: 'Sparkles',
    color: '#06B6D4',
    completedDates: [],
    currentStreak: 0,
    bestStreak: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-stewardship',
    title: 'Stewardship & Giving Review',
    titleTa: 'காரியஸ்த & காணிக்கை மேற்பார்வை',
    category: 'Stewardship',
    frequency: 'weekly',
    targetDaysPerWeek: 1,
    icon: 'Coins',
    color: '#EAB308',
    completedDates: [],
    currentStreak: 0,
    bestStreak: 0,
    createdAt: new Date().toISOString(),
  },
];
