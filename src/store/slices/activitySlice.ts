import { invoke } from "@tauri-apps/api/core";
import { ActivityItem } from "../../types/event";
import { StateSlice } from "../types";

type HistoryAction =
  | { type: "CREATE"; activity: ActivityItem }
  | { type: "DELETE"; activity: ActivityItem };

export interface ActivitySlice {
  activities: ActivityItem[];
  activityHistory: HistoryAction[];
  fetchActivities: (eventId: string) => Promise<void>;
  createActivity: (activity: ActivityItem, recordHistory?: boolean) => Promise<void>;
  deleteActivity: (id: string, recordHistory?: boolean) => Promise<void>;
  undoActivity: () => Promise<void>;
  updateActivity: (activity: ActivityItem) => Promise<void>;
}

export const createActivitySlice: StateSlice<ActivitySlice> = (set, get) => ({
  activities: [],
  activityHistory: [],

  fetchActivities: async (eventId) => {
    try {
      const activities = await invoke<ActivityItem[]>("get_activities", { eventId });
      set({ activities, activityHistory: [] });
    } catch (err) {
      console.error("Failed to fetch activities:", err);
    }
  },

  createActivity: async (activity, recordHistory = true) => {
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

  deleteActivity: async (id, recordHistory = true) => {
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

  updateActivity: async (updatedActivity) => {
    const previous = get().activities;
    set({
      activities: previous.map((a) => (a.id === updatedActivity.id ? updatedActivity : a)),
    });
    try {
      await invoke("update_activity", { item: updatedActivity });
    } catch (err) {
      console.error("Failed to update activity:", err);
      set({ activities: previous });
    }
  },
});
