import { describe, it, expect, beforeEach } from "vitest";
import { useEventStore } from "../useEventStore";
import { mockIPC } from "@tauri-apps/api/mocks";
import { ActivityItem } from "../../types/event";

describe("activitySlice", () => {
  const sampleActivity: ActivityItem = {
    id: "act-1",
    eventId: "evt-1",
    title: "Opening Ceremony",
    dayDate: "2026-08-10",
    startTime: "09:00",
    endTime: "10:30",
    color: "bg-indigo-500 text-white",
    description: "Welcome speech",
    personInCharge: "Alice",
  };

  beforeEach(() => {
    useEventStore.setState({
      activities: [],
      activityHistory: [],
    });
  });

  it("fetches activities for an event via IPC", async () => {
    mockIPC((cmd, args) => {
      if (cmd === "get_activities" && (args as { eventId: string }).eventId === "evt-1") {
        return [sampleActivity];
      }
      return [];
    });

    await useEventStore.getState().fetchActivities("evt-1");

    expect(useEventStore.getState().activities).toHaveLength(1);
    expect(useEventStore.getState().activities[0].title).toBe("Opening Ceremony");
  });

  it("creates activity and tracks history", async () => {
    mockIPC((cmd) => {
      if (cmd === "create_activity") return undefined;
    });

    await useEventStore.getState().createActivity(sampleActivity);

    expect(useEventStore.getState().activities).toHaveLength(1);
    expect(useEventStore.getState().activityHistory).toHaveLength(1);
    expect(useEventStore.getState().activityHistory[0]).toEqual({
      type: "CREATE",
      activity: sampleActivity,
    });
  });

  it("deletes activity and tracks history", async () => {
    useEventStore.setState({ activities: [sampleActivity] });

    mockIPC((cmd) => {
      if (cmd === "delete_activity") return undefined;
    });

    await useEventStore.getState().deleteActivity("act-1");

    expect(useEventStore.getState().activities).toHaveLength(0);
    expect(useEventStore.getState().activityHistory).toHaveLength(1);
    expect(useEventStore.getState().activityHistory[0]).toEqual({
      type: "DELETE",
      activity: sampleActivity,
    });
  });

  it("undoes CREATE action by deleting the created activity", async () => {
    useEventStore.setState({
      activities: [sampleActivity],
      activityHistory: [{ type: "CREATE", activity: sampleActivity }],
    });

    let deletedId: string | null = null;
    mockIPC((cmd, args) => {
      if (cmd === "delete_activity") {
        deletedId = (args as { id: string }).id;
        return undefined;
      }
    });

    await useEventStore.getState().undoActivity();

    expect(useEventStore.getState().activities).toHaveLength(0);
    expect(useEventStore.getState().activityHistory).toHaveLength(0);
    expect(deletedId).toBe("act-1");
  });

  it("undoes DELETE action by re-creating the deleted activity", async () => {
    useEventStore.setState({
      activities: [],
      activityHistory: [{ type: "DELETE", activity: sampleActivity }],
    });

    let recreatedItem: unknown = null;
    mockIPC((cmd, args) => {
      if (cmd === "create_activity") {
        recreatedItem = (args as { item: ActivityItem }).item;
        return undefined;
      }
    });

    await useEventStore.getState().undoActivity();

    expect(useEventStore.getState().activities).toHaveLength(1);
    expect(useEventStore.getState().activityHistory).toHaveLength(0);
    expect(recreatedItem).toEqual(sampleActivity);
  });

  it("updates activity optimistically and calls update_activity IPC", async () => {
    useEventStore.setState({ activities: [sampleActivity] });

    const updated = { ...sampleActivity, title: "Opening Ceremony 2.0" };
    mockIPC((cmd) => {
      if (cmd === "update_activity") return undefined;
    });

    await useEventStore.getState().updateActivity(updated);

    expect(useEventStore.getState().activities[0].title).toBe("Opening Ceremony 2.0");
  });
});
