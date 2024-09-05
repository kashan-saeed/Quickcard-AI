// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY, 
  authDomain: process.env.FIREBASE_AUTH_DOMAIN, 
  projectId: "notecard-ai",
  storageBucket: "notecard-ai.appspot.com",
  messagingSenderId: "298945251723",
  appId: "1:298945251723:web:4480bdb26369f68a01878e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export default db;