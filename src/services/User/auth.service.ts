// src/services/auth.service.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  Auth,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

// Helper function to handle error messages
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return "An unknown error occurred";
};

// Email/Password Sign Up
export const signUp = async (userData: any): Promise<User> => {
  try {
    const { email, password } = userData;
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: userData.email,
      username: userData.username,
      phone: userData.phone,
      role: userData.role,
      createdAt: new Date(),
    });
    return user;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// Email/Password Sign In
export const signIn = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// Google Sign-In
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// Sign Out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// You can export all functions as an object if you prefer
export const authService = {
  signUp,
  signIn,
  signInWithGoogle,
  signOut: signOutUser,
};
