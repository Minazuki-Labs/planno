export type ParticipantRole = "teacher" | "leader" | "co_leader" | "member";

export interface GroupItem {
  id: string;
  eventId: string;
  name: string;
  position?: number;
}

export interface ParticipantItem {
  id: string;
  eventId: string;
  groupId: string | null;
  name: string;
  role: ParticipantRole;
}
