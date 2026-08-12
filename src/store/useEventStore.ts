import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { EventItem, ActivityItem } from "../types/event";

interface EventState {
  events: EventItem[];
  activities: ActivityItem[];
  selectedEventId: string | null;
  loading: boolean;
  error: string | null;

  // Event Actions
  fetchEvents: () => Promise<void>;
  selectEvent: (id: string | null) => void;
  createEvent: (newEvent: EventItem) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  updateEvent: (updatedEvent: EventItem) => Promise<void>;

  // Activity Actions
  fetchActivities: (eventId: string) => Promise<void>;
  createActivity: (activity: ActivityItem) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  activities: [],
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

  createEvent: async (newEvent: EventItem) => {
    const previousEvents = get().events;
    
    set({ events: [newEvent, ...previousEvents] });

    try {
      await invoke("create_event", { item: newEvent });
    } catch (err) {
      console.error("Failed to create event in database:", err);
      set({ events: previousEvents, error: "Failed to save event" });
    }
  },

  deleteEvent: async (id: string) => {
    const previousEvents = get().events;

    set({
      events: previousEvents.filter((e) => e.id !== id),
      selectedEventId: get().selectedEventId === id ? null : get().selectedEventId,
    });

    try {
      await invoke("delete_event", { id });
    } catch (err) {
      console.error("Failed to delete event from database:", err);
      set({ events: previousEvents, error: "Failed to delete event" });
    }
  },

  updateEvent: async (updatedEvent: EventItem) => {
    const previousEvents = get().events;

    set({
      events: previousEvents.map((e) =>
        e.id === updatedEvent.id ? updatedEvent : e
      ),
    });

    try {
      await invoke("update_event", { item: updatedEvent });
    } catch (err) {
      console.error("Failed to update event in database:", err);
      set({ events: previousEvents, error: "Failed to update event" });
    }
  },

  // Schedule Activity handlers
  fetchActivities: async (eventId: string) => {
    try {
      const activities = await invoke<ActivityItem[]>("get_activities", { eventId });
      set({ activities });
    } catch (err) {
      console.error("Failed to fetch activities:", err);
    }
  },

  createActivity: async (activity: ActivityItem) => {
    const previous = get().activities;
    set({ activities: [...previous, activity] });
    try {
      await invoke("create_activity", { item: activity });
    } catch (err) {
      console.error("Failed to create activity:", err);
      set({ activities: previous });
    }
  },

  deleteActivity: async (id: string) => {
    const previous = get().activities;
    set({ activities: previous.filter((a) => a.id !== id) });
    try {
      await invoke("delete_activity", { id });
    } catch (err) {
      console.error("Failed to delete activity:", err);
      set({ activities: previous });
    }
  },
}));
