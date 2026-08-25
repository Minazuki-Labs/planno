import { ActivityItem } from "../../types/event";
import { ActivityCard } from "./ActivityCard";
import { START_HOUR, END_HOUR, HOUR_HEIGHT_PX } from "./scheduleUtils";

interface ScheduleDayColumnProps {
  dayDate: string;
  activities: ActivityItem[];
  totalGridHeight: number;
  onSelectSlot: (dayDate: string, hour: number) => void;
  onSelectActivity: (activity: ActivityItem) => void;
  onDeleteActivity: (id: string) => void;
}

export const ScheduleDayColumn = ({
  dayDate,
  activities,
  totalGridHeight,
  onSelectSlot,
  onSelectActivity,
  onDeleteActivity,
}: ScheduleDayColumnProps) => {
  const hoursArray = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  return (
    <div
      className="relative border-l border-slate-800/60"
      style={{ height: `${totalGridHeight}px` }}
    >
      {/* Time Slots */}
      {hoursArray.map((hour) => {
        const slotStart = `${hour.toString().padStart(2, "0")}:00`;
        const nextHour = Math.min(hour + 1, END_HOUR);
        const slotEnd = `${nextHour.toString().padStart(2, "0")}:00`;

        const isOccupied = activities.some(
          (act) => slotStart < act.endTime && slotEnd > act.startTime
        );

        if (isOccupied) return null;

        return (
          <button
            key={hour}
            type="button"
            onClick={() => onSelectSlot(dayDate, hour)}
            style={{
              top: `${(hour - START_HOUR) * HOUR_HEIGHT_PX}px`,
              height: `${HOUR_HEIGHT_PX}px`,
            }}
            className="absolute inset-x-0 border-t border-slate-800/50 hover:bg-indigo-500/10 transition-colors flex items-center justify-center group/slot z-0"
          >
            <span className="opacity-0 group-hover/slot:opacity-100 text-[11px] font-medium text-indigo-400 bg-slate-900/90 border border-indigo-500/30 px-2 py-0.5 rounded-md pointer-events-none shadow-sm transition-opacity">
              + Add at {slotStart}
            </span>
          </button>
        );
      })}

      {/* Activity Cards */}
      {activities.map((act) => (
        <ActivityCard
          key={act.id}
          activity={act}
          onClick={onSelectActivity}
          onDelete={onDeleteActivity}
        />
      ))}
    </div>
  );
};
