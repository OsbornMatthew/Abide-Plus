import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALL_BIBLE_BOOKS } from '../data/bibleBooks';
import { READING_PLANS } from '../data/readingPlans';
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

  async getBibleBooks(): Promise<BibleBook[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BIBLE_BOOKS);
      if (data) return JSON.parse(data);
      await AsyncStorage.setItem(STORAGE_KEYS.BIBLE_BOOKS, JSON.stringify(ALL_BIBLE_BOOKS));
      return ALL_BIBLE_BOOKS;
    } catch {
      return ALL_BIBLE_BOOKS;
    }
  },

  async saveBibleBooks(books: BibleBook[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.BIBLE_BOOKS, JSON.stringify(books));
  },

  async getReadingPlans(): Promise<ReadingPlan[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.READING_PLANS);
      if (data) return JSON.parse(data);
      await AsyncStorage.setItem(STORAGE_KEYS.READING_PLANS, JSON.stringify(READING_PLANS));
      return READING_PLANS;
    } catch {
      return READING_PLANS;
    }
  },

  async saveReadingPlans(plans: ReadingPlan[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.READING_PLANS, JSON.stringify(plans));
  },

  async getVerseNotes(): Promise<VerseNote[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.VERSE_NOTES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveVerseNotes(notes: VerseNote[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.VERSE_NOTES, JSON.stringify(notes));
  },

  async getPrayers(): Promise<PrayerItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PRAYERS);
      if (data) return JSON.parse(data);
      await AsyncStorage.setItem(STORAGE_KEYS.PRAYERS, JSON.stringify(SEED_PRAYERS));
      return SEED_PRAYERS;
    } catch {
      return SEED_PRAYERS;
    }
  },

  async savePrayers(prayers: PrayerItem[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.PRAYERS, JSON.stringify(prayers));
  },

  async getTransactions(): Promise<Transaction[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (data) return JSON.parse(data);
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(SEED_TRANSACTIONS));
      return SEED_TRANSACTIONS;
    } catch {
      return SEED_TRANSACTIONS;
    }
  },

  async saveTransactions(txs: Transaction[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
  },

  async getTodos(): Promise<TodoTask[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TODOS);
      if (data) return JSON.parse(data);
      await AsyncStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(SEED_TODOS));
      return SEED_TODOS;
    } catch {
      return SEED_TODOS;
    }
  },

  async saveTodos(todos: TodoTask[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
  },

  async getSermons(): Promise<SermonNote[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SERMONS);
      if (data) return JSON.parse(data);
      await AsyncStorage.setItem(STORAGE_KEYS.SERMONS, JSON.stringify(SEED_SERMONS));
      return SEED_SERMONS;
    } catch {
      return SEED_SERMONS;
    }
  },

  async saveSermons(sermons: SermonNote[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SERMONS, JSON.stringify(sermons));
  },

  async getMemoryVerses(): Promise<ScriptureMemoryCard[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MEMORY_VERSES);
      if (data) return JSON.parse(data);
      await AsyncStorage.setItem(STORAGE_KEYS.MEMORY_VERSES, JSON.stringify(SEED_MEMORY_VERSES));
      return SEED_MEMORY_VERSES;
    } catch {
      return SEED_MEMORY_VERSES;
    }
  },

  async saveMemoryVerses(verses: ScriptureMemoryCard[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.MEMORY_VERSES, JSON.stringify(verses));
  },

  async getFastingRecords(): Promise<FastingRecord[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FASTING);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveFastingRecords(records: FastingRecord[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.FASTING, JSON.stringify(records));
  },

  // Habits Storage
  async getHabits(): Promise<Habit[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.HABITS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      // Save default habits if empty
      await this.saveHabits(DEFAULT_HABITS);
      return DEFAULT_HABITS;
    } catch {
      return DEFAULT_HABITS;
    }
  },

  async saveHabits(habits: Habit[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  },

  // Decision Wheels Storage
  async getDecisionWheels(): Promise<DecisionWheel[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DECISION_WHEELS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      await this.saveDecisionWheels(DEFAULT_DECISION_WHEELS);
      return DEFAULT_DECISION_WHEELS;
    } catch {
      return DEFAULT_DECISION_WHEELS;
    }
  },

  async saveDecisionWheels(wheels: DecisionWheel[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.DECISION_WHEELS, JSON.stringify(wheels));
  },

  // Decision History Results Storage
  async getDecisionResults(): Promise<DecisionResult[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DECISION_RESULTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  },

  async saveDecisionResults(results: DecisionResult[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.DECISION_RESULTS, JSON.stringify(results));
  },

  // Export full backup as JSON
  async exportFullBackup(): Promise<string> {
    const [settings, books, plans, verseNotes, prayers, txs, todos, sermons, memoryVerses, fasts, habits, decisionWheels, decisionResults] = await Promise.all([
      this.getSettings(),
      this.getBibleBooks(),
      this.getReadingPlans(),
      this.getVerseNotes(),
      this.getPrayers(),
      this.getTransactions(),
      this.getTodos(),
      this.getSermons(),
      this.getMemoryVerses(),
      this.getFastingRecords(),
      this.getHabits(),
      this.getDecisionWheels(),
      this.getDecisionResults(),
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
  async restoreBackup(jsonString: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data) return false;
      const { settings, books, plans, verseNotes, prayers, txs, todos, sermons, memoryVerses, fasts, habits, decisionWheels, decisionResults } = parsed.data;
      if (settings) await this.saveSettings(settings);
      if (books) await this.saveBibleBooks(books);
      if (plans) await this.saveReadingPlans(plans);
      if (verseNotes) await this.saveVerseNotes(verseNotes);
      if (prayers) await this.savePrayers(prayers);
      if (txs) await this.saveTransactions(txs);
      if (todos) await this.saveTodos(todos);
      if (sermons) await this.saveSermons(sermons);
      if (memoryVerses) await this.saveMemoryVerses(memoryVerses);
      if (fasts) await this.saveFastingRecords(fasts);
      if (habits) await this.saveHabits(habits);
      if (decisionWheels) await this.saveDecisionWheels(decisionWheels);
      if (decisionResults) await this.saveDecisionResults(decisionResults);
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
