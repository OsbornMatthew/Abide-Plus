import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALL_BIBLE_BOOKS } from '../data/bibleBooks';
import { READING_PLANS } from '../data/readingPlans';
import { BibleBook, ReadingPlan, PrayerItem, FastingRecord, SermonNote, ScriptureMemoryCard, VerseNote, BibleTranslation } from '../types/spiritual';
import { Transaction, BudgetGoal, GivingPledge, CurrencySetting, SUPPORTED_CURRENCIES } from '../types/finance';
import { TodoTask } from '../types/todo';

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

  // Export full backup as JSON
  async exportFullBackup(): Promise<string> {
    const [settings, books, plans, verseNotes, prayers, txs, todos, sermons, memoryVerses, fasts] = await Promise.all([
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
    ]);

    const backup = {
      version: '1.1',
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
      },
    };
    return JSON.stringify(backup, null, 2);
  },

  // Restore backup from JSON
  async restoreBackup(jsonString: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data) return false;
      const { settings, books, plans, verseNotes, prayers, txs, todos, sermons, memoryVerses, fasts } = parsed.data;
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
      return true;
    } catch {
      return false;
    }
  },
};
