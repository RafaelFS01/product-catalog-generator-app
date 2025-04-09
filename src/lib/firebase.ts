
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCafsB2vXkbIxoCBsKTUB72IE-ymw92KiQ",
  authDomain: "catalog-generat.firebaseapp.com",
  databaseURL: "https://catalog-generat-default-rtdb.firebaseio.com",
  projectId: "catalog-generat",
  storageBucket: "catalog-generat.firebasestorage.app",
  messagingSenderId: "505433207966",
  appId: "1:505433207966:web:1ea09e64c96e0337bf778f",
  measurementId: "G-CP77G699V5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Firebase services
export const db = getDatabase(app);
export const auth = getAuth(app);

// Export for testing
export const firebaseInstance = { app, db, auth };
