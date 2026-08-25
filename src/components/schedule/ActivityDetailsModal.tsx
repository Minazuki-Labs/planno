import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ActivityItem } from "../../types/event";
import { ScheduleDay } from "./scheduleUtils";

interface ActivityDetailsModalProps {
  activity: ActivityItem | null;
  availableDays?: ScheduleDay[];
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const ActivityDetailsModal = ({
  activity,
  availableDays = [],
  onClose,
  onDelete,
}: ActivityDetailsModalProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activity) onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activity, onClose]);

  if (!activity) return null;

  const dayIndex = availableDays.findIndex((d) => d.fullDate === activity.dayDate);
  const dayPrefix = dayIndex !== -1 ? `Day ${dayIndex + 1} • ` : "";

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-5 shadow-2xl space-y-5"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <h2 className="text-sm font-semibold text-slate-100">Activity Details</h2>
          <kbd
            onClick={onClose}
            className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 hover:text-slate-200 rounded border border-slate-700 font-mono cursor-pointer transition-colors"
          >
            ESC
          </kbd>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs">
          {/* Title */}
          <div>
            <span className="block text-[11px] font-medium text-slate-400 mb-1.5">
              Title
            </span>
            <div className="flex items-center justify-between min-h-[38px] bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100">
              <span className="font-medium text-slate-100">{activity.title}</span>
            </div>
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="block text-[11px] font-medium text-slate-400 mb-1.5">
                Day / Date
              </span>
              <div className="flex items-center h-[38px] bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200">
                <span className="font-medium mr-1.5">{dayPrefix}{activity.dayDate}</span>
              </div>
            </div>

            <div>
              <span className="block text-[11px] font-medium text-slate-400 mb-1.5">
                Time
              </span>
              <div className="flex items-center h-[38px] bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-[11px]">
                {activity.startTime} – {activity.endTime}
              </div>
            </div>
          </div>

          {/* Person In Charge */}
          {activity.personInCharge && (
            <div>
              <span className="block text-[11px] font-medium text-slate-400 mb-1.5">
                Person in Charge
              </span>
              <div className="flex items-center gap-2 min-h-[38px] bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200">
                <svg
                  className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{activity.personInCharge}</span>
              </div>
            </div>
          )}

          {/* Description */}
          {activity.description && (
            <div>
              <span className="block text-[11px] font-medium text-slate-400 mb-1.5">
                Description
              </span>
              <div className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 whitespace-pre-wrap leading-relaxed">
                {activity.description}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
          <div>
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(activity.id);
                  onClose();
                }}
                className="px-3.5 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors min-h-[36px]"
              >
                Delete Activity
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg transition-all shadow-sm min-h-[36px]"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
