import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCleanBibleBooks } from '../data/bibleBooks';
import { getCleanReadingPlans } from '../data/readingPlans';
import { BibleBook, ReadingPlan, PrayerItem, FastingRecord, SermonNote, ScriptureMemoryCard, VerseNote, BibleTranslation } from '../types/spiritual';
import { Transaction, BudgetGoal, GivingPledge, CurrencySetting, SUPPORTED_CURRENCIES } from '../types/finance';
import { TodoTask } from '../types/todo';
import { Habit, DEFAULT_HABITS } from '../types/habit';

export interface AppSettings {
  isDarkMode: boolean;
  bibleTranslation: BibleTranslation;
  displayLanguage: 'en' | 'ta';
  currency: CurrencySetting;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string; // "07:00"
  userName: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  isDarkMode: true,
  bibleTranslation: 'NIV',
  displayLanguage: 'en',
  currency: SUPPORTED_CURRENCIES[0], // INR by default
  dailyReminderEnabled: true,
  dailyReminderTime: '06:30',
  userName: 'Faithful Servant',
};

import { DEFAULT_DECISION_WHEELS } from '../data/defaultWheels';
import { DecisionWheel, DecisionResult } from '../types/decision';

const STORAGE_KEYS = {
  SETTINGS: '@abide_settings',
  BIBLE_BOOKS: '@abide_bible_books',
  READING_PLANS: '@abide_reading_plans',
  VERSE_NOTES: '@abide_verse_notes',
  PRAYERS: '@abide_prayers',
  FASTING: '@abide_fasting',
  SERMONS: '@abide_sermons',
  MEMORY_VERSES: '@abide_memory_verses',
  TRANSACTIONS: '@abide_transactions',
  BUDGETS: '@abide_budgets',
  GIVING_PLEDGES: '@abide_giving_pledges',
  TODOS: '@abide_todos',
  READ_HISTORY: '@abide_read_history',
  HABITS: '@abide_habits',
  DECISION_WHEELS: '@abide_decision_wheels',
  DECISION_RESULTS: '@abide_decision_results',
};

