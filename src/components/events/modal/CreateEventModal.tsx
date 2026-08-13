import { useState, useEffect, useRef, SubmitEvent } from "react";

import { EventItem } from "../../../types/event";
import { formatToYMD } from "../../../utils/date";
import { useEventStore } from "../../../store/useEventStore";
import { DatePickerField } from "../../common/DatePickerField";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatDateToYMD = (date: Date | null): string => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
};

export const CreateEventModal = ({ isOpen, onClose }: CreateEventModalProps) => {
  const [eventName, setEventName] = useState("");
  const [location, setLocation] = useState("");
  const [isRange, setIsRange] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [error, setError] = useState("");

  const createEvent = useEventStore((state) => state.createEvent);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setEventName("");
    setLocation("");
    setIsRange(false);
    setStartDate(null);
    setEndDate(null);
    setError("");
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
      setTimeout(() => nameInputRef.current?.focus(), 50);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!eventName.trim()) {
      setError("Please enter a valid event name.");
      return;
    }

    let formattedEventDate = "To Be Confirmed";

    if (startDate) {
      const startFormatted = formatDateToYMD(startDate);
      formattedEventDate = formatToYMD(startFormatted);

      if (isRange && endDate) {
        const endFormatted = formatDateToYMD(endDate);
        formattedEventDate = `${formatToYMD(startFormatted)} - ${formatToYMD(endFormatted)}`;
      }
    }

    const newEvent: EventItem = {
      id: crypto.randomUUID(),
      name: eventName.trim(),
      eventDate: formattedEventDate,
      lastEdited: new Date().toISOString(),
      ...(location.trim() && { location: location.trim() }),
    };

    createEvent(newEvent);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-5"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <h2 className="text-sm font-semibold text-slate-100">Create Event</h2>
          <kbd 
            onClick={onClose}
            className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 hover:text-slate-200 rounded border border-slate-700 font-mono cursor-pointer"
          >
            ESC
          </kbd>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="event-name" className="block text-[11px] font-medium text-slate-400 mb-1.5">
              Event Title <span className="text-rose-400">*</span>
            </label>
            <input
              id="event-name"
              ref={nameInputRef}
              type="text"
              placeholder="e.g. Design Systems Sync"
              value={eventName}
              onChange={(e) => {
                setEventName(e.target.value);
                if (error) setError("");
              }}
              className={`w-full min-h-[38px] bg-slate-950 border ${
                error ? "border-rose-500 focus:ring-rose-500" : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-500"
              } focus:ring-1 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 outline-none transition-all`}
            />
            {error && <p className="text-[11px] text-rose-400 mt-1">{error}</p>}
          </div>

          <div>
            <label htmlFor="event-location" className="block text-[11px] font-medium text-slate-400 mb-1.5">
              Location <span className="text-slate-600">(Optional)</span>
            </label>
            <input
              id="event-location"
              type="text"
              placeholder="e.g. Room B / Zoom link"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full min-h-[38px] bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Duration</label>
            <DatePickerField
              startDate={startDate}
              endDate={endDate}
              isRange={isRange}
              minDate={new Date()}
              onRangeToggle={setIsRange}
              onChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
              }}
              className="w-full min-h-[38px] bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none transition-all"
            />
          </div>

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
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
