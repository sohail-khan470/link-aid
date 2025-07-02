// src/stores/auth.store.ts
import { create } from "zustand";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import AuthService from "../services/auth.service";

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean; // New state to track if auth check is complete
  error: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  initializeAuth: () => void; // New method to initialize auth listener
}

const authService = new AuthService(auth);

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  initialized: false, // Starts as false
  error: null,

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

  signUp: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const user = await authService.signUp(email, password);
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

  setUser: (user) => set({ user }),
}));

// Initialize auth listener when store is created
const unsubscribe = useAuthStore.getState().initializeAuth();

// Optional: Cleanup when store is destroyed (if needed)
// This would be used if your store might be destroyed during app lifecycle
// if (import.meta.hot) {
//   import.meta.hot.dispose(unsubscribe);
// }
