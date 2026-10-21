import { invoke } from "@tauri-apps/api/core";
import { EventTabItem } from "../../types/event";
import { StateSlice } from "../types";

export interface TabSlice {
  eventTabs: Record<string, EventTabItem[]>;
  loadingTabs: boolean;
  tabError: string | null;
  fetchEventTabs: (eventId: string) => Promise<void>;
  updateTabLabel: (tabId: string, eventId: string, newLabel: string) => Promise<void>;
}

export const createTabSlice: StateSlice<TabSlice> = (set, get) => ({
  eventTabs: {},
  loadingTabs: false,
  tabError: null,

  fetchEventTabs: async (eventId) => {
    set({ loadingTabs: true, tabError: null });
    try {
      const tabs = await invoke<EventTabItem[]>("get_event_tabs", { eventId });
      set((state) => ({
        eventTabs: { ...state.eventTabs, [eventId]: tabs },
        loadingTabs: false,
      }));
    } catch (err) {
      console.error("Failed to fetch event tabs:", err);
      set({ tabError: "Failed to load event tabs", loadingTabs: false });
    }
  },

  updateTabLabel: async (tabId, eventId, newLabel) => {
    const currentTabs = get().eventTabs[eventId] || [];
    const previousTabsMap = { ...get().eventTabs };

    const updatedTabs = currentTabs.map((tab) =>
      tab.id === tabId ? { ...tab, label: newLabel } : tab
    );

    set((state) => ({
      eventTabs: { ...state.eventTabs, [eventId]: updatedTabs },
    }));

    try {
      await invoke("update_tab_label", { tabId, label: newLabel });
    } catch (err) {
      console.error("Failed to update tab label:", err);
      set({ eventTabs: previousTabsMap, tabError: "Failed to update tab label" });
    }
  },
});
