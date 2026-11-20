import { describe, it, expect, beforeEach } from "vitest";
import { useEventStore } from "../useEventStore";
import { mockIPC } from "@tauri-apps/api/mocks";
import { EventItem } from "../../types/event";

describe("eventSlice", () => {
  const sampleEvent: EventItem = {
    id: "evt-1",
    name: "Camp 2026",
    eventDate: "2026/08/10",
    lastEdited: "2026-08-01T00:00:00Z",
    location: "Camp Site",
    settings: { groupsEnabled: true },
  };

  beforeEach(() => {
    // Reset store state
    useEventStore.setState({
      events: [],
      selectedEventId: null,
      loading: false,
      error: null,
    });
  });

  it("selects an event by ID", () => {
    useEventStore.getState().selectEvent("evt-1");
    expect(useEventStore.getState().selectedEventId).toBe("evt-1");

    useEventStore.getState().selectEvent(null);
    expect(useEventStore.getState().selectedEventId).toBeNull();
  });

  it("fetches events successfully via Tauri IPC", async () => {
    mockIPC((cmd) => {
      if (cmd === "get_events") {
        return [sampleEvent];
      }
    });

    await useEventStore.getState().fetchEvents();

    expect(useEventStore.getState().events).toHaveLength(1);
    expect(useEventStore.getState().events[0].id).toBe("evt-1");
    expect(useEventStore.getState().loading).toBe(false);
    expect(useEventStore.getState().error).toBeNull();
  });

  it("handles fetchEvents error gracefully", async () => {
    mockIPC((cmd) => {
      if (cmd === "get_events") {
        throw new Error("DB read error");
      }
    });

    await useEventStore.getState().fetchEvents();

    expect(useEventStore.getState().events).toEqual([]);
    expect(useEventStore.getState().loading).toBe(false);
    expect(useEventStore.getState().error).toBe("Failed to load events");
  });

  it("optimistically adds event and persists via IPC", async () => {
    let invokedCmd: string | null = null;
    let invokedPayload: unknown = null;

    mockIPC((cmd, args) => {
      if (cmd === "create_event") {
        invokedCmd = cmd;
        invokedPayload = args;
        return undefined;
      }
    });

    await useEventStore.getState().createEvent(sampleEvent);

    expect(useEventStore.getState().events).toContainEqual(sampleEvent);
    expect(invokedCmd).toBe("create_event");
    expect(invokedPayload).toEqual({ item: sampleEvent });
  });

  it("rolls back optimistic add on createEvent failure", async () => {
    mockIPC((cmd) => {
      if (cmd === "create_event") {
        throw new Error("DB write failed");
      }
    });

    await useEventStore.getState().createEvent(sampleEvent);

    expect(useEventStore.getState().events).toEqual([]);
    expect(useEventStore.getState().error).toBe("Failed to save event");
  });

  it("deletes event optimistically and invokes IPC", async () => {
    useEventStore.setState({ events: [sampleEvent], selectedEventId: "evt-1" });

    let deletedId: string | null = null;
    mockIPC((cmd, args) => {
      if (cmd === "delete_event") {
        deletedId = (args as { id: string }).id;
        return undefined;
      }
    });

    await useEventStore.getState().deleteEvent("evt-1");

    expect(useEventStore.getState().events).toHaveLength(0);
    expect(useEventStore.getState().selectedEventId).toBeNull();
    expect(deletedId).toBe("evt-1");
  });

  it("updates event in store and calls update_event IPC", async () => {
    useEventStore.setState({ events: [sampleEvent] });

    const updatedEvent = { ...sampleEvent, name: "Camp 2026 Updated" };
    let updatedPayload: unknown = null;
    mockIPC((cmd, args) => {
      if (cmd === "update_event") {
        updatedPayload = args;
        return undefined;
      }
    });

    await useEventStore.getState().updateEvent(updatedEvent);

    expect(useEventStore.getState().events[0].name).toBe("Camp 2026 Updated");
    expect(updatedPayload).toEqual({ item: updatedEvent });
  });

  it("updates event settings in store and calls update_event_settings IPC", async () => {
    useEventStore.setState({ events: [sampleEvent] });

    mockIPC((cmd) => {
      if (cmd === "update_event_settings") {
        return undefined;
      }
    });

    await useEventStore.getState().updateEventSettings("evt-1", { groupsEnabled: false });

    expect(useEventStore.getState().events[0].settings.groupsEnabled).toBe(false);
  });
});
