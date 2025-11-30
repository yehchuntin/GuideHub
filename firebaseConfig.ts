
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  apiKey: "AIzaSyDGGr0Oun_B4oRKvvartS7_UF5PNKMJspc",
  authDomain: "guidehub-bf5d7.firebaseapp.com",
  projectId: "guidehub-bf5d7",
  storageBucket: "guidehub-bf5d7.firebasestorage.app",
  messagingSenderId: "653273697338",
  appId: "1:653273697338:web:6a29b480964b2158eaf903",
  measurementId: "G-RD3K1PPLYP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
