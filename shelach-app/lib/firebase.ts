// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDpmHADZLmgJsPBUmpa3_lfeMjtVE1f8Ws",
  authDomain: "shelach-reports.firebaseapp.com",
  projectId: "shelach-reports",
  storageBucket: "shelach-reports.firebasestorage.app",
  messagingSenderId: "890845711067",
  appId: "1:890845711067:web:746dde4901125d1acf9afe"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export default app;
