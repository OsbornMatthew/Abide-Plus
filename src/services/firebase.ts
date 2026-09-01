import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged as fbOnAuthStateChanged,
  User as FirebaseUser,
  Auth
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
  Firestore
} from "firebase/firestore";
import { UserProfile } from "../types/auth";

// Your Firebase web configuration
const firebaseConfig = {
  apiKey: "AIzaSyDctP09ky4gWDbdAkL0I4nfmsl86AfDHGU",
  authDomain: "abide-plus.firebaseapp.com",
  projectId: "abide-plus",
  storageBucket: "abide-plus.firebasestorage.app",
  messagingSenderId: "702446398120",
  appId: "1:702446398120:web:1fe7df6a5fe673bd6d309d",
  measurementId: "G-52DT1FRTYJ"
};

// Safe Singleton Firebase App Initialization
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export interface UserCloudData {
  prayers?: any[];
  transactions?: any[];
  todos?: any[];
  verseNotes?: any[];
  sermons?: any[];
  bibleBooks?: any[];
  readingPlans?: any[];
  settings?: any;
  memoryVerses?: any[];
  fastingRecords?: any[];
  habits?: any[];
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
      
      // Strip undefined values which cause Firestore setDoc to fail
      const cleanPayload = JSON.parse(JSON.stringify(data));
      await setDoc(
        userDocRef,
        {
          ...cleanPayload,
          lastSyncedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return true;
    } catch (e: any) {
      console.warn("Firestore sync error:", e);
      if (e?.code === "permission-denied") {
        console.error("Firestore Permission Denied: Check Firebase Console -> Firestore Database -> Rules");
      }
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

  // Listen to Firebase Auth state
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): Unsubscribe {
    return fbOnAuthStateChanged(auth, callback);
  },

  // Register with Firebase Email & Password
  async registerUser(email: string, pass: string, displayName?: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    const name = displayName?.trim() || cleanEmail.split("@")[0] || "Believer";
    const res = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    const fbUser = res.user;

    if (name) {
      await updateProfile(fbUser, { displayName: name });
    }

    const profile: UserProfile = {
      id: fbUser.uid,
      email: cleanEmail,
      displayName: name,
      avatarColor: "#D4AF37",
      photoURL: fbUser.photoURL || undefined,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    await this.syncUserData(fbUser.uid, { userProfile: profile });
    return profile;
  },

  // Login with Firebase Email & Password
  async loginUser(email: string, pass: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    const res = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    const fbUser = res.user;

    const profile: UserProfile = {
      id: fbUser.uid,
      email: cleanEmail,
      displayName: fbUser.displayName || cleanEmail.split("@")[0] || "Believer",
      avatarColor: "#10B981",
      photoURL: fbUser.photoURL || undefined,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    await this.syncUserData(fbUser.uid, { userProfile: profile });
    return profile;
  },

  // Real Google Sign-In with Firebase Auth
  async loginWithGoogle(): Promise<UserProfile> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("profile");
      provider.addScope("email");
      provider.setCustomParameters({ prompt: "select_account" });
      const res = await signInWithPopup(auth, provider);
      const fbUser = res.user;

      const profile: UserProfile = {
        id: fbUser.uid,
        email: fbUser.email || "user@abide.plus",
        displayName: fbUser.displayName || (fbUser.email ? fbUser.email.split("@")[0] : "Believer"),
        avatarColor: "#4285F4",
        photoURL: fbUser.photoURL || undefined,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      await this.syncUserData(fbUser.uid, { userProfile: profile });
      return profile;
    } catch (err: any) {
      console.warn("Google sign-in popup error:", err);
      if (err?.code === "auth/unauthorized-domain") {
        throw new Error("This domain is not authorized in Firebase. Please add your Vercel URL to Firebase Console -> Authentication -> Settings -> Authorized Domains.");
      }
      if (err?.code === "auth/popup-closed-by-user") {
        throw new Error("Google sign-in window was closed before completing.");
      }
      throw err;
    }
  },

  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Firebase sign out error:", e);
    }
  },

  // Delete user document from Cloud Firestore and delete Auth account
  async deleteUserData(userId: string): Promise<boolean> {
    try {
      if (!userId) return false;
      const cleanUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
      const userDocRef = doc(db, "users", cleanUserId);
      await deleteDoc(userDocRef);
      if (auth.currentUser) {
        try {
          await auth.currentUser.delete();
        } catch (e) {
          await signOut(auth);
        }
      }
      return true;
    } catch (e) {
      console.warn("Error deleting Firestore user data:", e);
      return false;
    }
  }
};
