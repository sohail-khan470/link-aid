import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// const firebaseConfig = {
//   apiKey: "AIzaSyBcVGFc7r5xo3AFltMzcyjXnulfMbWEJ4o",
//   authDomain: "linkaid-a1afb.firebaseapp.com",
//   projectId: "linkaid-a1afb",
//   storageBucket: "linkaid-a1afb.firebasestorage.app",
//   messagingSenderId: "355381792662",
//   appId: "1:355381792662:web:2c6ab41ce2d578fde917b7",
//   measurementId: "G-0N81MMJFXG",
// };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
