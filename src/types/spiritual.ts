export type BibleTranslation = 'NIV' | 'TAOVBSI';

export interface BibleBook {
  id: string;
  order: number;
  nameEn: string;
  nameTa: string;
  shortEn: string;
  shortTa: string;
  testament: 'OT' | 'NT';
  totalChapters: number;
  readChapters: number[];
}

export interface VerseOfTheDay {
  id: string;
  referenceEn: string;
  referenceTa: string;
  textEn: string;
  textTa: string;
  reflectionEn: string;
  reflectionTa: string;
  theme: string;
  themeTa: string;
  category: 'Faith' | 'Peace' | 'Provision' | 'Strength' | 'Wisdom' | 'Grace' | 'Love';
}

export interface BibleChapterVerse {
  chapter: number;
  verse: number;
  textEn: string;
  textTa: string;
}

export interface VerseNote {
  id: string;
  bookId: string;
  chapter: number;
  verse?: number;
  verseRefEn: string; // e.g. "Genesis 1:1" or "Genesis 1:30"
  verseRefTa?: string; // e.g. "ஆதியாகமம் 1:1"
  verseText?: string; // Scripture verse text manually entered by user
  noteText: string; // Study note or reflection
  colorHighlight?: string; // e.g. '#F59E0B', '#10B981', '#38BDF8', '#8B5CF6', '#EC4899'
  createdAt: string;
  updatedAt: string;
}

export interface ReadingPlan {
  id: string;
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  daysTotal: number;
  currentDay: number;
  completedDays: number[];
  category: 'Beginner' | 'DeepStudy' | 'Wisdom' | 'Gospels' | 'Annual';
  dailyReadings: {
    day: number;
    passageEn: string;
    passageTa: string;
    focusVerseEn?: string;
    focusVerseTa?: string;
  }[];
}

export type PrayerCategory =
  | 'Adoration'
  | 'Confession'
  | 'Thanksgiving'
  | 'Supplication'
  | 'Family'
  | 'Healing'
  | 'Ministry'
  | 'Salvation'
  | 'Financial'
  | 'Spiritual Growth';

export type PrayerStatus = 'active' | 'answered';

export interface PrayerItem {
  id: string;
  title: string;
  details: string;
  category: PrayerCategory;
  status: PrayerStatus;
  createdAt: string;
  updatedAt: string;
  answeredDate?: string;
  testimony?: string;
  linkedVerse?: string;
  priority?: 'High' | 'Normal' | 'Urgent';
}

export type FastType = 'Water' | 'Daniel' | 'Intermittent' | 'FullDay' | 'Custom';

export interface FastingRecord {
  id: string;
  fastType: FastType;
  targetHours: number;
  startTime: string; // ISO string
  endTime?: string;
  status: 'active' | 'completed' | 'cancelled';
  prayerIntention: string;
  notes?: string;
}

export interface SermonNote {
  id: string;
  date: string;
  title: string;
  preacher: string;
  churchName?: string;
  scripturePassage: string;
  scripturePassageTa?: string;
  notes: string;
  keyTakeaways: string[];
  actionItems: string[];
}

export interface ScriptureMemoryCard {
  id: string;
  verseRefEn: string;
  verseRefTa: string;
  textEn: string;
  textTa: string;
  isMemorized: boolean;
  reviewStreak: number;
  lastReviewedDate?: string;
}
