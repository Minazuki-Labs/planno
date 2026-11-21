import { describe, it, expect, beforeEach } from "vitest";
import { useEventStore } from "../useEventStore";
import { mockIPC } from "@tauri-apps/api/mocks";
import { ParticipantItem } from "../../types/participant";

describe("participantSlice", () => {
  const sampleParticipant: ParticipantItem = {
    id: "part-1",
    eventId: "evt-1",
    groupId: "grp-1",
    name: "John Doe",
    role: "leader",
  };

  beforeEach(() => {
    useEventStore.setState({ participants: [] });
  });

  it("fetches participants for an event", async () => {
    mockIPC((cmd) => {
      if (cmd === "get_participants") return [sampleParticipant];
      return [];
    });

    await useEventStore.getState().fetchParticipants("evt-1");

    expect(useEventStore.getState().participants).toHaveLength(1);
    expect(useEventStore.getState().participants[0].name).toBe("John Doe");
    expect(useEventStore.getState().participants[0].role).toBe("leader");
  });

  it("creates a participant", async () => {
    mockIPC((cmd) => {
      if (cmd === "create_participant") return undefined;
    });

    await useEventStore.getState().createParticipant(sampleParticipant);

    expect(useEventStore.getState().participants).toHaveLength(1);
    expect(useEventStore.getState().participants[0].id).toBe("part-1");
  });

  it("updates a participant", async () => {
    useEventStore.setState({ participants: [sampleParticipant] });

    const updated: ParticipantItem = { ...sampleParticipant, role: "teacher" };
    mockIPC((cmd) => {
      if (cmd === "update_participant") return undefined;
    });

    await useEventStore.getState().updateParticipant(updated);

    expect(useEventStore.getState().participants[0].role).toBe("teacher");
  });

  it("deletes a participant", async () => {
    useEventStore.setState({ participants: [sampleParticipant] });

    mockIPC((cmd) => {
      if (cmd === "delete_participant") return undefined;
    });

    await useEventStore.getState().deleteParticipant("part-1");

    expect(useEventStore.getState().participants).toHaveLength(0);
  });
});
