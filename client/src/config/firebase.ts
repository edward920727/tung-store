// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNpAmZjxZgb9Ub7qZLH6htzgmKHXHWpiI",
  authDomain: "tung-315.firebaseapp.com",
  projectId: "tung-315",
  storageBucket: "tung-315.firebasestorage.app",
  messagingSenderId: "269133618540",
  appId: "1:269133618540:web:1cfc7a35a1a3b790b6e749",
  measurementId: "G-NRY3EEPQDB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, analytics };
