import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ActivityItem } from "../../types/event";
import { COLOR_OPTIONS, ScheduleDay } from "./scheduleUtils";

interface ActivityDetailsModalProps {
  activity: ActivityItem | null;
  availableDays?: ScheduleDay[];
  existingActivities?: ActivityItem[];
  onClose: () => void;
  onDelete?: (id: string) => void;
  onUpdate?: (activity: ActivityItem) => Promise<void> | void;
}

export const ActivityDetailsModal = ({
  activity,
  availableDays = [],
  existingActivities = [],
  onClose,
  onDelete,
  onUpdate,
}: ActivityDetailsModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [dayDate, setDayDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [color, setColor] = useState("");
  const [personInCharge, setPersonInCharge] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (activity) {
      setTitle(activity.title);
      setDayDate(activity.dayDate);
      setStartTime(activity.startTime);
      setEndTime(activity.endTime);
      setColor(activity.color);
      setPersonInCharge(activity.personInCharge || "");
      setDescription(activity.description || "");
      setIsEditing(false);
      setError("");
    }
  }, [activity]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter an activity title.");
      return;
    }

    if (startTime >= endTime) {
      setError("End time must be after start time.");
      return;
    }

    // Time collision check: excludes the current activity itself
    const conflict = existingActivities
      .filter((act) => act.id !== activity.id)
      .find((act) => {
        if (act.dayDate !== dayDate) return false;
        return startTime < act.endTime && endTime > act.startTime;
      });

    if (conflict) {
      setError(`Time conflict with "${conflict.title}" (${conflict.startTime} - ${conflict.endTime}).`);
      return;
    }

    if (onUpdate) {
      await onUpdate({
        ...activity,
        title: title.trim(),
        dayDate,
        startTime,
        endTime,
        color,
        personInCharge: personInCharge.trim() || null,
        description: description.trim() || null,
      });
    }

    setIsEditing(false);
    onClose();
  };

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
          <h2 className="text-sm font-semibold text-slate-100">
            {isEditing ? "Edit Activity" : "Activity Details"}
          </h2>
          <kbd
            onClick={onClose}
            className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 hover:text-slate-200 rounded border border-slate-700 font-mono cursor-pointer transition-colors"
          >
            ESC
          </kbd>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="edit-title" className="block text-[11px] font-medium text-slate-400 mb-1.5">
                Title <span className="text-rose-400">*</span>
              </label>
              <input
                id="edit-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError("");
                }}
                className={`w-full min-h-[38px] bg-slate-950 border ${
                  error ? "border-rose-500 focus:ring-rose-500" : "border-slate-800 focus:border-indigo-500"
                } focus:ring-1 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none transition-all`}
              />
              {error && <p className="text-[11px] text-rose-400 mt-1">{error}</p>}
            </div>

            {/* Date & Color Tag */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="edit-date" className="block text-[11px] font-medium text-slate-400 mb-1.5">
                  Day / Date
                </label>
                <select
                  id="edit-date"
                  value={dayDate}
                  onChange={(e) => setDayDate(e.target.value)}
                  className="w-full h-[38px] bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
                >
                  {availableDays.map((d, index) => {
                    const month = new Date(d.fullDate.replace(/-/g, "/")).toLocaleDateString("en-US", { month: "short" });
                    return (
                      <option key={d.fullDate} value={d.fullDate}>
                        Day {index + 1} ({d.dayLabel}, {d.dateNum} {month})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Color Tag</label>
                <div className="flex items-center gap-2 h-[38px] px-1">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      title={c.name}
                      onClick={() => setColor(c.value)}
                      className={`w-5 h-5 rounded-full ${c.value.split(" ")[0]} ${
                        color === c.value
                          ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110"
                          : "opacity-60 hover:opacity-100"
                      } transition-all`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="edit-start" className="block text-[11px] font-medium text-slate-400 mb-1.5">
                  Start Time
                </label>
                <input
                  id="edit-start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full min-h-[38px] bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
                />
              </div>
              <div>
                <label htmlFor="edit-end" className="block text-[11px] font-medium text-slate-400 mb-1.5">
                  End Time
                </label>
                <input
                  id="edit-end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full min-h-[38px] bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
                />
              </div>
            </div>

            {/* Person In Charge */}
            <div>
              <label htmlFor="edit-pic" className="block text-[11px] font-medium text-slate-400 mb-1.5">
                Person in Charge
              </label>
              <input
                id="edit-pic"
                type="text"
                placeholder="e.g. Jane Doe"
                value={personInCharge}
                onChange={(e) => setPersonInCharge(e.target.value)}
                className="w-full min-h-[38px] bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="edit-desc" className="block text-[11px] font-medium text-slate-400 mb-1.5">
                Description
              </label>
              <textarea
                id="edit-desc"
                rows={3}
                placeholder="Add any additional details or notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 outline-none resize-none"
              />
            </div>

            {/* Form Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors min-h-[36px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg transition-all shadow-sm min-h-[36px]"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* View Mode Content */}
            <div className="space-y-4 text-xs">
              <div>
                <span className="block text-[11px] font-medium text-slate-400 mb-1.5">Title</span>
                <div className="flex items-center justify-between min-h-[38px] bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100">
                  <span className="font-medium">{activity.title}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-[11px] font-medium text-slate-400 mb-1.5">Day / Date</span>
                  <div className="flex items-center h-[38px] bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200">
                    <span className="font-medium mr-1.5">{dayPrefix}{activity.dayDate}</span>
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] font-medium text-slate-400 mb-1.5">Time</span>
                  <div className="flex items-center h-[38px] bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-[11px]">
                    {activity.startTime} – {activity.endTime}
                  </div>
                </div>
              </div>

              {activity.personInCharge && (
                <div>
                  <span className="block text-[11px] font-medium text-slate-400 mb-1.5">Person in Charge</span>
                  <div className="flex items-center gap-2 min-h-[38px] bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200">
                    <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
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

              {activity.description && (
                <div>
                  <span className="block text-[11px] font-medium text-slate-400 mb-1.5">Description</span>
                  <div className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {activity.description}
                  </div>
                </div>
              )}
            </div>

            {/* View Mode Actions */}
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
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-all min-h-[36px]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg transition-all shadow-sm min-h-[36px]"
                >
                  Done
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};
