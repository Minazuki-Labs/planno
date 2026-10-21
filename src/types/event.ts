export enum EventTabType {
  Schedule = "schedule",
  Participant = "participant",
  Budget = "budget",
  Committee = "committee",
}

export interface ParticipantTabSettings {
  groupsEnabled?: boolean;
}

export interface BaseEventTabItem {
  id: string;
  eventId: string;
  label: string;
  position: number;
}

export interface ScheduleTabItem extends BaseEventTabItem {
  tabType: EventTabType.Schedule;
}

export interface BudgetTabItem extends BaseEventTabItem {
  tabType: EventTabType.Budget;
}

export interface CommitteeTabItem extends BaseEventTabItem {
  tabType: EventTabType.Committee;
}

export interface ParticipantTabItem extends BaseEventTabItem {
  tabType: EventTabType.Participant;
  settings?: ParticipantTabSettings;
}

export type EventTabItem = 
  | ScheduleTabItem 
  | BudgetTabItem 
  | CommitteeTabItem 
  | ParticipantTabItem;

export interface EventItem {
  id: string;
  name: string;
  eventDate: string;
  lastEdited: string;
  location?: string | null;
}

export interface ActivityItem {
  id: string;
  eventId: string;
  title: string;
  dayDate: string;
  startTime: string;
  endTime: string;
  color: string;
  description?: string | null;
  personInCharge?: string | null;
}
