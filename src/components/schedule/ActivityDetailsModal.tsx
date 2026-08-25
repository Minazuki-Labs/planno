import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ActivityItem } from "../../types/event";

interface ActivityDetailsModalProps {
  activity: ActivityItem | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const ActivityDetailsModal = ({
  activity,
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

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="space-y-1">
            <span
              className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-medium ${activity.color}`}
            >
              Activity Details
            </span>
            <h2 className="text-lg font-semibold text-slate-100">{activity.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Details Grid */}
        <div className="space-y-3.5 text-xs">
          <div>
            <span className="text-slate-400 block font-medium mb-1">Time & Date</span>
            <p className="text-slate-200">
              {activity.dayDate} • {activity.startTime} - {activity.endTime}
            </p>
          </div>

          {activity.personInCharge && (
            <div>
              <span className="text-slate-400 block font-medium mb-1">Person in Charge</span>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-200">
                <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                {activity.personInCharge}
              </div>
            </div>
          )}

          {activity.description && (
            <div>
              <span className="text-slate-400 block font-medium mb-1">Description</span>
              <p className="text-slate-300 bg-slate-950 border border-slate-800 rounded-lg p-3 whitespace-pre-wrap leading-relaxed">
                {activity.description}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
          {onDelete ? (
            <button
              type="button"
              onClick={() => {
                onDelete(activity.id);
                onClose();
              }}
              className="px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              Delete
            </button>
          ) : <div />}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
