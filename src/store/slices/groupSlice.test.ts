import { describe, it, expect, beforeEach } from "vitest";
import { useEventStore } from "../useEventStore";
import { mockIPC } from "@tauri-apps/api/mocks";
import { GroupItem } from "../../types/participant";

describe("groupSlice", () => {
  const sampleGroup: GroupItem = {
    id: "grp-1",
    eventId: "evt-1",
    name: "Team Alpha",
    position: 0,
  };

  beforeEach(() => {
    useEventStore.setState({ groups: [] });
  });

  it("fetches groups for an event", async () => {
    mockIPC((cmd) => {
      if (cmd === "get_groups") return [sampleGroup];
      return [];
    });

    await useEventStore.getState().fetchGroups("evt-1");

    expect(useEventStore.getState().groups).toHaveLength(1);
    expect(useEventStore.getState().groups[0].name).toBe("Team Alpha");
  });

  it("creates a group and assigns position", async () => {
    mockIPC((cmd) => {
      if (cmd === "create_group") return undefined;
    });

    await useEventStore.getState().createGroup({
      id: "grp-1",
      eventId: "evt-1",
      name: "Team Alpha",
      position: 0,
    });

    expect(useEventStore.getState().groups).toHaveLength(1);
    expect(useEventStore.getState().groups[0].position).toBe(0);
  });

  it("updates a group name", async () => {
    useEventStore.setState({ groups: [sampleGroup] });

    mockIPC((cmd) => {
      if (cmd === "update_group") return undefined;
    });

    await useEventStore.getState().updateGroup("grp-1", "Team Phoenix");

    expect(useEventStore.getState().groups[0].name).toBe("Team Phoenix");
  });

  it("deletes a group", async () => {
    useEventStore.setState({ groups: [sampleGroup] });

    mockIPC((cmd) => {
      if (cmd === "delete_group") return undefined;
    });

    await useEventStore.getState().deleteGroup("grp-1");

    expect(useEventStore.getState().groups).toHaveLength(0);
  });

  it("reorders groups and updates their positions", async () => {
    const group2: GroupItem = {
      id: "grp-2",
      eventId: "evt-1",
      name: "Team Beta",
      position: 1,
    };
    useEventStore.setState({ groups: [sampleGroup, group2] });

    let reorderedIds: string[] = [];
    mockIPC((cmd, args) => {
      if (cmd === "reorder_groups") {
        reorderedIds = (args as { groupIds: string[] }).groupIds;
        return undefined;
      }
    });

    await useEventStore.getState().reorderGroups(["grp-2", "grp-1"]);

    const state = useEventStore.getState().groups;
    expect(state[0].id).toBe("grp-2");
    expect(state[0].position).toBe(0);
    expect(state[1].id).toBe("grp-1");
    expect(state[1].position).toBe(1);
    expect(reorderedIds).toEqual(["grp-2", "grp-1"]);
  });
});
