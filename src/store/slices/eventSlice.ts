import { invoke } from "@tauri-apps/api/core";
import { EventItem } from "../../types/event";
import { StateSlice } from "../types";

export interface EventSlice {
  events: EventItem[];
  selectedEventId: string | null;
  loading: boolean;
  error: string | null;
  selectEvent: (id: string | null) => void;
  fetchEvents: () => Promise<void>;
  createEvent: (newEvent: EventItem) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  updateEvent: (updatedEvent: EventItem) => Promise<void>;
}

export const createEventSlice: StateSlice<EventSlice> = (set, get) => ({
  events: [],
  selectedEventId: null,
  loading: false,
  error: null,

  selectEvent: (id) => set({ selectedEventId: id }),

  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      const events = await invoke<EventItem[]>("get_events");
      set({ events, loading: false });
    } catch (err) {
      console.error("Failed to fetch events:", err);
      set({ error: "Failed to load events", loading: false });
    }
  },

  createEvent: async (newEvent) => {
    const previousEvents = get().events;
    set({ events: [newEvent, ...previousEvents] });
    try {
      await invoke("create_event", { item: newEvent });
    } catch (err) {
      console.error("Failed to create event:", err);
      set({ events: previousEvents, error: "Failed to save event" });
    }
  },

  deleteEvent: async (id) => {
    const previousEvents = get().events;
    set({
      events: previousEvents.filter((e) => e.id !== id),
      selectedEventId: get().selectedEventId === id ? null : get().selectedEventId,
    });
    try {
      await invoke("delete_event", { id });
    } catch (err) {
      console.error("Failed to delete event:", err);
      set({ events: previousEvents, error: "Failed to delete event" });
    }
  },

  updateEvent: async (updatedEvent) => {
    const previousEvents = get().events;
    set({
      events: previousEvents.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)),
    });
    try {
      await invoke("update_event", { item: updatedEvent });
    } catch (err) {
      console.error("Failed to update event:", err);
      set({ events: previousEvents, error: "Failed to update event" });
    }
  },
});
