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
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && parsed.id && parsed.id !== 'pilgrim-default-user') {
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  },

  async setActiveUser(user: UserProfile | null): Promise<void> {
    if (user && user.id !== 'pilgrim-default-user') {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
    }
  },

  async getSavedUsers(): Promise<UserProfile[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_USERS);
      if (data) {
        const list = JSON.parse(data);
        if (Array.isArray(list)) {
          return list.filter((u) => u && u.id && u.id !== 'pilgrim-default-user');
        }
      }
      return [];
    } catch {
      return [];
    }
  },

  async saveUserToSavedList(user: UserProfile): Promise<UserProfile[]> {
    if (!user || user.id === 'pilgrim-default-user') return await this.getSavedUsers();
    const saved = await this.getSavedUsers();
    const cleanEmail = user.email.trim().toLowerCase();
    const filtered = saved.filter((u) => u.email.toLowerCase() !== cleanEmail && u.id !== user.id && u.id !== 'pilgrim-default-user');
    const updatedList = [user, ...filtered];
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_USERS, JSON.stringify(updatedList));
    return updatedList;
  },

  async removeSavedUser(userId: string): Promise<UserProfile[]> {
    const saved = await this.getSavedUsers();
    const updatedList = saved.filter((u) => u.id !== userId);
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_USERS, JSON.stringify(updatedList));
    return updatedList;
  },

  async login(email: string, password?: string, displayName?: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    const saved = await this.getSavedUsers();
    let existing = saved.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!existing) {
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
    } else {
      existing.lastLoginAt = new Date().toISOString();
      if (displayName) existing.displayName = displayName;
    }

    await this.saveUserToSavedList(existing);
    await this.setActiveUser(existing);
    return existing;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
  },
};
