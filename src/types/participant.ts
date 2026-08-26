export type ParticipantRole = "teacher" | "leader" | "co_leader" | "member";

export interface GroupItem {
  id: string;
  eventId: string;
  name: string;
}

export interface ParticipantItem {
  id: string;
  eventId: string;
  groupId: string | null;
  name: string;
  role: ParticipantRole;
}
