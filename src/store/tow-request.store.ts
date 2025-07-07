// src/stores/users.store.ts
import { create } from "zustand";
import { TowRequest } from "../pages/types/TowReuest";
import TowRequestService from "../services/tow-request.service";
interface TowRequestState {
  towRequests: TowRequest[];
  loading: boolean;
  error: string | null;
  fetAllTowRequests: () => Promise<void>;
}

const towRequestService = new TowRequestService();

export const useIncidentsStore = create<TowRequestState>((set) => ({
  towRequests: [],
  loading: false,
  error: null,

  async fetAllTowRequests() {
    set({ loading: true, error: null });
    const towRequests = await towRequestService.getAllTowRequests();
    set({ towRequests, loading: false });
  },
}));
