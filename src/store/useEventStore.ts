import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { EventItem, ActivityItem } from "../types/event";
import { GroupItem, ParticipantItem } from "../types/participant";

type HistoryAction = 
  | { type: "CREATE"; activity: ActivityItem }
  | { type: "DELETE"; activity: ActivityItem };

interface EventState {
  events: EventItem[];
  activities: ActivityItem[];
  groups: GroupItem[];
  participants: ParticipantItem[];
  activityHistory: HistoryAction[];
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
  createActivity: (activity: ActivityItem, recordHistory?: boolean) => Promise<void>;
  deleteActivity: (id: string, recordHistory?: boolean) => Promise<void>;
  undoActivity: () => Promise<void>;
  updateActivity: (activity: ActivityItem) => Promise<void>;

  // Group Actions
  fetchGroups: (eventId: string) => Promise<void>;
  createGroup: (group: GroupItem) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;

  // Participant Actions
  fetchParticipants: (eventId: string) => Promise<void>;
  createParticipant: (participant: ParticipantItem) => Promise<void>;
  deleteParticipant: (id: string) => Promise<void>;
  updateParticipant: (participant: ParticipantItem) => Promise<void>;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  activities: [],
  groups: [],
  participants: [],
  activityHistory: [],
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
      set({ activities, activityHistory: [] }); // Reset history when switching event
    } catch (err) {
      console.error("Failed to fetch activities:", err);
    }
  },

  createActivity: async (activity: ActivityItem, recordHistory = true) => {
    const previous = get().activities;
    set({
      activities: [...previous, activity],
      activityHistory: recordHistory
        ? [...get().activityHistory, { type: "CREATE", activity }]
        : get().activityHistory,
    });
    try {
      await invoke("create_activity", { item: activity });
    } catch (err) {
      console.error("Failed to create activity:", err);
      set({ activities: previous });
    }
  },

  deleteActivity: async (id: string, recordHistory = true) => {
    const targetActivity = get().activities.find((a) => a.id === id);
    if (!targetActivity) return;

    const previous = get().activities;
    set({
      activities: previous.filter((a) => a.id !== id),
      activityHistory: recordHistory
        ? [...get().activityHistory, { type: "DELETE", activity: targetActivity }]
        : get().activityHistory,
    });
    try {
      await invoke("delete_activity", { id });
    } catch (err) {
      console.error("Failed to delete activity:", err);
      set({ activities: previous });
    }
  },

  undoActivity: async () => {
    const { activityHistory } = get();
    if (activityHistory.length === 0) return;

    const lastAction = activityHistory[activityHistory.length - 1];
    set({ activityHistory: activityHistory.slice(0, -1) });

    if (lastAction.type === "CREATE") {
      await get().deleteActivity(lastAction.activity.id, false);
    } else if (lastAction.type === "DELETE") {
      await get().createActivity(lastAction.activity, false);
    }
  },

  updateActivity: async (updatedActivity: ActivityItem) => {
    const previous = get().activities;
    set({
      activities: previous.map((a) =>
        a.id === updatedActivity.id ? updatedActivity : a
      ),
    });
    try {
      await invoke("update_activity", { item: updatedActivity });
    } catch (err) {
      console.error("Failed to update activity:", err);
      set({ activities: previous });
    }
  },

  // Group handlers
  fetchGroups: async (eventId: string) => {
    try {
      const groups = await invoke<GroupItem[]>("get_groups", { eventId });
      set({ groups });
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    }
  },

  createGroup: async (group: GroupItem) => {
    const previous = get().groups;
    set({ groups: [...previous, group] });
    try {
      await invoke("create_group", { item: group });
    } catch (err) {
      console.error("Failed to create group:", err);
      set({ groups: previous });
    }
  },

  deleteGroup: async (id: string) => {
    const previous = get().groups;
    set({ groups: previous.filter((g) => g.id !== id) });
    try {
      await invoke("delete_group", { id });
    } catch (err) {
      console.error("Failed to delete group:", err);
      set({ groups: previous });
    }
  },

  // Participant handlers
  fetchParticipants: async (eventId: string) => {
    try {
      const participants = await invoke<ParticipantItem[]>("get_participants", { eventId });
      set({ participants });
    } catch (err) {
      console.error("Failed to fetch participants:", err);
    }
  },

  createParticipant: async (participant: ParticipantItem) => {
    const previous = get().participants;
    set({ participants: [...previous, participant] });
    try {
      await invoke("create_participant", { item: participant });
    } catch (err) {
      console.error("Failed to create participant:", err);
      set({ participants: previous });
    }
  },

  deleteParticipant: async (id: string) => {
    const previous = get().participants;
    set({ participants: previous.filter((p) => p.id !== id) });
    try {
      await invoke("delete_participant", { id });
    } catch (err) {
      console.error("Failed to delete participant:", err);
      set({ participants: previous });
    }
  },

  updateParticipant: async (participant: ParticipantItem) => {
    const previous = get().participants;
    set({
      participants: previous.map((p) =>
        p.id === participant.id ? participant : p
      ),
    });
    try {
      await invoke("update_participant", { item: participant });
    } catch (err) {
      console.error("Failed to update participant:", err);
      set({ participants: previous });
    }
  },
}));
