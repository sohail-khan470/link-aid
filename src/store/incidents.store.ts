// src/stores/users.store.ts
import { create } from "zustand";
import IncidentService from "../services/incidents.service";
import { Incident } from "./types/incident.type";
interface IncidentsState {
  incidents: Incident[];
  loading: boolean;
  error: string | null;
  fetchAllIncidents: () => Promise<void>;
}

const incidentService = new IncidentService();

export const useIncidentsStore = create<IncidentsState>((set) => ({
  incidents: [],
  loading: false,
  error: null,

  async fetchAllIncidents() {
    set({ loading: true, error: null });
    const incidents = await incidentService.getAllIncidents();
    set({ incidents, loading: false });
  },
}));
