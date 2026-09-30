import { invoke } from "@tauri-apps/api/core";
import { GroupItem } from "../../types/participant";
import { StateSlice } from "../types";

export interface GroupSlice {
  groups: GroupItem[];
  fetchGroups: (eventId: string) => Promise<void>;
  createGroup: (group: GroupItem) => Promise<void>;
  updateGroup: (id: string, name: string) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  reorderGroups: (groupIds: string[]) => Promise<void>;
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
    const newGroup: GroupItem = {
      ...group,
      position: group.position ?? previous.length,
    };

    set({ groups: [...previous, newGroup] });
    try {
      await invoke("create_group", { item: newGroup });
    } catch (err) {
      console.error("Failed to create group:", err);
      set({ groups: previous });
    }
  },

  updateGroup: async (id, name) => {
    const previous = get().groups;
    set({
      groups: previous.map((g) => (g.id === id ? { ...g, name } : g)),
    });
    try {
      await invoke("update_group", { id, name });
    } catch (err) {
      console.error("Failed to update group:", err);
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

  reorderGroups: async (groupIds: string[]) => {
    const previous = get().groups;

    // Optimistically reorder groups based on the provided ID array
    const groupMap = new Map(previous.map((g) => [g.id, g]));
    const reordered: GroupItem[] = [];

    groupIds.forEach((id, index) => {
      const group = groupMap.get(id);
      if (group) {
        reordered.push({ ...group, position: index });
        groupMap.delete(id);
      }
    });

    // Append any unreferenced groups at the end
    groupMap.forEach((group) => {
      reordered.push({ ...group, position: reordered.length });
    });

    set({ groups: reordered });

    try {
      await invoke("reorder_groups", { groupIds });
    } catch (err) {
      console.error("Failed to reorder groups:", err);
      set({ groups: previous });
    }
  },
});
