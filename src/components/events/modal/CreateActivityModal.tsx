import { useState } from "react";
import { ActivityItem } from "../../../types/event";

interface Props {
  isOpen: boolean;
  eventId: string;
  availableDays: { fullDate: string; dayLabel: string; dateNum: number }[];
  onClose: () => void;
  onSubmit: (activity: ActivityItem) => void;
}

const COLOR_OPTIONS = [
  { name: "Blue", value: "bg-sky-500 text-white" },
  { name: "Teal", value: "bg-teal-600 text-white" },
  { name: "Orange", value: "bg-amber-500 text-white" },
  { name: "Red", value: "bg-rose-500 text-white" },
  { name: "Green", value: "bg-lime-600 text-white" },
  { name: "Cyan", value: "bg-cyan-500 text-white" },
];

export const CreateActivityModal = ({ isOpen, eventId, availableDays, onClose, onSubmit }: Props) => {
  const [title, setTitle] = useState("");
  const [dayDate, setDayDate] = useState(availableDays[0]?.fullDate || "");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:30");
  const [color, setColor] = useState(COLOR_OPTIONS[0].value);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

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

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 text-slate-100 shadow-2xl">
        <h3 className="text-base font-bold">Add Schedule Activity</h3>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Filosofía"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Date</label>
              <select
                value={dayDate}
                onChange={(e) => setDayDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 outline-none focus:border-indigo-500"
              >
                {availableDays.map((d) => (
                  <option key={d.fullDate} value={d.fullDate}>
                    {d.dayLabel} - {d.dateNum} ({d.fullDate})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Color Block</label>
              <div className="flex items-center gap-1.5 pt-1">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`w-6 h-6 rounded-full ${c.value.split(" ")[0]} ${
                      color === c.value ? "ring-2 ring-white scale-110" : "opacity-70 hover:opacity-100"
                    } transition-all`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium shadow-sm"
            >
              Add Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
