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
      <div className="min-w-0 pr-4 space-y-1">
        {/* Title & Time */}
        <div>
          <p className="font-semibold text-xs leading-snug truncate text-white drop-shadow-sm">
            {activity.title}
          </p>
          <p className="text-[10px] font-medium text-white/80 mt-0.5 truncate tracking-wide">
            {activity.startTime} - {activity.endTime}
          </p>
        </div>

        {/* Description */}
        {activity.description && (
          <p className="text-[10px] text-white/75 line-clamp-2 leading-tight">
            {activity.description}
          </p>
        )}
      </div>

      {/* Person in Charge */}
      {activity.personInCharge && (
        <div className="mt-1 flex items-center">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/25 text-[9px] font-medium text-white/90 truncate max-w-full">
            <svg
              className="w-2.5 h-2.5 shrink-0 opacity-80"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            <span className="truncate">{activity.personInCharge}</span>
          </span>
        </div>
      )}

      {/* Delete Button */}
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