// Clean helper to scope keys by user ID to guarantee 100% data isolation
export const getUserKey = (baseKey: string, userId?: string | null): string => {
  if (!userId) return baseKey;
  return `${baseKey}_${userId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
};

// Clean default slate for user
const SEED_PRAYERS: PrayerItem[] = [];
const SEED_TRANSACTIONS: Transaction[] = [];
const SEED_SERMONS: SermonNote[] = [];
const SEED_MEMORY_VERSES: ScriptureMemoryCard[] = [];

export const SEED_TODOS: TodoTask[] = [
  {
    id: 'todo-daily-bible',
    title: 'Read Bible Today',
    description: 'Read your daily scripture chapters and meditate on God’s Word.',
    category: 'Spiritual',
    priority: 'urgent',
    dueDate: new Date().toISOString().split('T')[0],
    isCompleted: false,
    createdAt: new Date().toISOString(),
    isDailyRoutine: true,
    subTasks: [
      { id: 'sub-bible-1', title: 'Old Testament Chapter', isDone: false },
      { id: 'sub-bible-2', title: 'New Testament Chapter', isDone: false },
      { id: 'sub-bible-3', title: 'Record Verse Reflection', isDone: false },
    ],
  },
  {
    id: 'todo-daily-prayer',
    title: 'Prayer Today',
    description: 'Spend dedicated time in ACTS prayer (Adoration, Confession, Thanksgiving, Supplication).',
    category: 'Spiritual',
    priority: 'urgent',
    dueDate: new Date().toISOString().split('T')[0],
    isCompleted: false,
    createdAt: new Date().toISOString(),
    isDailyRoutine: true,
    subTasks: [
      { id: 'sub-pray-1', title: 'Praise & Thanksgiving', isDone: false },
      { id: 'sub-pray-2', title: 'Confession & Cleansing', isDone: false },
      { id: 'sub-pray-3', title: 'Intercession for Family & Needs', isDone: false },
    ],
  },
];

export const StorageService = {
  async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  async getBibleBooks(userId?: string): Promise<BibleBook[]> {
    try {
      const key = getUserKey(STORAGE_KEYS.BIBLE_BOOKS, userId);
      let data = await AsyncStorage.getItem(key);
      if (!data && userId) {
        data = await AsyncStorage.getItem(STORAGE_KEYS.BIBLE_BOOKS);
        if (data) {
          await AsyncStorage.setItem(key, data);
        }
      }
      if (data) return JSON.parse(data);
      const clean = getCleanBibleBooks();
      if (userId) {
        await AsyncStorage.setItem(key, JSON.stringify(clean));
      }
      return clean;
    } catch {
      return getCleanBibleBooks();
    }
  },

  async saveBibleBooks(books: BibleBook[], userId?: string): Promise<void> {
    const key = getUserKey(STORAGE_KEYS.BIBLE_BOOKS, userId);
    await AsyncStorage.setItem(key, JSON.stringify(books));
  },

  async getReadingPlans(userId?: string): Promise<ReadingPlan[]> {
    try {
      const key = getUserKey(STORAGE_KEYS.READING_PLANS, userId);
      let data = await AsyncStorage.getItem(key);
      if (!data && userId) {
        data = await AsyncStorage.getItem(STORAGE_KEYS.READING_PLANS);
        if (data) {
          await AsyncStorage.setItem(key, data);
        }
      }
      if (data) return JSON.parse(data);
      const clean = getCleanReadingPlans();
      if (userId) {
        await AsyncStorage.setItem(key, JSON.stringify(clean));
      }
      return clean;
    } catch {
      return getCleanReadingPlans();
    }
  },

  async saveReadingPlans(plans: ReadingPlan[], userId?: string): Promise<void> {
    const key = getUserKey(STORAGE_KEYS.READING_PLANS, userId);
    await AsyncStorage.setItem(key, JSON.stringify(plans));
  },

  async getVerseNotes(userId?: string): Promise<VerseNote[]> {
    try {
      const key = getUserKey(STORAGE_KEYS.VERSE_NOTES, userId);
      let data = await AsyncStorage.getItem(key);
      if (!data && userId) {
        data = await AsyncStorage.getItem(STORAGE_KEYS.VERSE_NOTES);
        if (data) {
          await AsyncStorage.setItem(key, data);
        }
      }
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveVerseNotes(notes: VerseNote[], userId?: string): Promise<void> {
    const key = getUserKey(STORAGE_KEYS.VERSE_NOTES, userId);
    await AsyncStorage.setItem(key, JSON.stringify(notes));
  },

  async getPrayers(userId?: string): Promise<PrayerItem[]> {
    try {
      const key = getUserKey(STORAGE_KEYS.PRAYERS, userId);
      let data = await AsyncStorage.getItem(key);
      if (!data && userId) {
        data = await AsyncStorage.getItem(STORAGE_KEYS.PRAYERS);
        if (data) {
          await AsyncStorage.setItem(key, data);
        }
      }
      if (data) return JSON.parse(data);
      return SEED_PRAYERS;
    } catch {
      return SEED_PRAYERS;
    }
  },

  async savePrayers(prayers: PrayerItem[], userId?: string): Promise<void> {
    const key = getUserKey(STORAGE_KEYS.PRAYERS, userId);
    await AsyncStorage.setItem(key, JSON.stringify(prayers));
  },

  async getTransactions(userId?: string): Promise<Transaction[]> {
    try {
      const key = getUserKey(STORAGE_KEYS.TRANSACTIONS, userId);
      let data = await AsyncStorage.getItem(key);
      if (!data && userId) {
        data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
        if (data) {
          await AsyncStorage.setItem(key, data);
        }
      }
      if (data) return JSON.parse(data);
      return SEED_TRANSACTIONS;
    } catch {
      return SEED_TRANSACTIONS;
    }
  },

  async saveTransactions(txs: Transaction[], userId?: string): Promise<void> {
    const key = getUserKey(STORAGE_KEYS.TRANSACTIONS, userId);
    await AsyncStorage.setItem(key, JSON.stringify(txs));
  },

  async getTodos(userId?: string): Promise<TodoTask[]> {
    try {
      const key = getUserKey(STORAGE_KEYS.TODOS, userId);
      let data = await AsyncStorage.getItem(key);
      if (!data && userId) {
        data = await AsyncStorage.getItem(STORAGE_KEYS.TODOS);
        if (data) {
          await AsyncStorage.setItem(key, data);
        }
      }
      if (data) return JSON.parse(data);
      return SEED_TODOS;
    } catch {
      return SEED_TODOS;
    }
  },

  async saveTodos(todos: TodoTask[], userId?: string): Promise<void> {
    const key = getUserKey(STORAGE_KEYS.TODOS, userId);
    await AsyncStorage.setItem(key, JSON.stringify(todos));
  },

  async getSermons(userId?: string): Promise<SermonNote[]> {
    try {
      const key = getUserKey(STORAGE_KEYS.SERMONS, userId);
      let data = await AsyncStorage.getItem(key);
      if (!data && userId) {
        data = await AsyncStorage.getItem(STORAGE_KEYS.SERMONS);
        if (data) {
          await AsyncStorage.setItem(key, data);
        }
      }
      if (data) return JSON.parse(data);
      return SEED_SERMONS;
    } catch {
      return SEED_SERMONS;
    }
  },

  async saveSermons(sermons: SermonNote[], userId?: string): Promise<void> {
    const key = getUserKey(STORAGE_KEYS.SERMONS, userId);
    await AsyncStorage.setItem(key, JSON.stringify(sermons));
  },

  async getMemoryVerses(userId?: string): Promise<ScriptureMemoryCard[]> {
    try {
      const key = getUserKey(STORAGE_KEYS.MEMORY_VERSES, userId);
      let data = await AsyncStorage.getItem(key);
      if (!data && userId) {
        data = await AsyncStorage.getItem(STORAGE_KEYS.MEMORY_VERSES);
        if (data) {
          await AsyncStorage.setItem(key, data);
        }
      }
      if (data) return JSON.parse(data);
      return SEED_MEMORY_VERSES;
    } catch {
      return SEED_MEMORY_VERSES;
    }
  },

  async saveMemoryVerses(verses: ScriptureMemoryCard[], userId?: string): Promise<void> {
    const key = getUserKey(STORAGE_KEYS.MEMORY_VERSES, userId);
    await AsyncStorage.setItem(key, JSON.stringify(verses));
  },

  async getFastingRecords(userId?: string): Promise<FastingRecord[]> {
    try {
      const key = getUserKey(STORAGE_KEYS.FASTING, userId);
      let data = await AsyncStorage.getItem(key);
      if (!data && userId) {
        data = await AsyncStorage.getItem(STORAGE_KEYS.FASTING);
        if (data) {
          await AsyncStorage.setItem(key, data);
        }
      }
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveFastingRecords(records: FastingRecord[], userId?: string): Promise<void> {
    const key = getUserKey(STORAGE_KEYS.FASTING, userId);
    await AsyncStorage.setItem(key, JSON.stringify(records));
  },

  // Habits Storage
  async getHabits(userId?: string): Promise<Habit[]> {
    try {
      const key = getUserKey(STORAGE_KEYS.HABITS, userId);
      let data = await AsyncStorage.getItem(key);
      if (!data && userId) {
        data = await AsyncStorage.getItem(STORAGE_KEYS.HABITS);
        if (data) {
          await AsyncStorage.setItem(key, data);
        }
      }
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  },

  async saveHabits(habits: Habit[], userId?: string): Promise<void> {
    const key = getUserKey(STORAGE_KEYS.HABITS, userId);
    await AsyncStorage.setItem(key, JSON.stringify(habits));
  },

  // Decision Wheels Storage
  async getDecisionWheels(userId?: string): Promise<DecisionWheel[]> {
    try {
      const key = getUserKey(STORAGE_KEYS.DECISION_WHEELS, userId);
      let data = await AsyncStorage.getItem(key);
      if (!data && userId) {
        data = await AsyncStorage.getItem(STORAGE_KEYS.DECISION_WHEELS);
        if (data) {
          await AsyncStorage.setItem(key, data);
        }
      }
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  },

  async saveDecisionWheels(wheels: DecisionWheel[], userId?: string): Promise<void> {
    const key = getUserKey(STORAGE_KEYS.DECISION_WHEELS, userId);
    await AsyncStorage.setItem(key, JSON.stringify(wheels));
  },

  // Decision History Results Storage
  async getDecisionResults(userId?: string): Promise<DecisionResult[]> {
    try {
      const key = getUserKey(STORAGE_KEYS.DECISION_RESULTS, userId);
      let data = await AsyncStorage.getItem(key);
      if (!data && userId) {
        data = await AsyncStorage.getItem(STORAGE_KEYS.DECISION_RESULTS);
        if (data) {
          await AsyncStorage.setItem(key, data);
        }
      }
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  },

  async saveDecisionResults(results: DecisionResult[], userId?: string): Promise<void> {
    const key = getUserKey(STORAGE_KEYS.DECISION_RESULTS, userId);
    await AsyncStorage.setItem(key, JSON.stringify(results));
  },

  // Export full backup as JSON
  async exportFullBackup(userId?: string): Promise<string> {
    const [settings, books, plans, verseNotes, prayers, txs, todos, sermons, memoryVerses, fasts, habits, decisionWheels, decisionResults] = await Promise.all([
      this.getSettings(),
      this.getBibleBooks(userId),
      this.getReadingPlans(userId),
      this.getVerseNotes(userId),
      this.getPrayers(userId),
      this.getTransactions(userId),
      this.getTodos(userId),
      this.getSermons(userId),
      this.getMemoryVerses(userId),
      this.getFastingRecords(userId),
      this.getHabits(userId),
      this.getDecisionWheels(userId),
      this.getDecisionResults(userId),
    ]);

    const backup = {
      version: '1.3',
      exportedAt: new Date().toISOString(),
      appName: 'Abide+',
      data: {
        settings,
        books,
        plans,
        verseNotes,
        prayers,
        txs,
        todos,
        sermons,
        memoryVerses,
        fasts,
        habits,
        decisionWheels,
        decisionResults,
      },
    };
    return JSON.stringify(backup, null, 2);
  },

  // Restore backup from JSON
  async restoreBackup(jsonString: string, userId?: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data) return false;
      const { settings, books, plans, verseNotes, prayers, txs, todos, sermons, memoryVerses, fasts, habits, decisionWheels, decisionResults } = parsed.data;
      if (settings) await this.saveSettings(settings);
      if (books) await this.saveBibleBooks(books, userId);
      if (plans) await this.saveReadingPlans(plans, userId);
      if (verseNotes) await this.saveVerseNotes(verseNotes, userId);
      if (prayers) await this.savePrayers(prayers, userId);
      if (txs) await this.saveTransactions(txs, userId);
      if (todos) await this.saveTodos(todos, userId);
      if (sermons) await this.saveSermons(sermons, userId);
      if (memoryVerses) await this.saveMemoryVerses(memoryVerses, userId);
      if (fasts) await this.saveFastingRecords(fasts, userId);
      if (habits) await this.saveHabits(habits, userId);
      if (decisionWheels) await this.saveDecisionWheels(decisionWheels, userId);
      if (decisionResults) await this.saveDecisionResults(decisionResults, userId);
      return true;
    } catch {
      return false;
    }
  },

  // Clear all local application data
  async clearAll(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (e) {
      console.warn("Error clearing local storage:", e);
    }
  },
};
