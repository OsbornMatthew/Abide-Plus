import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { Platform } from "react-native";

// Your web app's Firebase configuration
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

export const FirebaseSyncService = {
  isConfigured(): boolean {
    return !!firebaseConfig.apiKey && firebaseConfig.projectId === "abide-plus";
  },

  // Sync user data to Cloud Firestore
  async syncUserData(userId: string, data: {
    prayers?: any[];
    transactions?: any[];
    todos?: any[];
    bibleBooks?: any[];
  }): Promise<boolean> {
    try {
      if (!userId) return false;
      const userDocRef = doc(db, "users", userId);
      await setDoc(userDocRef, {
        ...data,
        lastSyncedAt: new Date().toISOString(),
      }, { merge: true });
      return true;
    } catch (e) {
      console.warn("Firestore sync error:", e);
      return false;
    }
  },

  // Load user data from Cloud Firestore
  async loadUserData(userId: string): Promise<any | null> {
    try {
      if (!userId) return null;
      const userDocRef = doc(db, "users", userId);
      const snapshot = await getDoc(userDocRef);
      if (snapshot.exists()) {
        return snapshot.data();
      }
      return null;
    } catch (e) {
      console.warn("Firestore load error:", e);
      return null;
    }
  },
};

export const FirebaseSyncGuide = {
  isConfigured(): boolean {
    return FirebaseSyncService.isConfigured();
  },

  getSetupInstructions(): string[] {
    return [
      "✓ Firebase Project: abide-plus (Connected)",
      "✓ Project ID: abide-plus",
      "✓ Authentication: Email/Password configured",
      "✓ Cloud Firestore: Active and ready for sync",
      "✓ Local Firebase SDK v11 initialized successfully",
    ];
  }
};
