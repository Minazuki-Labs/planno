import { invoke } from "@tauri-apps/api/core";
import { ParticipantItem } from "../../types/participant";
import { StateSlice } from "../types";

export interface ParticipantSlice {
  participants: ParticipantItem[];
  fetchParticipants: (eventId: string) => Promise<void>;
  createParticipant: (participant: ParticipantItem) => Promise<void>;
  deleteParticipant: (id: string) => Promise<void>;
  updateParticipant: (participant: ParticipantItem) => Promise<void>;
}

export const createParticipantSlice: StateSlice<ParticipantSlice> = (set, get) => ({
  participants: [],

  fetchParticipants: async (eventId) => {
    try {
      const participants = await invoke<ParticipantItem[]>("get_participants", { eventId });
      set({ participants });
    } catch (err) {
      console.error("Failed to fetch participants:", err);
    }
  },

  createParticipant: async (participant) => {
    const previous = get().participants;
    set({ participants: [...previous, participant] });
    try {
      await invoke("create_participant", { item: participant });
    } catch (err) {
      console.error("Failed to create participant:", err);
      set({ participants: previous });
    }
  },

  deleteParticipant: async (id) => {
    const previous = get().participants;
    set({ participants: previous.filter((p) => p.id !== id) });
    try {
      await invoke("delete_participant", { id });
    } catch (err) {
      console.error("Failed to delete participant:", err);
      set({ participants: previous });
    }
  },

  updateParticipant: async (participant) => {
    const previous = get().participants;
    set({
      participants: previous.map((p) => (p.id === participant.id ? participant : p)),
    });
    try {
      await invoke("update_participant", { item: participant });
    } catch (err) {
      console.error("Failed to update participant:", err);
      set({ participants: previous });
    }
  },
});
