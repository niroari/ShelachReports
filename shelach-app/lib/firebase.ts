// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const getAuthDomain = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname && !hostname.includes('localhost') && hostname !== '127.0.0.1') {
      return window.location.host;
    }
  }
  return "shelach-reports.firebaseapp.com";
};

const firebaseConfig = {
  apiKey: "AIzaSyDpmHADZLmgJsPBUmpa3_lfeMjtVE1f8Ws",
  authDomain: getAuthDomain(),
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
