/**
 * Abide+ Firebase Cloud Integration Service
 * 
 * To connect your Firebase project:
 * 1. Go to https://console.firebase.google.com and create a project (e.g. "abide-plus").
 * 2. In Firebase Console:
 *    - Enable "Authentication" -> Sign-in method -> Enable "Email/Password".
 *    - Enable "Cloud Firestore" -> Create Database in production/test mode.
 * 3. Add an Android App (package name: `com.abideplus.christianlifetracker`) or Web App.
 * 4. Copy the Firebase config credentials into the `firebaseConfig` object below.
 * 5. Run: `npm install firebase`
 */

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Replace with your Firebase project credentials from Firebase Console
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDctP09ky4gWDbdAkL0I4nfmsl86AfDHGU",
  authDomain: "abide-plus.firebaseapp.com",
  projectId: "abide-plus",
  storageBucket: "abide-plus.firebasestorage.app",
  messagingSenderId: "702446398120",
  appId: "1:702446398120:web:1fe7df6a5fe673bd6d309d",
  measurementId: "G-52DT1FRTYJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const FirebaseSyncGuide = {
  isConfigured(): boolean {
    return (
      firebaseConfig.apiKey !== "npm install firebase" &&
      firebaseConfig.projectId !== "abide-plus"
    );
  },

  getSetupInstructions(): string[] {
    return [
      "1. Create a Firebase project at https://console.firebase.google.com",
      "2. Enable Authentication > Email/Password provider",
      "3. Enable Cloud Firestore database",
      "4. Copy your web/Android config keys into src/services/firebase.ts",
      "5. Run 'npm install firebase' to enable automatic cloud backup and multi-device sync",
    ];
  }
};
