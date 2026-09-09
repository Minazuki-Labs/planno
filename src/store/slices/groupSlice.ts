import { invoke } from "@tauri-apps/api/core";
import { GroupItem } from "../../types/participant";
import { StateSlice } from "../types";

export interface GroupSlice {
  groups: GroupItem[];
  fetchGroups: (eventId: string) => Promise<void>;
  createGroup: (group: GroupItem) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
}

export const createGroupSlice: StateSlice<GroupSlice> = (set, get) => ({
  groups: [],

  fetchGroups: async (eventId) => {
    try {
      const groups = await invoke<GroupItem[]>("get_groups", { eventId });
      set({ groups });
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    }
  },

  createGroup: async (group) => {
    const previous = get().groups;
    set({ groups: [...previous, group] });
    try {
      await invoke("create_group", { item: group });
    } catch (err) {
      console.error("Failed to create group:", err);
      set({ groups: previous });
    }
  },

  deleteGroup: async (id) => {
    const previous = get().groups;
    set({ groups: previous.filter((g) => g.id !== id) });
    try {
      await invoke("delete_group", { id });
    } catch (err) {
      console.error("Failed to delete group:", err);
      set({ groups: previous });
    }
  },
});
