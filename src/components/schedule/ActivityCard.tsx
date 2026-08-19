import { ActivityItem } from "../../types/event";
import { calculateBlockGeometry } from "./scheduleUtils";

interface ActivityCardProps {
  activity: ActivityItem;
  onDelete: (id: string) => void;
}

export const ActivityCard = ({ activity, onDelete }: ActivityCardProps) => {
  const { top, height } = calculateBlockGeometry(activity.startTime, activity.endTime);

  return (
    <div
      style={{
        top: `${top + 1}px`,
        height: `${height - 2}px`,
      }}
      className={`absolute left-1 right-1 rounded-xl p-2.5 shadow-lg border border-white/10 ${activity.color} flex flex-col justify-between group transition-all duration-150 hover:z-20 hover:scale-[1.01] hover:brightness-110 hover:shadow-xl z-10 cursor-pointer overflow-hidden backdrop-blur-sm`}
    >
      <div className="min-w-0 pr-4">
        <p className="font-semibold text-xs leading-snug truncate text-white drop-shadow-sm">
          {activity.title}
        </p>
        <p className="text-[10px] font-medium text-white/80 mt-0.5 truncate tracking-wide">
          {activity.startTime} - {activity.endTime}
        </p>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(activity.id);
        }}
        aria-label="Delete activity"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center text-[10px] bg-black/40 hover:bg-red-500/80 text-white rounded-md transition-all"
      >
        ✕
      </button>
    </div>
  );
};
