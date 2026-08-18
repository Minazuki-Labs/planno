import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ActivityItem } from "../../types/event";

interface Props {
  isOpen: boolean;
  eventId: string;
  availableDays: { fullDate: string; dayLabel: string; dateNum: number }[];
  existingActivities: ActivityItem[];
  onClose: () => void;
  onSubmit: (activity: ActivityItem) => void;
}

const COLOR_OPTIONS = [
  { name: "Indigo", value: "bg-indigo-500 text-white" },
  { name: "Emerald", value: "bg-emerald-500 text-white" },
  { name: "Amber", value: "bg-amber-500 text-slate-950" },
  { name: "Rose", value: "bg-rose-500 text-white" },
  { name: "Purple", value: "bg-purple-500 text-white" },
  { name: "Sky", value: "bg-sky-500 text-white" },
];

export const CreateActivityModal = ({ 
  isOpen, 
  eventId, 
  availableDays, 
  existingActivities, 
  onClose, 
  onSubmit 
}: Props) => {
  const [title, setTitle] = useState("");
  const [dayDate, setDayDate] = useState(availableDays[0]?.fullDate || "");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:30");
  const [color, setColor] = useState(COLOR_OPTIONS[0].value);
  const [error, setError] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDayDate(availableDays[0]?.fullDate || "");
      setStartTime("08:00");
      setEndTime("09:30");
      setColor(COLOR_OPTIONS[0].value);
      setError("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, availableDays, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter an activity title.");
      return;
    }

    if (startTime >= endTime) {
      setError("End time must be after start time.");
      return;
    }

    const conflict = existingActivities.find((act) => {
      if (act.dayDate !== dayDate) return false;
      return startTime < act.endTime && endTime > act.startTime;
    });

    if (conflict) {
      setError(
        `Time conflict with "${conflict.title}" (${conflict.startTime} - ${conflict.endTime}).`
      );
      return;
    }

    onSubmit({
      id: crypto.randomUUID(),
      eventId,
      title: title.trim(),
      dayDate,
      startTime,
      endTime,
      color,
    });
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-5"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <h2 className="text-sm font-semibold text-slate-100">Add Schedule Activity</h2>
          <kbd
            onClick={onClose}
            className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 hover:text-slate-200 rounded border border-slate-700 font-mono cursor-pointer transition-colors"
          >
            ESC
          </kbd>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="activity-title" className="block text-[11px] font-medium text-slate-400 mb-1.5">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              id="activity-title"
              ref={inputRef}
              type="text"
              placeholder="e.g. Keynote Presentation"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError("");
              }}
              className={`w-full min-h-[38px] bg-slate-950 border ${
                error
                  ? "border-rose-500 focus:ring-rose-500"
                  : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-500"
              } focus:ring-1 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 outline-none transition-all`}
            />
            {error && <p className="text-[11px] text-rose-400 mt-1">{error}</p>}
          </div>

          {/* Date & Color Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="activity-date" className="block text-[11px] font-medium text-slate-400 mb-1.5">
                Day / Date
              </label>
              <div className="relative">
                <select
                  id="activity-date"
                  value={dayDate}
                  onChange={(e) => setDayDate(e.target.value)}
                  className="w-full h-[38px] bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 pr-8 py-2 text-xs text-slate-100 outline-none appearance-none transition-all cursor-pointer"
                >
                  {availableDays.map((d, index) => {
                    const month = new Date(d.fullDate.replace(/-/g, "/")).toLocaleDateString("en-US", {
                      month: "short",
                    });

                    return (
                      <option key={d.fullDate} value={d.fullDate}>
                        Day {index + 1} ({d.dayLabel}, {d.dateNum} {month} )
                      </option>
                    );
                  })}
                </select>

                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
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
              <label htmlFor="start-time" className="block text-[11px] font-medium text-slate-400 mb-1.5">
                Start Time
              </label>
              <input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full min-h-[38px] bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none transition-all"
              />
            </div>
            <div>
              <label htmlFor="end-time" className="block text-[11px] font-medium text-slate-400 mb-1.5">
                End Time
              </label>
              <input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full min-h-[38px] bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Actions Button */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors min-h-[36px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg transition-all shadow-sm min-h-[36px]"
            >
              Add Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
