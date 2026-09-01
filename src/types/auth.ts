export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarColor?: string;
  photoURL?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthState {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  savedAccounts: UserProfile[];
}
