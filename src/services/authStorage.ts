import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types/auth';

const STORAGE_KEYS = {
  ACTIVE_USER: '@abide_active_user',
  SAVED_USERS: '@abide_saved_users_list',
};

export const AuthService = {
  async getActiveUser(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      if (data) return JSON.parse(data);
      return null;
    } catch {
      return null;
    }
  },

  async setActiveUser(user: UserProfile): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
  },

  async getSavedUsers(): Promise<UserProfile[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_USERS);
      if (data) return JSON.parse(data);
      return [];
    } catch {
      return [];
    }
  },

  async login(email: string, password?: string, displayName?: string): Promise<UserProfile> {
    const saved = await this.getSavedUsers();
    const cleanEmail = email.trim().toLowerCase();
    let existing = saved.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!existing) {
      // Create new user profile upon registration
      const namePart = displayName || cleanEmail.split('@')[0];
      const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      existing = {
        id: 'user-' + Date.now(),
        email: cleanEmail,
        displayName: capitalized,
        avatarColor: ['#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#06B6D4'][saved.length % 5],
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      const updatedList = [...saved, existing];
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_USERS, JSON.stringify(updatedList));
    } else {
      existing.lastLoginAt = new Date().toISOString();
      if (displayName) existing.displayName = displayName;
      const updatedList = saved.map((u) => (u.id === existing!.id ? existing! : u));
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_USERS, JSON.stringify(updatedList));
    }

    await this.setActiveUser(existing);
    return existing;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
  },
};
