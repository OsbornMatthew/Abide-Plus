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
import { AppSettings, DEFAULT_SETTINGS, StorageService } from '../services/storage';
import { AuthService } from '../services/authStorage';
import { FirebaseSyncService, UserCloudData } from '../services/firebase';
import { darkTheme, lightTheme, ColorPalette } from '../theme/colors';
import { DAILY_VERSES } from '../data/dailyVerses';

interface AppContextType {
  // Auth & User
  user: UserProfile | null;
  savedUsers: UserProfile[];
  loginUser: (email: string, pass: string, displayName?: string, isRegister?: boolean) => Promise<void>;
  loginWithGoogle: (email?: string, name?: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  switchUser: (user: UserProfile) => Promise<void>;
  removeSavedUser: (userId: string) => Promise<void>;

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

  // Backup / Export
  exportBackupData: () => Promise<string>;
  importBackupData: (jsonStr: string) => Promise<boolean>;

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
  const [activeVerseIndex, setActiveVerseIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load all data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [
          activeUser,
          usersList,
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
        ] = await Promise.all([
          AuthService.getActiveUser(),
          AuthService.getSavedUsers(),
          StorageService.getSettings(),
          StorageService.getBibleBooks(),
          StorageService.getReadingPlans(),
          StorageService.getVerseNotes(),
          StorageService.getPrayers(),
          StorageService.getTransactions(),
          StorageService.getTodos(),
          StorageService.getSermons(),
          StorageService.getMemoryVerses(),
          StorageService.getFastingRecords(),
        ]);

        setUser(activeUser);
        setSavedUsers(usersList);
        setSettings(loadedSettings);
        setBibleBooks(loadedBooks);
        setReadingPlans(loadedPlans);

        // Filter out any old pre-loaded seed notes so user starts with a completely clean slate
        const cleanNotes = (loadedVerseNotes || []).filter(
          (n: any) => n && n.id && !n.id.startsWith('note-1') && !n.id.startsWith('note-2')
        );
        setVerseNotes(cleanNotes);

        setPrayers(loadedPrayers);
        setTransactions(loadedTxs);

        // Ensure Everyday Daily Tasks: Read Bible Today & Prayer Today
        let cleanTodos = (loadedTodos || []).filter((t: any) => t && t.id !== 'todo-1' && t.id !== 'todo-2');
        const hasBible = cleanTodos.some((t: any) => t.id === 'todo-daily-bible' || t.title === 'Read Bible Today');
        const hasPrayer = cleanTodos.some((t: any) => t.id === 'todo-daily-prayer' || t.title === 'Prayer Today');
        const todayStr = new Date().toISOString().split('T')[0];

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
        if (toPrepend.length > 0) {
          await StorageService.saveTodos(finalTodos);
        }

        setSermons(loadedSermons);
        setMemoryVerses(loadedMemoryVerses);
        setFastingRecords(loadedFasts);

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

  // Seamless Realtime Firestore Cross-Device Sync Listener
  useEffect(() => {
    if (!user?.id) return;

    // Load initial cloud data on login
    FirebaseSyncService.loadUserData(user.id).then((cloud) => {
      if (cloud) {
        if (cloud.prayers && Array.isArray(cloud.prayers)) {
          setPrayers(cloud.prayers);
          StorageService.savePrayers(cloud.prayers);
        }
        if (cloud.transactions && Array.isArray(cloud.transactions)) {
          setTransactions(cloud.transactions);
          StorageService.saveTransactions(cloud.transactions);
        }
        if (cloud.todos && Array.isArray(cloud.todos)) {
          setTodos(cloud.todos);
          StorageService.saveTodos(cloud.todos);
        }
        if (cloud.verseNotes && Array.isArray(cloud.verseNotes)) {
          setVerseNotes(cloud.verseNotes);
          StorageService.saveVerseNotes(cloud.verseNotes);
        }
        if (cloud.sermons && Array.isArray(cloud.sermons)) {
          setSermons(cloud.sermons);
          StorageService.saveSermons(cloud.sermons);
        }
        if (cloud.memoryVerses && Array.isArray(cloud.memoryVerses)) {
          setMemoryVerses(cloud.memoryVerses);
          StorageService.saveMemoryVerses(cloud.memoryVerses);
        }
        if (cloud.fastingRecords && Array.isArray(cloud.fastingRecords)) {
          setFastingRecords(cloud.fastingRecords);
          StorageService.saveFastingRecords(cloud.fastingRecords);
        }
        if (cloud.bibleBooks && Array.isArray(cloud.bibleBooks)) {
          setBibleBooks(cloud.bibleBooks);
          StorageService.saveBibleBooks(cloud.bibleBooks);
        }
      }
    });

    // Subscribe to realtime changes across devices
    const unsubscribe = FirebaseSyncService.subscribeToUserData(user.id, (cloud) => {
      if (!cloud) return;
      if (cloud.prayers) setPrayers(cloud.prayers);
      if (cloud.transactions) setTransactions(cloud.transactions);
      if (cloud.todos) setTodos(cloud.todos);
      if (cloud.verseNotes) setVerseNotes(cloud.verseNotes);
      if (cloud.sermons) setSermons(cloud.sermons);
      if (cloud.memoryVerses) setMemoryVerses(cloud.memoryVerses);
      if (cloud.fastingRecords) setFastingRecords(cloud.fastingRecords);
      if (cloud.bibleBooks) setBibleBooks(cloud.bibleBooks);
    });

    return () => {
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
  };

  const loginWithGoogle = async (email?: string, name?: string) => {
    const loggedIn = await FirebaseSyncService.loginWithGoogle(email, name);
    await AuthService.saveUserToSavedList(loggedIn);
    await AuthService.setActiveUser(loggedIn);
    setUser(loggedIn);
    const updatedUsers = await AuthService.getSavedUsers();
    setSavedUsers(updatedUsers);
    await updateSettings({ userName: loggedIn.displayName });
  };

  const logoutUser = async () => {
    await AuthService.logout();
    setUser(null);
  };

  const switchUser = async (targetUser: UserProfile) => {
    await AuthService.setActiveUser(targetUser);
    setUser(targetUser);
    await updateSettings({ userName: targetUser.displayName });
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
    await StorageService.saveBibleBooks(updated);
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
    await StorageService.saveBibleBooks(updated);
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
    await StorageService.saveReadingPlans(updated);
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
    await StorageService.saveVerseNotes(updated);
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
    await StorageService.saveVerseNotes(updated);
  };

  const deleteVerseNote = async (id: string) => {
    const updated = verseNotes.filter((n) => n.id !== id);
    setVerseNotes(updated);
    await StorageService.saveVerseNotes(updated);
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
    await StorageService.savePrayers(updated);
  };

  const updatePrayer = async (id: string, updates: Partial<PrayerItem>) => {
    const updated = prayers.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    setPrayers(updated);
    await StorageService.savePrayers(updated);
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
    await StorageService.savePrayers(updated);
  };

  // Transactions, Savings & Financial Summary
  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: 'tx-' + Date.now(),
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    await StorageService.saveTransactions(updated);
  };

  const deleteTransaction = async (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    await StorageService.saveTransactions(updated);
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
    await StorageService.saveTodos(updated);
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
    await StorageService.saveTodos(updated);
  };

  const deleteTodo = async (id: string) => {
    const updated = todos.filter((t) => t.id !== id);
    setTodos(updated);
    await StorageService.saveTodos(updated);
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
    await StorageService.saveTodos(updated);
  };

  const dailyTaskStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = todos.filter((t) => !t.dueDate || t.dueDate === today || t.isDailyRoutine);
    const totalToday = todayTasks.length;
    const completedToday = todayTasks.filter((t) => t.isCompleted).length;
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
    await StorageService.saveSermons(updated);
  };

  const updateSermon = async (id: string, updates: Partial<SermonNote>) => {
    const updated = sermons.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setSermons(updated);
    await StorageService.saveSermons(updated);
  };

  const deleteSermon = async (id: string) => {
    const updated = sermons.filter((s) => s.id !== id);
    setSermons(updated);
    await StorageService.saveSermons(updated);
  };

  const addMemoryVerse = async (card: Omit<ScriptureMemoryCard, 'id' | 'reviewStreak'>) => {
    const newCard: ScriptureMemoryCard = {
      ...card,
      id: 'mem-' + Date.now(),
      reviewStreak: 0,
    };
    const updated = [newCard, ...memoryVerses];
    setMemoryVerses(updated);
    await StorageService.saveMemoryVerses(updated);
  };

  const updateMemoryVerse = async (id: string, updates: Partial<ScriptureMemoryCard>) => {
    const updated = memoryVerses.map((m) => (m.id === id ? { ...m, ...updates } : m));
    setMemoryVerses(updated);
    await StorageService.saveMemoryVerses(updated);
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
    await StorageService.saveMemoryVerses(updated);
  };

  const deleteMemoryVerse = async (id: string) => {
    const updated = memoryVerses.filter((m) => m.id !== id);
    setMemoryVerses(updated);
    await StorageService.saveMemoryVerses(updated);
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
    await StorageService.saveFastingRecords(updated);
  };

  const stopFast = async () => {
    if (!activeFast) return;
    const updated = fastingRecords.map((f) =>
      f.id === activeFast.id
        ? { ...f, status: 'completed' as const, endTime: new Date().toISOString() }
        : f
    );
    setFastingRecords(updated);
    await StorageService.saveFastingRecords(updated);
  };

  // Backup & Restore
  const exportBackupData = async () => {
    return await StorageService.exportFullBackup();
  };

  const importBackupData = async (jsonStr: string) => {
    const success = await StorageService.restoreBackup(jsonStr);
    if (success) {
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
      ] = await Promise.all([
        StorageService.getSettings(),
        StorageService.getBibleBooks(),
        StorageService.getReadingPlans(),
        StorageService.getVerseNotes(),
        StorageService.getPrayers(),
        StorageService.getTransactions(),
        StorageService.getTodos(),
        StorageService.getSermons(),
        StorageService.getMemoryVerses(),
        StorageService.getFastingRecords(),
      ]);
      setSettings(loadedSettings);
      setBibleBooks(loadedBooks);
      setReadingPlans(loadedPlans);
      setVerseNotes(loadedVerseNotes || []);
      setPrayers(loadedPrayers);
      setTransactions(loadedTxs);
      setTodos(loadedTodos);
      setSermons(loadedSermons);
      setMemoryVerses(loadedMemoryVerses);
      setFastingRecords(loadedFasts);
    }
    return success;
  };

  const dailyVerse = DAILY_VERSES[activeVerseIndex] || DAILY_VERSES[0];

  return (
    <AppContext.Provider
      value={{
        user,
        savedUsers,
        loginUser,
        loginWithGoogle,
        logoutUser,
        switchUser,
        removeSavedUser,
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
        markPrayerAnswered,
        deletePrayer,
        transactions,
        addTransaction,
        deleteTransaction,
        financialSummary,
        todos,
        addTodo,
        toggleTodo,
        deleteTodo,
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
        exportBackupData,
        importBackupData,
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
