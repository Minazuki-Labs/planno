export const START_HOUR = 0;
export const END_HOUR = 24;
export const HOUR_HEIGHT_PX = 110;
export const TIME_COL_WIDTH = 64;
export const MIN_DAY_COL_WIDTH = 130;

export const COLOR_OPTIONS = [
  { name: "Indigo", value: "bg-indigo-500 text-white" },
  { name: "Emerald", value: "bg-emerald-500 text-white" },
  { name: "Amber", value: "bg-amber-500 text-slate-950" },
  { name: "Rose", value: "bg-rose-500 text-white" },
  { name: "Purple", value: "bg-purple-500 text-white" },
  { name: "Sky", value: "bg-sky-500 text-white" },
];

export interface ScheduleDay {
  fullDate: string;
  dayLabel: string;
  dateNum: number;
}

export function calculateBlockGeometry(startTime: string, endTime: string) {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  const startTotalHours = startH + startM / 60;
  const endTotalHours = endH + endM / 60;

  const top = (startTotalHours - START_HOUR) * HOUR_HEIGHT_PX;
  const height = Math.max(24, (endTotalHours - startTotalHours) * HOUR_HEIGHT_PX);

  return { top, height };
}

export function generateEventDays(eventDate?: string): ScheduleDay[] {
  let startDate = new Date();
  let endDate = new Date();

  if (eventDate && eventDate !== "To Be Confirmed") {
    const parts = eventDate.split(" - ");
    const parsedStart = new Date(parts[0]);
    if (!isNaN(parsedStart.getTime())) startDate = parsedStart;

    if (parts[1]) {
      const parsedEnd = new Date(parts[1]);
      if (!isNaN(parsedEnd.getTime())) endDate = parsedEnd;
    } else {
      endDate = new Date(startDate);
    }
  } else {
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 3);
  }

  const days: ScheduleDay[] = [];
  const current = new Date(startDate);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  while (current <= endDate && days.length < 7) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    const day = String(current.getDate()).padStart(2, "0");

    days.push({
      fullDate: `${year}-${month}-${day}`,
      dayLabel: dayNames[current.getDay()],
      dateNum: current.getDate(),
    });
    current.setDate(current.getDate() + 1);
  }

  return days;
}
