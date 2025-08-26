// Firebase configuration & initialization (compat version) to avoid 'Component auth has not been registered yet' errors on RN/Hermes.
// Using compat ensures the underlying components self-register before first use.

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBNdG6mk-LFZdJ203tOUTlIewC1gV_7EgU',
  authDomain: 'mmq-church-app.firebaseapp.com',
  projectId: 'mmq-church-app',
  storageBucket: 'mmq-church-app.firebasestorage.app',
  messagingSenderId: '384286151613',
  appId: '1:384286151613:web:b0ca78b67b861e16a778d4',
  measurementId: 'G-CV5NH2424Z',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}


export const auth = firebase.auth();

