import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  BibleBook,
  ReadingPlan,
  PrayerItem,
  FastingRecord,
  SermonNote,
  ScriptureMemoryCard,
  VerseOfTheDay,
  VerseNote,
  BibleTranslation,
} from '../types/spiritual';
import {
  Transaction,
  BudgetGoal,
  GivingPledge,
  CurrencySetting,
  SUPPORTED_CURRENCIES,
} from '../types/finance';
import { TodoTask } from '../types/todo';
import { UserProfile } from '../types/auth';
import { Habit, DEFAULT_HABITS } from '../types/habit';
import { DecisionWheel, DecisionResult } from '../types/decision';
import { DEFAULT_DECISION_WHEELS } from '../data/defaultWheels';
import { ALL_BIBLE_BOOKS, getCleanBibleBooks } from '../data/bibleBooks';
import { READING_PLANS, getCleanReadingPlans } from '../data/readingPlans';
import { AppSettings, DEFAULT_SETTINGS, StorageService, SEED_TODOS } from '../services/storage';
import { AuthService } from '../services/authStorage';
import { FirebaseSyncService, UserCloudData } from '../services/firebase';
import { darkTheme, lightTheme, ColorPalette } from '../theme/colors';
import { DAILY_VERSES } from '../data/dailyVerses';
import { getLocalDateString, getYesterdayLocalDateString, calculateHabitStreak, calculateBestHabitStreak } from '../utils/dateUtils';

interface AppContextType {
  // Auth & User
  user: UserProfile | null;
  savedUsers: UserProfile[];
  loginUser: (email: string, pass: string, displayName?: string, isRegister?: boolean) => Promise<void>;
  logoutUser: () => Promise<void>;
  switchUser: (user: UserProfile) => Promise<void>;
  removeSavedUser: (userId: string) => Promise<void>;
  restoreAllUserData: () => Promise<boolean>;

  // Settings & Theme
  settings: AppSettings;
  theme: ColorPalette;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  toggleTheme: () => Promise<void>;
  toggleLanguage: () => Promise<void>;
  toggleBibleTranslation: () => Promise<void>;
  setCurrency: (currency: CurrencySetting) => Promise<void>;

  // Scripture & Bible
  bibleBooks: BibleBook[];
  toggleChapterRead: (bookId: string, chapter: number) => Promise<void>;
  markAllChaptersRead: (bookId: string, markRead: boolean) => Promise<void>;
  bibleProgress: {
    totalChapters: number;
    readChaptersCount: number;
    totalPercentage: number;
    otPercentage: number;
    ntPercentage: number;
  };
  readingPlans: ReadingPlan[];
  togglePlanDay: (planId: string, day: number) => Promise<void>;
  dailyVerse: VerseOfTheDay;
  setDailyVerseIndex: (idx: number) => void;
  activeVerseIndex: number;
  totalDailyVerses: number;

