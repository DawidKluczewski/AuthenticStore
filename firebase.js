// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDUWfy8LbOYjz1EWXRXTI9NZLJWVyHjeUo",
  authDomain: "authentic-store-493314.firebaseapp.com",
  projectId: "authentic-store-493314",
  storageBucket: "authentic-store-493314.firebasestorage.app",
  messagingSenderId: "306696804389",
  appId: "1:306696804389:web:52343a153f86645a6547cc",
  measurementId: "G-G63T3LN8K4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
