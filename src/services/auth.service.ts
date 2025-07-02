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

class AuthService {
  private auth: Auth;

  constructor(auth: Auth) {
    this.auth = auth;
  }

  // Email/Password Sign Up
  async signUp(email: string, password: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Email/Password Sign In
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Google Sign-In
  async signInWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(this.auth, provider);
      return userCredential.user;
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Sign Out
  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Helper method to handle error messages
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return "An unknown error occurred";
  }
}

export default AuthService;
