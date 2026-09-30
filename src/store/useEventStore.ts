import { create } from "zustand";
import { RootStore } from "./types";
import { createEventSlice } from "./slices/eventSlice";
import { createActivitySlice } from "./slices/activitySlice";
import { createGroupSlice } from "./slices/groupSlice";
import { createParticipantSlice } from "./slices/participantSlice";

export const useEventStore = create<RootStore>((...a) => ({
  ...createEventSlice(...a),
  ...createActivitySlice(...a),
  ...createGroupSlice(...a),
  ...createParticipantSlice(...a),
}));
