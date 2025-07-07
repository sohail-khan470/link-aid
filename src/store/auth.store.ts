// src/stores/auth.store.ts
import { create } from "zustand";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { authService } from "../services/auth.service";
import UserService from "../services/user.service";
const userService = new UserService();

interface UserProfile {
  email: string;
  fullName: string;
  username: string;
  language?: string;
  phone?: string | null;
  role?: string;
  theme?: string;
  createdAt: Date;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  userProfile: UserProfile | null;
  signUp: (userData: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  initializeAuth: () => void; // New method to initialize auth listener
  fetchUserProfile: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  initialized: false, // Starts as false
  error: null,
  userProfile: null,

  // Initialize auth state listener
  initializeAuth: () => {
    if (useAuthStore.getState().initialized) return;

    set({ loading: true });

    // Store the unsubscribe function in the store
    let unsubscribe: () => void;

    const listener = onAuthStateChanged(auth, (user) => {
      set({ user, loading: false, initialized: true });
    });

    unsubscribe = listener; // Store the unsubscribe function
    return () => unsubscribe(); // Return a function that calls unsubscribe
  },

  signUp: async (userData) => {
    set({ loading: true, error: null });
    try {
      const user = await authService.signUp(userData);

      set({ user, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : String(error),
        loading: false,
      });
      throw error;
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const user = await authService.signIn(email, password);
      set({ user, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : String(error),
        loading: false,
      });
      throw error;
    }
  },

  signInWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const user = await authService.signInWithGoogle();
      set({ user, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : String(error),
        loading: false,
      });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await authService.signOut();
      set({ user: null, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : String(error),
        loading: false,
      });
      throw error;
    }
  },

  // Method to fetch user profile
  fetchUserProfile: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const profile = (await userService.getUserProfile(userId)) as any;
      set({ userProfile: profile, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : String(error),
        loading: false,
      });
      throw error;
    }
  },

  setUser: (user) => set({ user }),
  setUserProfile: (profile: UserProfile) => set({ userProfile: profile }),
}));

// Initialize auth listener when store is created
const unsubscribe = useAuthStore.getState().initializeAuth();

// Optional: Cleanup when store is destroyed (if needed)
// This would be used if your store might be destroyed during app lifecycle
// if (import.meta.hot) {
//   import.meta.hot.dispose(unsubscribe);
// }
