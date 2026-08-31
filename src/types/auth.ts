export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarColor?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthState {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  savedAccounts: UserProfile[];
}
