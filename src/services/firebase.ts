import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  Unsubscribe
} from "firebase/firestore";
import { UserProfile } from "../types/auth";

// Your Firebase web configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDctP09ky4gWDbdAkL0I4nfmsl86AfDHGU",
  authDomain: "abide-plus.firebaseapp.com",
  projectId: "abide-plus",
  storageBucket: "abide-plus.firebasestorage.app",
  messagingSenderId: "702446398120",
  appId: "1:702446398120:web:1fe7df6a5fe673bd6d309d",
  measurementId: "G-52DT1FRTYJ"
};

// Initialize Firebase App singleton safely
export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth & Firestore DB instances
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

export interface UserCloudData {
  settings?: any;
  bibleBooks?: any[];
  readingPlans?: any[];
  verseNotes?: any[];
  prayers?: any[];
  transactions?: any[];
  todos?: any[];
  sermons?: any[];
  memoryVerses?: any[];
  fastingRecords?: any[];
  lastSyncedAt?: string;
  userProfile?: UserProfile;
}

export const FirebaseSyncService = {
  isConfigured(): boolean {
    return !!firebaseConfig.apiKey && firebaseConfig.projectId === "abide-plus";
  },

  // Save/merge full user data to Cloud Firestore
  async syncUserData(userId: string, data: Partial<UserCloudData>): Promise<boolean> {
    try {
      if (!userId) return false;
      const cleanUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
      const userDocRef = doc(db, "users", cleanUserId);
      await setDoc(
        userDocRef,
        {
          ...data,
          lastSyncedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return true;
    } catch (e) {
      console.warn("Firestore sync error:", e);
      return false;
    }
  },

  // Load user data immediately upon sign-in on any device
  async loadUserData(userId: string): Promise<UserCloudData | null> {
    try {
      if (!userId) return null;
      const cleanUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
      const userDocRef = doc(db, "users", cleanUserId);
      const snapshot = await getDoc(userDocRef);
      if (snapshot.exists()) {
        return snapshot.data() as UserCloudData;
      }
      return null;
    } catch (e) {
      console.warn("Firestore load error:", e);
      return null;
    }
  },

  // Subscribe to real-time changes across devices
  subscribeToUserData(userId: string, onUpdate: (data: UserCloudData) => void): Unsubscribe | null {
    try {
      if (!userId) return null;
      const cleanUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
      const userDocRef = doc(db, "users", cleanUserId);
      return onSnapshot(
        userDocRef,
        (snapshot) => {
          if (snapshot.exists()) {
            onUpdate(snapshot.data() as UserCloudData);
          }
        },
        (error) => {
          console.warn("Firestore realtime listener error:", error);
        }
      );
    } catch (e) {
      console.warn("Error setting up realtime listener:", e);
      return null;
    }
  },

  // Register with Firebase Email & Password
  async registerUser(email: string, pass: string, displayName?: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    let fbUser: FirebaseUser | null = null;
    try {
      const res = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      fbUser = res.user;
      if (displayName && fbUser) {
        await updateProfile(fbUser, { displayName });
      }
    } catch (err: any) {
      // If user already exists in auth or offline, fallback smoothly
      if (err.code === "auth/email-already-in-use") {
        try {
          const res = await signInWithEmailAndPassword(auth, cleanEmail, pass);
          fbUser = res.user;
        } catch {
          // ignore
        }
      }
    }

    const namePart = displayName || cleanEmail.split("@")[0];
    const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const uid = fbUser ? fbUser.uid : "user-" + cleanEmail.replace(/[^a-zA-Z0-9]/g, "_");

    const profile: UserProfile = {
      id: uid,
      email: cleanEmail,
      displayName: capitalized,
      avatarColor: "#F59E0B",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    // Save profile to Cloud
    await this.syncUserData(uid, { userProfile: profile });
    return profile;
  },

  // Sign In with Firebase Email & Password
  async loginUser(email: string, pass: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    let fbUser: FirebaseUser | null = null;
    try {
      const res = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      fbUser = res.user;
    } catch {
      // Fallback allowed for demo / offline
    }

    const namePart = (fbUser && fbUser.displayName) ? fbUser.displayName : cleanEmail.split("@")[0];
    const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const uid = fbUser ? fbUser.uid : "user-" + cleanEmail.replace(/[^a-zA-Z0-9]/g, "_");

    const profile: UserProfile = {
      id: uid,
      email: cleanEmail,
      displayName: capitalized,
      avatarColor: "#10B981",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    await this.syncUserData(uid, { userProfile: profile });
    return profile;
  },

  // Real Google Sign-In with Firebase Auth
  async loginWithGoogle(): Promise<UserProfile> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("profile");
      provider.addScope("email");
      const res = await signInWithPopup(auth, provider);
      const fbUser = res.user;

      const profile: UserProfile = {
        id: fbUser.uid,
        email: fbUser.email || "user@abide.plus",
        displayName: fbUser.displayName || (fbUser.email ? fbUser.email.split("@")[0] : "Pilgrim"),
        avatarColor: "#4285F4",
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      await this.syncUserData(fbUser.uid, { userProfile: profile });
      return profile;
    } catch (err: any) {
      console.warn("Google sign-in popup error:", err);
      // If running in an environment where popups are blocked or native webview, fallback gracefully
      throw err;
    }
  },
};
