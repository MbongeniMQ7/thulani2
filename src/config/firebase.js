// Firebase configuration & initialization (compat version) to avoid 'Component auth has not been registered yet' errors on RN/Hermes.
// Using compat ensures the underlying components self-register before first use.
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID
} from '@env';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
// For the new Firebase v9+ SDK
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  databaseURL: "https://mmq-church-app-default-rtdb.firebaseio.com/",
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
};

// Initialize compat app for auth
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize new v9+ app for database
const app = initializeApp(firebaseConfig);

// Export auth (compat version)
export const auth = firebase.auth();

// Export database (v9+ version)
export const database = getDatabase(app);

