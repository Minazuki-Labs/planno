export interface EventSettings {
  groupsEnabled?: boolean;
}

export interface EventItem {
  id: string;
  name: string;
  eventDate: string;
  lastEdited: string;
  location?: string | null;
  settings?: EventSettings;
}

export interface EventTabItem {
  id: string;
  eventId: string;
  tabType: "schedule" | "participant" | "budget" | "committee";
  label: string;
  position: number;
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
