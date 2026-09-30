import { StateCreator } from "zustand";
import { EventSlice } from "./slices/eventSlice";
import { ActivitySlice } from "./slices/activitySlice";
import { GroupSlice } from "./slices/groupSlice";
import { ParticipantSlice } from "./slices/participantSlice";

export type RootStore = EventSlice & ActivitySlice & GroupSlice & ParticipantSlice;

export type StateSlice<T> = StateCreator<
  RootStore,
  [],
  [],
  T
>;
