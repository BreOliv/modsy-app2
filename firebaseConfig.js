import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCs_bMXV0gwTT7y8QJgv-lZK127JWfPRcE",
  authDomain: "modsy-ia-app.firebaseapp.com",
  projectId: "modsy-ia-app",
  storageBucket: "modsy-ia-app.firebasestorage.app",
  messagingSenderId: "449116139523",
  appId: "1:449116139523:web:15379f94799e0468cd1e36"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);