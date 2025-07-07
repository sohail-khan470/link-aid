// src/stores/users.store.ts
import { create } from "zustand";
import { UserProfile } from "firebase/auth";
import UserService from "../services/user.service";
interface UsersState {
  users: UserProfile[];
  loading: boolean;
  error: string | null;
  fetchAllUsers: () => Promise<void>;
}
const userService = new UserService();

export const useUsersStore = create<UsersState>((set) => ({
  users: [],
  loading: false,
  error: null,

  fetchAllUsers: async () => {
    set({ loading: true, error: null });
    try {
      const users = await userService.getAllUsers();
      set({ users, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : String(error),
        loading: false,
      });
    }
  },
}));
