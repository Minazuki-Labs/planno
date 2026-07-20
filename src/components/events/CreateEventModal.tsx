import { useState, useEffect, SubmitEvent } from "react";
import { EventItem } from "../../types/event";
import { formatToYMD, formatToYMDHM } from "../../utils/date";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (event: EventItem) => void;
}

export const CreateEventModal = ({ isOpen, onClose, onCreate }: CreateEventModalProps) => {
  const [eventName, setEventName] = useState("");
  const [isRange, setIsRange] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Helper to reset form to initial values
  const resetForm = () => {
    const today = new Date().toISOString().split("T")[0];
    setEventName("");
    setIsRange(false);
    setStartDate(today);
    setEndDate(today);
  };

  // Reset inputs whenever the modal is opened
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!eventName.trim()) return;

    let formattedEventDate = formatToYMD(startDate);
    if (isRange && endDate) {
      formattedEventDate = `${formatToYMD(startDate)} - ${formatToYMD(endDate)}`;
    }

    const newEvent: EventItem = {
      id: crypto.randomUUID(),
      name: eventName.trim(),
      eventDate: formattedEventDate,
      lastEdited: formatToYMDHM(new Date()),
    };

    onCreate(newEvent);
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Create New Event</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Event Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Design Systems Sync"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Event Date Format
              </label>
              <button
                type="button"
                onClick={() => setIsRange(!isRange)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer"
              >
                {isRange ? "Switch to Single Day" : "Switch to Date Range"}
              </button>
            </div>

            {isRange ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase mb-1">Start Date</span>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-100 outline-none transition-all [color-scheme:dark]"
                  />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase mb-1">End Date</span>
                  <input
                    type="date"
                    required
                    min={startDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-100 outline-none transition-all [color-scheme:dark]"
                  />
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none transition-all [color-scheme:dark]"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
