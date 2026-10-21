import { invoke } from "@tauri-apps/api/core";
import { EventTabItem } from "../../types/event";
import { StateSlice } from "../types";

export interface TabSlice {
  eventTabs: Record<string, EventTabItem[]>;
  loadingTabs: boolean;
  tabError: string | null;
  fetchEventTabs: (eventId: string) => Promise<void>;
  createTab: (tab: EventTabItem) => Promise<void>;
  deleteTab: (tabId: string, eventId: string) => Promise<void>;
  updateTab: (tab: EventTabItem) => Promise<void>;
  reorderTabs: (eventId: string, orderedTabs: EventTabItem[]) => Promise<void>;
}

export const createTabSlice: StateSlice<TabSlice> = (set, get) => ({
  eventTabs: {},
  loadingTabs: false,
  tabError: null,

  fetchEventTabs: async (eventId) => {
    set({ loadingTabs: true, tabError: null });
    try {
      const tabs = await invoke<EventTabItem[]>("get_event_tabs", { eventId });
      const sortedTabs = tabs.sort((a, b) => a.position - b.position);
      set((state) => ({
        eventTabs: { ...state.eventTabs, [eventId]: sortedTabs },
        loadingTabs: false,
      }));
    } catch (err) {
      console.error("Failed to fetch event tabs:", err);
      set({ tabError: "Failed to load event tabs", loadingTabs: false });
    }
  },

  createTab: async (tab) => {
    const eventId = tab.eventId;
    const currentTabs = get().eventTabs[eventId] || [];
    const previousTabsMap = { ...get().eventTabs };

    const newTabs = [...currentTabs, tab].sort((a, b) => a.position - b.position);

    set((state) => ({
      eventTabs: { ...state.eventTabs, [eventId]: newTabs },
    }));

    try {
      await invoke("create_event_tab", { item: tab });
    } catch (err) {
      console.error("Failed to create tab:", err);
      set({ eventTabs: previousTabsMap, tabError: "Failed to create tab" });
    }
  },

  deleteTab: async (tabId, eventId) => {
    const currentTabs = get().eventTabs[eventId] || [];
    const previousTabsMap = { ...get().eventTabs };

    set((state) => ({
      eventTabs: {
        ...state.eventTabs,
        [eventId]: currentTabs.filter((t) => t.id !== tabId),
      },
    }));

    try {
      await invoke("delete_event_tab", { tabId });
    } catch (err) {
      console.error("Failed to delete tab:", err);
      set({ eventTabs: previousTabsMap, tabError: "Failed to delete tab" });
    }
  },

  updateTab: async (updatedTab) => {
    const eventId = updatedTab.eventId;
    const currentTabs = get().eventTabs[eventId] || [];
    const previousTabsMap = { ...get().eventTabs };

    const updatedTabs = currentTabs
      .map((t) => (t.id === updatedTab.id ? updatedTab : t))
      .sort((a, b) => a.position - b.position);

    set((state) => ({
      eventTabs: {
        ...state.eventTabs,
        [eventId]: updatedTabs,
      },
    }));

    try {
      await invoke("update_event_tab", { item: updatedTab });
    } catch (err) {
      console.error("Failed to update tab:", err);
      set({ eventTabs: previousTabsMap, tabError: "Failed to update tab" });
    }
  },

  reorderTabs: async (eventId, orderedTabs) => {
    const previousTabsMap = { ...get().eventTabs };

    set((state) => ({
      eventTabs: {
        ...state.eventTabs,
        [eventId]: orderedTabs,
      },
    }));

    try {
      await invoke("reorder_event_tabs", { items: orderedTabs });
    } catch (err) {
      console.error("Failed to reorder tabs:", err);
      set({ eventTabs: previousTabsMap, tabError: "Failed to reorder tabs" });
    }
  },
});
