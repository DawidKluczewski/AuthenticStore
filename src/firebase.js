import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDUWfy8LbOYjz1EWXRXTI9NZLJWVyHjeUo",
  authDomain: "authentic-store-493314.firebaseapp.com",
  projectId: "authentic-store-493314",
  storageBucket: "authentic-store-493314.firebasestorage.app",
  messagingSenderId: "306696804389",
  appId: "1:306696804389:web:52343a153f86645a6547cc",
  measurementId: "G-G63T3LN8K4",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