  // Verse Notes & Reflections
  verseNotes: VerseNote[];
  addVerseNote: (note: Omit<VerseNote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateVerseNote: (id: string, updates: Partial<VerseNote>) => Promise<void>;
  deleteVerseNote: (id: string) => Promise<void>;

  // Prayer Journal
  prayers: PrayerItem[];
  addPrayer: (prayer: Omit<PrayerItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePrayer: (id: string, updates: Partial<PrayerItem>) => Promise<void>;
  markPrayerAnswered: (id: string, testimony?: string) => Promise<void>;
  deletePrayer: (id: string) => Promise<void>;

  // Financial Stewardship, Expenses & Savings
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  financialSummary: {
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlyTithes: number;
    monthlyOfferings: number;
    monthlyBenevolence: number;
    monthlySavings: number;
    totalGiving: number;
    expectedTithe: number; // 10% of income
    titheDifference: number; // expected - actual
    givingRatio: number; // percentage of income given
    netBalance: number; // income - expenses - giving - savings
  };

  // Smart To-Do Planner
  todos: TodoTask[];
  addTodo: (todo: Omit<TodoTask, 'id' | 'createdAt'>) => Promise<void>;
  updateTodo: (id: string, updates: Partial<TodoTask>) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleSubtask: (todoId: string, subtaskId: string) => Promise<void>;
  dailyTaskStats: {
    totalToday: number;
    completedToday: number;
    completionRatio: number;
  };

  // Sermons & Memory Verses
  sermons: SermonNote[];
  addSermon: (sermon: Omit<SermonNote, 'id'>) => Promise<void>;
  updateSermon: (id: string, updates: Partial<SermonNote>) => Promise<void>;
  deleteSermon: (id: string) => Promise<void>;

  memoryVerses: ScriptureMemoryCard[];
  addMemoryVerse: (card: Omit<ScriptureMemoryCard, 'id' | 'reviewStreak'>) => Promise<void>;
  updateMemoryVerse: (id: string, updates: Partial<ScriptureMemoryCard>) => Promise<void>;
  toggleMemoryVerse: (id: string) => Promise<void>;
  deleteMemoryVerse: (id: string) => Promise<void>;

  // Fasting Tracker
  activeFast: FastingRecord | null;
  fastingHistory: FastingRecord[];
  startFast: (fastType: FastingRecord['fastType'], targetHours: number, prayerIntention: string) => Promise<void>;
  stopFast: () => Promise<void>;
  deleteFastingRecord: (id: string) => Promise<void>;

  // Habit Tracker & Daily Disciplines
  habits: Habit[];
  toggleHabit: (id: string, dateStr?: string) => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id' | 'completedDates' | 'currentStreak' | 'bestStreak' | 'createdAt'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  habitStats: {
    totalHabits: number;
    completedToday: number;
    completionRatio: number;
    overallBestStreak: number;
  };

  // Prayer & Devotion Timer (Persists across dashboard)
  prayerTimer: {
    isRunning: boolean;
    secondsLeft: number;
    totalSeconds: number;
    selectedMinutes: number;
  };
  startPrayerTimer: (minutes?: number) => void;
  pausePrayerTimer: () => void;
  resumePrayerTimer: () => void;
  resetPrayerTimer: (minutes?: number) => void;
  showPrayerTimerModal: boolean;
  setShowPrayerTimerModal: (show: boolean) => void;

  // Decision Maker Wheel & History
  decisionWheels: DecisionWheel[];
  decisionResults: DecisionResult[];
  activeWheelId: string;
  setActiveWheelId: (id: string) => void;
  addDecisionWheel: (wheel: Omit<DecisionWheel, 'id' | 'createdAt'>) => Promise<void>;
  updateDecisionWheel: (id: string, updates: Partial<DecisionWheel>) => Promise<void>;
  deleteDecisionWheel: (id: string) => Promise<void>;
  recordDecisionResult: (result: Omit<DecisionResult, 'id' | 'timestamp'>) => Promise<void>;
  clearDecisionHistory: () => Promise<void>;

  // Backup & Restore
  exportBackupData: () => Promise<string>;
  importBackupData: (jsonStr: string) => Promise<boolean>;

  // Account Deletion & Wipe
  deleteAccount: () => Promise<void>;

  isLoading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [savedUsers, setSavedUsers] = useState<UserProfile[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [bibleBooks, setBibleBooks] = useState<BibleBook[]>([]);
  const [readingPlans, setReadingPlans] = useState<ReadingPlan[]>([]);
  const [verseNotes, setVerseNotes] = useState<VerseNote[]>([]);
  const [prayers, setPrayers] = useState<PrayerItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [todos, setTodos] = useState<TodoTask[]>([]);
  const [sermons, setSermons] = useState<SermonNote[]>([]);
  const [memoryVerses, setMemoryVerses] = useState<ScriptureMemoryCard[]>([]);
  const [fastingRecords, setFastingRecords] = useState<FastingRecord[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [decisionWheels, setDecisionWheels] = useState<DecisionWheel[]>([]);
  const [decisionResults, setDecisionResults] = useState<DecisionResult[]>([]);
  const [activeWheelId, setActiveWheelId] = useState<string>('');

  // Deterministic 1 Verse per day based on calendar day-of-year
  const todayVerseIndex = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return Math.abs(dayOfYear) % DAILY_VERSES.length;
  }, []);

  const [activeVerseIndex, setActiveVerseIndex] = useState<number>(todayVerseIndex);
  const [isLoading, setIsLoading] = useState(true);

  // Global Prayer Timer State
  const [prayerTimer, setPrayerTimer] = useState({
    isRunning: false,
    secondsLeft: 10 * 60,
    totalSeconds: 10 * 60,
    selectedMinutes: 10,
  });
  const [showPrayerTimerModal, setShowPrayerTimerModal] = useState(false);

  // Load all data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const activeUser = await AuthService.getActiveUser();
        const usersList = await AuthService.getSavedUsers();
        const uid = activeUser?.id;

        const [
          loadedSettings,
          loadedBooks,
          loadedPlans,
          loadedVerseNotes,
          loadedPrayers,
          loadedTxs,
          loadedTodos,
          loadedSermons,
          loadedMemoryVerses,
          loadedFasts,
          loadedHabits,
          loadedWheels,
          loadedResults,
        ] = await Promise.all([
          StorageService.getSettings(),
          StorageService.getBibleBooks(uid),
          StorageService.getReadingPlans(uid),
          StorageService.getVerseNotes(uid),
          StorageService.getPrayers(uid),
          StorageService.getTransactions(uid),
          StorageService.getTodos(uid),
          StorageService.getSermons(uid),
          StorageService.getMemoryVerses(uid),
          StorageService.getFastingRecords(uid),
          StorageService.getHabits(uid),
          StorageService.getDecisionWheels(uid),
          StorageService.getDecisionResults(uid),
        ]);

        setUser(activeUser);
        setSavedUsers(usersList);
        setSettings(loadedSettings);
        setBibleBooks(uid && loadedBooks && loadedBooks.length > 0 ? loadedBooks : getCleanBibleBooks());
        setReadingPlans(uid && loadedPlans && loadedPlans.length > 0 ? loadedPlans : getCleanReadingPlans());

        // Clean out default seed habits so users start with their own, and compute accurate streaks
        const defaultHabitIds = new Set([
          'habit-morning-prayer',
          'habit-bible-reading',
          'habit-intercession',
          'habit-acts-kindness',
          'habit-gratitude',
          'habit-stewardship',
        ]);
        const userHabits = (loadedHabits || [])
          .filter((h: any) => h && h.id && !defaultHabitIds.has(h.id))
          .map((h: Habit) => {
            const allDates = Array.from(new Set(h.completedDates || [])).sort();
            const streak = calculateHabitStreak(allDates);
            const best = calculateBestHabitStreak(allDates);
            return {
              ...h,
              completedDates: allDates,
              currentStreak: streak,
              bestStreak: best,
            };
          });
        setHabits(userHabits);
        await StorageService.saveHabits(userHabits);
        syncUserCloud({ habits: userHabits });

        // Clean out default seed wheels so users start with their own
        const defaultWheelIds = new Set([
          'wheel-scripture-study',
          'wheel-prayer-intercession',
          'wheel-kindness-mission',
          'wheel-daily-focus',
        ]);
        const userWheels = (loadedWheels || []).filter((w: any) => w && w.id && !defaultWheelIds.has(w.id));
        setDecisionWheels(userWheels);
        if (userWheels.length > 0) {
          setActiveWheelId(userWheels[0].id);
        } else {
          setActiveWheelId('');
        }
        await StorageService.saveDecisionWheels(userWheels);
        syncUserCloud({ decisionWheels: userWheels } as any);
        setDecisionResults(loadedResults || []);

        // Filter out any old pre-loaded seed notes so user starts with a completely clean slate
        const cleanNotes = (loadedVerseNotes || []).filter(
          (n: any) => n && n.id && !n.id.startsWith('note-1') && !n.id.startsWith('note-2')
        );
        setVerseNotes(cleanNotes);

        setPrayers(loadedPrayers);
        setTransactions(loadedTxs);

        // Ensure Everyday Daily Tasks: Read Bible Today & Prayer Today
        let cleanTodos = (loadedTodos || []).filter((t: any) => t && t.id !== 'todo-1' && t.id !== 'todo-2');
        const todayStr = getLocalDateString();

        // Refresh daily routines for a new day
        cleanTodos = cleanTodos.map((t: TodoTask) => {
          if (t.isDailyRoutine || t.id === 'todo-daily-bible' || t.id === 'todo-daily-prayer') {
            if (t.dueDate !== todayStr) {
              return {
                ...t,
                dueDate: todayStr,
                isCompleted: false,
                completedAt: undefined,
                subTasks: (t.subTasks || []).map((s) => ({ ...s, isDone: false })),
              };
            }
          }
          return t;
        });

        const hasBible = cleanTodos.some((t: any) => t.id === 'todo-daily-bible' || t.title === 'Read Bible Today');
        const hasPrayer = cleanTodos.some((t: any) => t.id === 'todo-daily-prayer' || t.title === 'Prayer Today');

        const toPrepend: any[] = [];
        if (!hasBible) {
          toPrepend.push({
            id: 'todo-daily-bible',
            title: 'Read Bible Today',
            description: 'Read your daily scripture chapters and meditate on God’s Word.',
            category: 'Spiritual',
            priority: 'urgent',
            dueDate: todayStr,
            isCompleted: false,
            createdAt: new Date().toISOString(),
            isDailyRoutine: true,
            subTasks: [
              { id: 'sub-bible-1', title: 'Old Testament Chapter', isDone: false },
              { id: 'sub-bible-2', title: 'New Testament Chapter', isDone: false },
              { id: 'sub-bible-3', title: 'Record Verse Reflection', isDone: false },
            ],
          });
        }
        if (!hasPrayer) {
          toPrepend.push({
            id: 'todo-daily-prayer',
            title: 'Prayer Today',
            description: 'Spend dedicated time in ACTS prayer (Adoration, Confession, Thanksgiving, Supplication).',
            category: 'Spiritual',
            priority: 'urgent',
            dueDate: todayStr,
            isCompleted: false,
            createdAt: new Date().toISOString(),
            isDailyRoutine: true,
            subTasks: [
              { id: 'sub-pray-1', title: 'Praise & Thanksgiving', isDone: false },
              { id: 'sub-pray-2', title: 'Confession & Cleansing', isDone: false },
              { id: 'sub-pray-3', title: 'Intercession for Family & Needs', isDone: false },
            ],
          });
        }

        const finalTodos = toPrepend.length > 0 ? [...toPrepend, ...cleanTodos] : cleanTodos;
        setTodos(finalTodos);
        await StorageService.saveTodos(finalTodos);

        setSermons(loadedSermons);
        setMemoryVerses(loadedMemoryVerses);
        setFastingRecords(loadedFasts);
        if (loadedWheels && loadedWheels.length > 0) {
          setDecisionWheels(loadedWheels);
          setActiveWheelId(loadedWheels[0].id);
        }
        if (loadedResults) {
          setDecisionResults(loadedResults);
        }

        // Day of year based index
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
        setActiveVerseIndex(dayOfYear % DAILY_VERSES.length);
      } catch (e) {
        console.error('Error loading initial data', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Auto-bind Firebase Auth state changes across page reloads & devices
  useEffect(() => {
    const unsubAuth = FirebaseSyncService.onAuthStateChanged(async (fbUser) => {
      if (fbUser && (!user || user.id !== fbUser.uid)) {
        const active: UserProfile = {
          id: fbUser.uid,
          email: fbUser.email || "user@abide.plus",
          displayName: fbUser.displayName || (fbUser.email ? fbUser.email.split("@")[0] : "Pilgrim"),
          avatarColor: "#4285F4",
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        setUser(active);
        await AuthService.setActiveUser(active);
        await AuthService.saveUserToSavedList(active);
        const cloud = await FirebaseSyncService.loadUserData(active.id);
        await applyUserData(cloud, active);
      }
    });

    return () => {
      if (unsubAuth) unsubAuth();
    };
  }, []);

  // Helper to load or reset user-specific data to guarantee 100% data isolation
  const applyUserData = async (cloud: UserCloudData | null, targetUser?: UserProfile | null) => {
    const targetUid = targetUser?.id || user?.id;

    // Load local storage first as base
    const [
      localBooks,
      localPlans,
      localNotes,
      localPrayers,
      localTxs,
      localTodos,
      localSermons,
      localVerses,
      localFasts,
      localHabits,
      localWheels,
      localResults,
    ] = await Promise.all([
      StorageService.getBibleBooks(targetUid),
      StorageService.getReadingPlans(targetUid),
      StorageService.getVerseNotes(targetUid),
      StorageService.getPrayers(targetUid),
      StorageService.getTransactions(targetUid),
      StorageService.getTodos(targetUid),
      StorageService.getSermons(targetUid),
      StorageService.getMemoryVerses(targetUid),
      StorageService.getFastingRecords(targetUid),
      StorageService.getHabits(targetUid),
      StorageService.getDecisionWheels(targetUid),
      StorageService.getDecisionResults(targetUid),
    ]);

    if (cloud) {
      const prayersToSet = cloud.prayers && Array.isArray(cloud.prayers) ? cloud.prayers : (localPrayers || []);
      const txsToSet = cloud.transactions && Array.isArray(cloud.transactions) ? cloud.transactions : (localTxs || []);
      const todosSource = cloud.todos && Array.isArray(cloud.todos) && cloud.todos.length > 0 ? cloud.todos : (localTodos && localTodos.length > 0 ? localTodos : SEED_TODOS);
      const todayStr = getLocalDateString();
      const refreshedTodos = todosSource.map((t: any) => {
        if (t.isDailyRoutine || t.id === 'todo-daily-bible' || t.id === 'todo-daily-prayer') {
          if (t.dueDate !== todayStr) {
            return {
              ...t,
              dueDate: todayStr,
              isCompleted: false,
              completedAt: undefined,
              subTasks: (t.subTasks || []).map((s: any) => ({ ...s, isDone: false })),
            };
          }
        }
        return t;
      });
      const notesToSet = cloud.verseNotes && Array.isArray(cloud.verseNotes) ? cloud.verseNotes : (localNotes || []);
      const sermonsToSet = cloud.sermons && Array.isArray(cloud.sermons) ? cloud.sermons : (localSermons || []);
      const versesToSet = cloud.memoryVerses && Array.isArray(cloud.memoryVerses) ? cloud.memoryVerses : (localVerses || []);
      const fastsToSet = cloud.fastingRecords && Array.isArray(cloud.fastingRecords) ? cloud.fastingRecords : (localFasts || []);
      const booksToSet = cloud.bibleBooks && Array.isArray(cloud.bibleBooks) && cloud.bibleBooks.length > 0
        ? cloud.bibleBooks
        : (localBooks && localBooks.length > 0 ? localBooks : getCleanBibleBooks());
      const plansToSet = cloud.readingPlans && Array.isArray(cloud.readingPlans) && cloud.readingPlans.length > 0
        ? cloud.readingPlans
        : (localPlans && localPlans.length > 0 ? localPlans : getCleanReadingPlans());
      const habitsSource = cloud.habits && Array.isArray(cloud.habits) ? cloud.habits : (localHabits || []);
      const sanitizedHabits = habitsSource.map((h: any) => {
        const allDates = Array.from(new Set((h.completedDates || []) as string[])).sort();
        const streak = calculateHabitStreak(allDates);
        const best = calculateBestHabitStreak(allDates);
        return {
          ...h,
          completedDates: allDates,
          currentStreak: streak,
          bestStreak: best,
        };
      });
      const wheelsToSet = cloud.decisionWheels && Array.isArray(cloud.decisionWheels) ? cloud.decisionWheels : (localWheels || []);
      const resultsToSet = cloud.decisionResults && Array.isArray(cloud.decisionResults) ? cloud.decisionResults : (localResults || []);

      // Synchronous instant in-memory state update
      setPrayers(prayersToSet);
      setTransactions(txsToSet);
      setTodos(refreshedTodos);
      setVerseNotes(notesToSet);
      setSermons(sermonsToSet);
      setMemoryVerses(versesToSet);
      setFastingRecords(fastsToSet);
      setBibleBooks(booksToSet);
      setReadingPlans(plansToSet);
      setHabits(sanitizedHabits);
      setDecisionWheels(wheelsToSet);
      setActiveWheelId(wheelsToSet.length > 0 ? wheelsToSet[0].id : '');
      setDecisionResults(resultsToSet);

      if (cloud.settings && typeof cloud.settings === 'object') {
        setSettings((prev) => ({ ...prev, ...cloud.settings }));
      }

      // Non-blocking parallel storage write in background
      Promise.all([
        StorageService.savePrayers(prayersToSet, targetUid),
        StorageService.saveTransactions(txsToSet, targetUid),
        StorageService.saveTodos(refreshedTodos, targetUid),
        StorageService.saveVerseNotes(notesToSet, targetUid),
        StorageService.saveSermons(sermonsToSet, targetUid),
        StorageService.saveMemoryVerses(versesToSet, targetUid),
        StorageService.saveFastingRecords(fastsToSet, targetUid),
        StorageService.saveBibleBooks(booksToSet, targetUid),
        StorageService.saveReadingPlans(plansToSet, targetUid),
        StorageService.saveHabits(sanitizedHabits, targetUid),
        StorageService.saveDecisionWheels(wheelsToSet, targetUid),
        StorageService.saveDecisionResults(resultsToSet, targetUid),
        cloud.settings ? StorageService.saveSettings(cloud.settings) : Promise.resolve(),
      ]).catch((e) => console.warn('Background cache notice:', e));
    } else {
      // Cloud is null (e.g. initial web load or offline) - Use local storage data if present!
      const hasLocalData =
        (localPrayers && localPrayers.length > 0) ||
        (localTxs && localTxs.length > 0) ||
        (localNotes && localNotes.length > 0) ||
        (localHabits && localHabits.length > 0) ||
        (localWheels && localWheels.length > 0) ||
        (localBooks && localBooks.some((b) => b.readChapters && b.readChapters.length > 0));

      if (hasLocalData) {
        if (localPrayers) setPrayers(localPrayers);
        if (localTxs) setTransactions(localTxs);
        if (localNotes) setVerseNotes(localNotes);
        if (localHabits) setHabits(localHabits);
        if (localWheels && localWheels.length > 0) {
          setDecisionWheels(localWheels);
          setActiveWheelId(localWheels[0].id);
        }
        if (localResults) setDecisionResults(localResults);
        if (localSermons) setSermons(localSermons);
        if (localVerses) setMemoryVerses(localVerses);
        if (localFasts) setFastingRecords(localFasts);
        if (localTodos && localTodos.length > 0) setTodos(localTodos);
        if (localBooks && localBooks.length > 0) setBibleBooks(localBooks);
        if (localPlans && localPlans.length > 0) setReadingPlans(localPlans);

        if (targetUid) {
          FirebaseSyncService.syncUserData(targetUid, {
            prayers: localPrayers || [],
            transactions: localTxs || [],
            habits: localHabits || [],
            decisionWheels: localWheels || [],
            decisionResults: localResults || [],
            verseNotes: localNotes || [],
            sermons: localSermons || [],
            memoryVerses: localVerses || [],
            fastingRecords: localFasts || [],
            todos: localTodos || SEED_TODOS,
            bibleBooks: localBooks || getCleanBibleBooks(),
            readingPlans: localPlans || getCleanReadingPlans(),
          });
        }
      } else {
        // Brand new user with no existing data
        const cleanBooks = getCleanBibleBooks();
        const cleanPlans = getCleanReadingPlans();

        setPrayers([]);
        setTransactions([]);
        setHabits([]);
        setDecisionWheels([]);
        setDecisionResults([]);
        setVerseNotes([]);
        setSermons([]);
        setMemoryVerses([]);
        setFastingRecords([]);
        setTodos(SEED_TODOS);
        setBibleBooks(cleanBooks);
        setReadingPlans(cleanPlans);
        setActiveWheelId('');
      }
    }
  };

  // Seamless Realtime Firestore Cross-Device Sync Listener
  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;
    const unsubscribe = FirebaseSyncService.subscribeToUserData(user.id, (cloud) => {
      if (!cloud || !isMounted) return;
      applyUserData(cloud, user);
    });

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [user?.id]);

  const syncUserCloud = async (updates: Partial<UserCloudData>) => {
    if (user?.id) {
      await FirebaseSyncService.syncUserData(user.id, updates);
    }
  };

  const loginUser = async (email: string, pass: string, displayName?: string, isRegister?: boolean) => {
    let loggedIn: UserProfile;
    if (isRegister) {
      loggedIn = await FirebaseSyncService.registerUser(email, pass, displayName);
    } else {
      loggedIn = await FirebaseSyncService.loginUser(email, pass);
    }

    await AuthService.saveUserToSavedList(loggedIn);
    await AuthService.setActiveUser(loggedIn);
    setUser(loggedIn);
    const updatedUsers = await AuthService.getSavedUsers();
    setSavedUsers(updatedUsers);
    await updateSettings({ userName: loggedIn.displayName });

    const cloud = await FirebaseSyncService.loadUserData(loggedIn.id);
    await applyUserData(cloud, loggedIn);
  };

  const logoutUser = async () => {
    await AuthService.logout();
    await FirebaseSyncService.logout();
    setUser(null);
    const cleanBooks = getCleanBibleBooks();
    const cleanPlans = getCleanReadingPlans();
    setPrayers([]);
    setTransactions([]);
    setHabits([]);
    setDecisionWheels([]);
    setDecisionResults([]);
    setVerseNotes([]);
    setSermons([]);
    setMemoryVerses([]);
    setFastingRecords([]);
    setTodos(SEED_TODOS);
    setBibleBooks(cleanBooks);
    setReadingPlans(cleanPlans);
    setActiveWheelId('');
    await StorageService.savePrayers([]);
    await StorageService.saveTransactions([]);
    await StorageService.saveHabits([]);
    await StorageService.saveDecisionWheels([]);
    await StorageService.saveDecisionResults([]);
    await StorageService.saveVerseNotes([]);
    await StorageService.saveSermons([]);
    await StorageService.saveMemoryVerses([]);
    await StorageService.saveFastingRecords([]);
    await StorageService.saveTodos(SEED_TODOS);
    await StorageService.saveBibleBooks(cleanBooks);
    await StorageService.saveReadingPlans(cleanPlans);
  };

  const switchUser = async (targetUser: UserProfile) => {
    await AuthService.setActiveUser(targetUser);
    setUser(targetUser);
    await updateSettings({ userName: targetUser.displayName });
    const cloud = await FirebaseSyncService.loadUserData(targetUser.id);
    if (cloud) {
      applyUserData(cloud, targetUser);
    } else {
      const cleanBooks = await StorageService.getBibleBooks(targetUser.id);
      const cleanPlans = await StorageService.getReadingPlans(targetUser.id);
      const loadedHabits = await StorageService.getHabits(targetUser.id);
      const loadedPrayers = await StorageService.getPrayers(targetUser.id);
      const loadedTxs = await StorageService.getTransactions(targetUser.id);
      const loadedTodos = await StorageService.getTodos(targetUser.id);
      const loadedWheels = await StorageService.getDecisionWheels(targetUser.id);
      const loadedResults = await StorageService.getDecisionResults(targetUser.id);
      const loadedNotes = await StorageService.getVerseNotes(targetUser.id);
      const loadedSermons = await StorageService.getSermons(targetUser.id);
      const loadedMems = await StorageService.getMemoryVerses(targetUser.id);
      const loadedFasts = await StorageService.getFastingRecords(targetUser.id);

      setBibleBooks(cleanBooks || getCleanBibleBooks());
      setReadingPlans(cleanPlans || getCleanReadingPlans());
      setHabits(loadedHabits || []);
      setPrayers(loadedPrayers || []);
      setTransactions(loadedTxs || []);
      setTodos(loadedTodos || SEED_TODOS);
      setDecisionWheels(loadedWheels || []);
      setDecisionResults(loadedResults || []);
      setVerseNotes(loadedNotes || []);
      setSermons(loadedSermons || []);
      setMemoryVerses(loadedMems || []);
      setFastingRecords(loadedFasts || []);
    }
  };

  const deleteAccount = async () => {
    if (user?.id) {
      const uid = user.id;
      await FirebaseSyncService.deleteUserData(uid);
      await AuthService.removeSavedUser(uid);
      await AuthService.logout();
      setUser(null);
      const updatedSaved = await AuthService.getSavedUsers();
      setSavedUsers(updatedSaved);
      await StorageService.clearAll();
      setPrayers([]);
      setTransactions([]);
      setTodos([]);
      setVerseNotes([]);
      setSermons([]);
      setMemoryVerses([]);
      setFastingRecords([]);
      setReadingPlans([]);
      setHabits([]);
      setSettings(DEFAULT_SETTINGS);
    }
  };

  const restoreAllUserData = async (): Promise<boolean> => {
    try {
      const targetUid = user?.id;
      let cloud = targetUid ? await FirebaseSyncService.loadUserData(targetUid) : null;
      if (!cloud) {
        const active = await AuthService.getActiveUser();
        if (active?.id) {
          cloud = await FirebaseSyncService.loadUserData(active.id);
        }
      }
      await applyUserData(cloud, user);
      return true;
    } catch (e) {
      console.warn("restoreAllUserData error:", e);
      return false;
    }
  };

  const removeSavedUser = async (userId: string) => {
    const updated = await AuthService.removeSavedUser(userId);
    setSavedUsers(updated);
    if (user?.id === userId) {
      await AuthService.logout();
      setUser(null);
    }
  };

  const theme: ColorPalette = settings.isDarkMode ? darkTheme : lightTheme;

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await StorageService.saveSettings(updated);
    syncUserCloud({ settings: updated });
  };

  const toggleTheme = async () => {
    await updateSettings({ isDarkMode: !settings.isDarkMode });
  };

  const toggleLanguage = async () => {
    const nextLang = settings.displayLanguage === 'en' ? 'ta' : 'en';
    const nextTrans: BibleTranslation = nextLang === 'ta' ? 'TAOVBSI' : 'NIV';
    await updateSettings({ displayLanguage: nextLang, bibleTranslation: nextTrans });
  };

  const toggleBibleTranslation = async () => {
    const nextTrans: BibleTranslation = settings.bibleTranslation === 'NIV' ? 'TAOVBSI' : 'NIV';
    await updateSettings({ bibleTranslation: nextTrans });
  };

  const setCurrency = async (curr: CurrencySetting) => {
    await updateSettings({ currency: curr });
  };

  // Bible Progress Calculations
  const bibleProgress = useMemo(() => {
    let totalChapters = 0;
    let readChaptersCount = 0;
    let otTotal = 0;
    let otRead = 0;
    let ntTotal = 0;
    let ntRead = 0;

    bibleBooks.forEach((book) => {
      totalChapters += book.totalChapters;
      const readCount = book.readChapters?.length || 0;
      readChaptersCount += readCount;

      if (book.testament === 'OT') {
        otTotal += book.totalChapters;
        otRead += readCount;
      } else {
        ntTotal += book.totalChapters;
        ntRead += readCount;
      }
    });

    return {
      totalChapters,
      readChaptersCount,
      totalPercentage: totalChapters > 0 ? Math.round((readChaptersCount / totalChapters) * 100) : 0,
      otPercentage: otTotal > 0 ? Math.round((otRead / otTotal) * 100) : 0,
      ntPercentage: ntTotal > 0 ? Math.round((ntRead / ntTotal) * 100) : 0,
    };
  }, [bibleBooks]);

  const toggleChapterRead = async (bookId: string, chapter: number) => {
    const updated = bibleBooks.map((book) => {
      if (book.id === bookId) {
        const readSet = new Set(book.readChapters || []);
        if (readSet.has(chapter)) {
          readSet.delete(chapter);
        } else {
          readSet.add(chapter);
        }
        return { ...book, readChapters: Array.from(readSet).sort((a, b) => a - b) };
      }
      return book;
    });
    setBibleBooks(updated);
    await StorageService.saveBibleBooks(updated, user?.id);
    syncUserCloud({ bibleBooks: updated });
  };

  const markAllChaptersRead = async (bookId: string, markRead: boolean) => {
    const updated = bibleBooks.map((book) => {
      if (book.id === bookId) {
        return {
          ...book,
          readChapters: markRead ? Array.from({ length: book.totalChapters }, (_, i) => i + 1) : [],
        };
      }
      return book;
    });
    setBibleBooks(updated);
    await StorageService.saveBibleBooks(updated, user?.id);
    syncUserCloud({ bibleBooks: updated });
  };

  const togglePlanDay = async (planId: string, day: number) => {
    const updated = readingPlans.map((plan) => {
      if (plan.id === planId) {
        const completedSet = new Set(plan.completedDays || []);
        if (completedSet.has(day)) {
          completedSet.delete(day);
        } else {
          completedSet.add(day);
        }
        const newArr = Array.from(completedSet).sort((a, b) => a - b);
        return { ...plan, completedDays: newArr, currentDay: Math.min(day + 1, plan.daysTotal) };
      }
      return plan;
    });
    setReadingPlans(updated);
    await StorageService.saveReadingPlans(updated, user?.id);
    syncUserCloud({ readingPlans: updated });
  };

  // Verse Notes
  const addVerseNote = async (note: Omit<VerseNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newNote: VerseNote = {
      ...note,
      id: 'vnote-' + Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newNote, ...verseNotes];
    setVerseNotes(updated);
    await StorageService.saveVerseNotes(updated, user?.id);
    syncUserCloud({ verseNotes: updated });
  };

  const updateVerseNote = async (id: string, updates: Partial<VerseNote>) => {
    const updated = verseNotes.map((n) =>
      n.id === id
        ? {
            ...n,
            ...updates,
            updatedAt: new Date().toISOString(),
          }
        : n
    );
    setVerseNotes(updated);
    await StorageService.saveVerseNotes(updated, user?.id);
    syncUserCloud({ verseNotes: updated });
  };

  const deleteVerseNote = async (id: string) => {
    const updated = verseNotes.filter((n) => n.id !== id);
    setVerseNotes(updated);
    await StorageService.saveVerseNotes(updated, user?.id);
    syncUserCloud({ verseNotes: updated });
  };

  // Prayers
  const addPrayer = async (prayer: Omit<PrayerItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newPrayer: PrayerItem = {
      ...prayer,
      id: 'prayer-' + Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newPrayer, ...prayers];
    setPrayers(updated);
    await StorageService.savePrayers(updated, user?.id);
    syncUserCloud({ prayers: updated });
  };

  const updatePrayer = async (id: string, updates: Partial<PrayerItem>) => {
    const updated = prayers.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    setPrayers(updated);
    await StorageService.savePrayers(updated, user?.id);
    syncUserCloud({ prayers: updated });
  };

  const markPrayerAnswered = async (id: string, testimony?: string) => {
    await updatePrayer(id, {
      status: 'answered',
      answeredDate: new Date().toISOString(),
      testimony: testimony || 'God answered this prayer faithfully.',
    });
  };

  const deletePrayer = async (id: string) => {
    const updated = prayers.filter((p) => p.id !== id);
    setPrayers(updated);
    await StorageService.savePrayers(updated, user?.id);
    syncUserCloud({ prayers: updated });
  };

  // Transactions, Savings & Financial Summary
  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: 'tx-' + Date.now(),
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    await StorageService.saveTransactions(updated, user?.id);
    syncUserCloud({ transactions: updated });
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const updated = transactions.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    );
    setTransactions(updated);
    await StorageService.saveTransactions(updated, user?.id);
    syncUserCloud({ transactions: updated });
  };

  const deleteTransaction = async (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    await StorageService.saveTransactions(updated, user?.id);
    syncUserCloud({ transactions: updated });
  };

  const financialSummary = useMemo(() => {
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    let monthlyTithes = 0;
    let monthlyOfferings = 0;
    let monthlyBenevolence = 0;
    let monthlySavings = 0;

    transactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income') {
        monthlyIncome += amt;
      } else if (tx.type === 'expense') {
        monthlyExpenses += amt;
      } else if (tx.type === 'tithe') {
        monthlyTithes += amt;
      } else if (tx.type === 'offering') {
        monthlyOfferings += amt;
      } else if (tx.type === 'benevolence') {
        monthlyBenevolence += amt;
      } else if (tx.type === 'savings') {
        monthlySavings += amt;
      }
    });

    const totalGiving = monthlyTithes + monthlyOfferings + monthlyBenevolence;
    const expectedTithe = Math.round(monthlyIncome * 0.1);
    const titheDifference = monthlyTithes - expectedTithe;
    const givingRatio = monthlyIncome > 0 ? Math.round((totalGiving / monthlyIncome) * 100) : 0;
    // Net balance reduces income by expenses, giving, AND savings
    const netBalance = monthlyIncome - monthlyExpenses - totalGiving - monthlySavings;

    return {
      monthlyIncome,
      monthlyExpenses,
      monthlyTithes,
      monthlyOfferings,
      monthlyBenevolence,
      monthlySavings,
      totalGiving,
      expectedTithe,
      titheDifference,
      givingRatio,
      netBalance,
    };
  }, [transactions]);

  // Todos
  const addTodo = async (todo: Omit<TodoTask, 'id' | 'createdAt'>) => {
    const newTodo: TodoTask = {
      ...todo,
      id: 'todo-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newTodo, ...todos];
    setTodos(updated);
    await StorageService.saveTodos(updated, user?.id);
    syncUserCloud({ todos: updated });
  };

  const updateTodo = async (id: string, updates: Partial<TodoTask>) => {
    const updated = todos.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    );
    setTodos(updated);
    await StorageService.saveTodos(updated, user?.id);
    syncUserCloud({ todos: updated });
  };

  const toggleTodo = async (id: string) => {
    const updated = todos.map((t) => {
      if (t.id === id) {
        const nextState = !t.isCompleted;
        return {
          ...t,
          isCompleted: nextState,
          completedAt: nextState ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });
    setTodos(updated);
    await StorageService.saveTodos(updated, user?.id);
    syncUserCloud({ todos: updated });
  };

  const deleteTodo = async (id: string) => {
    const updated = todos.filter((t) => t.id !== id);
    setTodos(updated);
    await StorageService.saveTodos(updated, user?.id);
    syncUserCloud({ todos: updated });
  };

  const toggleSubtask = async (todoId: string, subtaskId: string) => {
    const updated = todos.map((t) => {
      if (t.id === todoId) {
        const updatedSubs = t.subTasks.map((s) =>
          s.id === subtaskId ? { ...s, isDone: !s.isDone } : s
        );
        const allDone = updatedSubs.length > 0 && updatedSubs.every((s) => s.isDone);
        return {
          ...t,
          subTasks: updatedSubs,
          isCompleted: allDone ? true : t.isCompleted,
          completedAt: allDone ? new Date().toISOString() : t.completedAt,
        };
      }
      return t;
    });
    setTodos(updated);
    await StorageService.saveTodos(updated, user?.id);
    syncUserCloud({ todos: updated });
  };

  const dailyTaskStats = useMemo(() => {
    const today = getLocalDateString();
    const todayTasks = todos.filter((t) => !t.dueDate || t.dueDate === today || t.isDailyRoutine);
    const totalToday = todayTasks.length;
    const completedToday = todayTasks.filter((t) => t.isCompleted && (!t.dueDate || t.dueDate === today)).length;
    const completionRatio = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

    return {
      totalToday,
      completedToday,
      completionRatio,
    };
  }, [todos]);

  // Sermons & Memory Verses
  const addSermon = async (sermon: Omit<SermonNote, 'id'>) => {
    const newSermon: SermonNote = { ...sermon, id: 'sermon-' + Date.now() };
    const updated = [newSermon, ...sermons];
    setSermons(updated);
    await StorageService.saveSermons(updated, user?.id);
    syncUserCloud({ sermons: updated });
  };

  const updateSermon = async (id: string, updates: Partial<SermonNote>) => {
    const updated = sermons.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setSermons(updated);
    await StorageService.saveSermons(updated, user?.id);
    syncUserCloud({ sermons: updated });
  };

  const deleteSermon = async (id: string) => {
    const updated = sermons.filter((s) => s.id !== id);
    setSermons(updated);
    await StorageService.saveSermons(updated, user?.id);
    syncUserCloud({ sermons: updated });
  };

  const addMemoryVerse = async (card: Omit<ScriptureMemoryCard, 'id' | 'reviewStreak'>) => {
    const newCard: ScriptureMemoryCard = {
      ...card,
      id: 'mem-' + Date.now(),
      reviewStreak: 0,
    };
    const updated = [newCard, ...memoryVerses];
    setMemoryVerses(updated);
    await StorageService.saveMemoryVerses(updated, user?.id);
    syncUserCloud({ memoryVerses: updated });
  };

  const updateMemoryVerse = async (id: string, updates: Partial<ScriptureMemoryCard>) => {
    const updated = memoryVerses.map((m) => (m.id === id ? { ...m, ...updates } : m));
    setMemoryVerses(updated);
    await StorageService.saveMemoryVerses(updated, user?.id);
    syncUserCloud({ memoryVerses: updated });
  };

  const toggleMemoryVerse = async (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = memoryVerses.map((m) => {
      if (m.id === id) {
        const isMem = !m.isMemorized;
        return {
          ...m,
          isMemorized: isMem,
          reviewStreak: isMem ? m.reviewStreak + 1 : m.reviewStreak,
          lastReviewedDate: today,
        };
      }
      return m;
    });
    setMemoryVerses(updated);
    await StorageService.saveMemoryVerses(updated, user?.id);
    syncUserCloud({ memoryVerses: updated });
  };

  const deleteMemoryVerse = async (id: string) => {
    const updated = memoryVerses.filter((m) => m.id !== id);
    setMemoryVerses(updated);
    await StorageService.saveMemoryVerses(updated, user?.id);
    syncUserCloud({ memoryVerses: updated });
  };

  // Fasting
  const activeFast = useMemo(() => {
    return fastingRecords.find((f) => f.status === 'active') || null;
  }, [fastingRecords]);

  const startFast = async (fastType: FastingRecord['fastType'], targetHours: number, prayerIntention: string) => {
    const newFast: FastingRecord = {
      id: 'fast-' + Date.now(),
      fastType,
      targetHours,
      startTime: new Date().toISOString(),
      status: 'active',
      prayerIntention,
    };
    const updated = [newFast, ...fastingRecords];
    setFastingRecords(updated);
    await StorageService.saveFastingRecords(updated, user?.id);
    syncUserCloud({ fastingRecords: updated });
  };

  const stopFast = async () => {
    if (!activeFast) return;
    const updated = fastingRecords.map((f) =>
      f.id === activeFast.id
        ? { ...f, status: 'completed' as const, endTime: new Date().toISOString() }
        : f
    );
    setFastingRecords(updated);
    await StorageService.saveFastingRecords(updated, user?.id);
    syncUserCloud({ fastingRecords: updated });
  };

  const deleteFastingRecord = async (id: string) => {
    const updated = fastingRecords.filter((f) => f.id !== id);
    setFastingRecords(updated);
    await StorageService.saveFastingRecords(updated, user?.id);
    syncUserCloud({ fastingRecords: updated });
  };

  const toggleHabit = async (id: string, dateStr?: string) => {
    const todayStr = getLocalDateString();
    // Enforce discipline integrity: Only allow marking/unmarking today's habit
    const targetDate = dateStr && dateStr !== todayStr ? todayStr : (dateStr || todayStr);
    const updated = habits.map((h) => {
      if (h.id === id) {
        const datesSet = new Set(h.completedDates || []);
        if (datesSet.has(targetDate)) {
          datesSet.delete(targetDate);
        } else {
          datesSet.add(targetDate);
        }
        const newDates = Array.from(datesSet).sort();
        const streak = calculateHabitStreak(newDates);
        const best = calculateBestHabitStreak(newDates);
        return {
          ...h,
          completedDates: newDates,
          currentStreak: streak,
          bestStreak: best,
        };
      }
      return h;
    });
    setHabits(updated);
    await StorageService.saveHabits(updated, user?.id);
    syncUserCloud({ habits: updated });
  };

  const addHabit = async (habit: Omit<Habit, 'id' | 'completedDates' | 'currentStreak' | 'bestStreak' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habit,
      id: 'habit-' + Date.now(),
      completedDates: [],
      currentStreak: 0,
      bestStreak: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [newHabit, ...habits];
    setHabits(updated);
    await StorageService.saveHabits(updated, user?.id);
    syncUserCloud({ habits: updated });
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    const updated = habits.map((h) => {
      if (h.id === id) {
        const merged = { ...h, ...updates };
        const streak = calculateHabitStreak(merged.completedDates || []);
        const best = calculateBestHabitStreak(merged.completedDates || []);
        return { ...merged, currentStreak: streak, bestStreak: best };
      }
      return h;
    });
    setHabits(updated);
    await StorageService.saveHabits(updated, user?.id);
    syncUserCloud({ habits: updated });
  };

  const deleteHabit = async (id: string) => {
    const updated = habits.filter((h) => h.id !== id);
    setHabits(updated);
    await StorageService.saveHabits(updated, user?.id);
    syncUserCloud({ habits: updated });
  };

  const habitStats = useMemo(() => {
    const today = getLocalDateString();
    const totalHabits = habits.length;
    const completedToday = habits.filter((h) => h.completedDates?.includes(today)).length;
    const completionRatio = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
    const overallBestStreak = habits.reduce((max, h) => Math.max(max, h.bestStreak || 0, h.currentStreak || 0), 0);
    return {
      totalHabits,
      completedToday,
      completionRatio,
      overallBestStreak,
    };
  }, [habits]);

  // Decision Maker Wheel Functions
  const addDecisionWheel = async (wheel: Omit<DecisionWheel, 'id' | 'createdAt'>) => {
    const newWheel: DecisionWheel = {
      ...wheel,
      id: 'wheel-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newWheel, ...decisionWheels];
    setDecisionWheels(updated);
    setActiveWheelId(newWheel.id);
    await StorageService.saveDecisionWheels(updated, user?.id);
    syncUserCloud({ decisionWheels: updated } as any);
  };

  const updateDecisionWheel = async (id: string, updates: Partial<DecisionWheel>) => {
    const updated = decisionWheels.map((w) => (w.id === id ? { ...w, ...updates } : w));
    setDecisionWheels(updated);
    await StorageService.saveDecisionWheels(updated, user?.id);
    syncUserCloud({ decisionWheels: updated } as any);
  };

  const deleteDecisionWheel = async (id: string) => {
    const updated = decisionWheels.filter((w) => w.id !== id);
    setDecisionWheels(updated);
    if (activeWheelId === id) {
      setActiveWheelId(updated[0]?.id || '');
    }
    await StorageService.saveDecisionWheels(updated, user?.id);
    syncUserCloud({ decisionWheels: updated } as any);
  };

  const recordDecisionResult = async (result: Omit<DecisionResult, 'id' | 'timestamp'>) => {
    const newResult: DecisionResult = {
      ...result,
      id: 'res-' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    const updated = [newResult, ...decisionResults];
    setDecisionResults(updated);
    await StorageService.saveDecisionResults(updated, user?.id);
    syncUserCloud({ decisionResults: updated } as any);
  };

  const clearDecisionHistory = async () => {
    setDecisionResults([]);
    await StorageService.saveDecisionResults([], user?.id);
    syncUserCloud({ decisionResults: [] } as any);
  };

  // Backup & Restore
  const exportBackupData = async () => {
    return await StorageService.exportFullBackup(user?.id);
  };

  const importBackupData = async (jsonStr: string) => {
    const success = await StorageService.restoreBackup(jsonStr, user?.id);
    if (success) {
      const uid = user?.id;
      const [
        loadedSettings,
        loadedBooks,
        loadedPlans,
        loadedVerseNotes,
        loadedPrayers,
        loadedTxs,
        loadedTodos,
        loadedSermons,
        loadedMemoryVerses,
        loadedFasts,
        loadedHabits,
        loadedWheels,
        loadedResults,
      ] = await Promise.all([
        StorageService.getSettings(),
        StorageService.getBibleBooks(uid),
        StorageService.getReadingPlans(uid),
        StorageService.getVerseNotes(uid),
        StorageService.getPrayers(uid),
        StorageService.getTransactions(uid),
        StorageService.getTodos(uid),
        StorageService.getSermons(uid),
        StorageService.getMemoryVerses(uid),
        StorageService.getFastingRecords(uid),
        StorageService.getHabits(uid),
        StorageService.getDecisionWheels(uid),
        StorageService.getDecisionResults(uid),
      ]);
      setSettings(loadedSettings || DEFAULT_SETTINGS);
      setBibleBooks(loadedBooks || getCleanBibleBooks());
      setReadingPlans(loadedPlans || getCleanReadingPlans());
      setVerseNotes(loadedVerseNotes || []);
      setPrayers(loadedPrayers || []);
      setTransactions(loadedTxs || []);
      setTodos(loadedTodos || SEED_TODOS);
      setSermons(loadedSermons || []);
      setMemoryVerses(loadedMemoryVerses || []);
      setFastingRecords(loadedFasts || []);
      setHabits(loadedHabits || []);
      if (loadedWheels && loadedWheels.length > 0) {
        setDecisionWheels(loadedWheels);
        setActiveWheelId(loadedWheels[0].id);
      }
      if (loadedResults) {
        setDecisionResults(loadedResults);
      }
    }
    return success;
  };

  // Background Prayer Timer Ticker
  useEffect(() => {
    let interval: any = null;
    if (prayerTimer.isRunning) {
      interval = setInterval(() => {
        setPrayerTimer((prev) => {
          if (!prev.isRunning || prev.secondsLeft <= 1) {
            return { ...prev, isRunning: false, secondsLeft: 0 };
          }
          return { ...prev, secondsLeft: prev.secondsLeft - 1 };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [prayerTimer.isRunning]);

  const startPrayerTimer = (minutes?: number) => {
    const mins = minutes || prayerTimer.selectedMinutes || 10;
    setPrayerTimer({
      isRunning: true,
      selectedMinutes: mins,
      totalSeconds: mins * 60,
      secondsLeft: mins * 60,
    });
  };

  const pausePrayerTimer = () => {
    setPrayerTimer((prev) => ({ ...prev, isRunning: false }));
  };

  const resumePrayerTimer = () => {
    if (prayerTimer.secondsLeft > 0) {
      setPrayerTimer((prev) => ({ ...prev, isRunning: true }));
    }
  };

  const resetPrayerTimer = (minutes?: number) => {
    const mins = minutes || prayerTimer.selectedMinutes || 10;
    setPrayerTimer({
      isRunning: false,
      selectedMinutes: mins,
      totalSeconds: mins * 60,
      secondsLeft: mins * 60,
    });
  };

  const dailyVerse = DAILY_VERSES[activeVerseIndex] || DAILY_VERSES[todayVerseIndex] || DAILY_VERSES[0];

  return (
    <AppContext.Provider
      value={{
        user,
        savedUsers,
        loginUser,
        logoutUser,
        switchUser,
        removeSavedUser,
        restoreAllUserData,
        settings,
        theme,
        updateSettings,
        toggleTheme,
        toggleLanguage,
        toggleBibleTranslation,
        setCurrency,
        bibleBooks,
        toggleChapterRead,
        markAllChaptersRead,
        bibleProgress,
        readingPlans,
        togglePlanDay,
        dailyVerse,
        setDailyVerseIndex: setActiveVerseIndex,
        activeVerseIndex,
        totalDailyVerses: DAILY_VERSES.length,
        verseNotes,
        addVerseNote,
        updateVerseNote,
        deleteVerseNote,
        prayers,
        addPrayer,
        updatePrayer,
        deletePrayer,
        markPrayerAnswered,
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        financialSummary,
        todos,
        addTodo,
        updateTodo,
        deleteTodo,
        toggleTodo,
        toggleSubtask,
        dailyTaskStats,
        sermons,
        addSermon,
        updateSermon,
        deleteSermon,
        memoryVerses,
        addMemoryVerse,
        updateMemoryVerse,
        toggleMemoryVerse,
        deleteMemoryVerse,
        activeFast,
        fastingHistory: fastingRecords,
        startFast,
        stopFast,
        deleteFastingRecord,
        habits,
        toggleHabit,
        addHabit,
        updateHabit,
        deleteHabit,
        habitStats,
        decisionWheels,
        decisionResults,
        activeWheelId,
        setActiveWheelId,
        addDecisionWheel,
        updateDecisionWheel,
        deleteDecisionWheel,
        recordDecisionResult,
        clearDecisionHistory,
        prayerTimer,
        startPrayerTimer,
        pausePrayerTimer,
        resumePrayerTimer,
        resetPrayerTimer,
        showPrayerTimerModal,
        setShowPrayerTimerModal,
        exportBackupData,
        importBackupData,
        deleteAccount,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
