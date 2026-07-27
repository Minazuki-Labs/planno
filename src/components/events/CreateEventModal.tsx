import { useState, useEffect, useRef, SubmitEvent } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { EventItem } from "../../types/event";
import { formatToYMD, formatToYMDHM } from "../../utils/date";
import { useEventStore } from "../../store/useEventStore";

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

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    if (date && endDate && date > endDate) {
      setEndDate(date);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!eventName.trim()) {
      setError("Please enter a valid event name.");
      return;
    }

    let formattedEventDate = "To Be Confirm";

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
      lastEdited: formatToYMDHM(new Date()),
      ...(location.trim() && { location: location.trim() }),
    };

    createEvent(newEvent);
    onClose();
  };

  const inputStyles = "w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-100 outline-none transition-all cursor-pointer";

  return (
    <div 
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-bold text-white">
            Create New Event
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="event-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Event Name <span className="text-rose-400">*</span>
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
              className={`w-full bg-slate-950 border ${
                error ? "border-rose-500 focus:ring-rose-500" : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-500"
              } focus:ring-1 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all`}
            />
            {error && <p className="text-xs text-rose-400 mt-1.5">{error}</p>}
          </div>

          <div>
            <label htmlFor="event-location" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Location <span className="text-slate-500 lowercase">(optional)</span>
            </label>
            <input
              id="event-location"
              type="text"
              placeholder="e.g. Conference Room B / Zoom"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Duration Type <span className="text-slate-500 lowercase">(optional)</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl mb-3">
              <button
                type="button"
                onClick={() => setIsRange(false)}
                className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                  !isRange 
                    ? "bg-slate-800 text-white shadow-sm" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Single Day
              </button>
              <button
                type="button"
                onClick={() => setIsRange(true)}
                className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                  isRange 
                    ? "bg-slate-800 text-white shadow-sm" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Multi-Days
              </button>
            </div>

            {isRange ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="start-date" className="block text-[10px] text-slate-400 font-medium uppercase mb-1">
                    Start Date
                  </label>
                  <DatePicker
                    id="start-date"
                    selected={startDate}
                    onChange={handleStartDateChange}
                    minDate={new Date()}
                    isClearable
                    placeholderText="Select date"
                    dateFormat="yyyy/MM/dd"
                    className={inputStyles}
                    wrapperClassName="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="end-date" className="block text-[10px] text-slate-400 font-medium uppercase mb-1">
                    End Date
                  </label>
                  <DatePicker
                    id="end-date"
                    selected={endDate}
                    onChange={setEndDate}
                    minDate={startDate || new Date()}
                    isClearable
                    placeholderText="Select date"
                    dateFormat="yyyy/MM/dd"
                    className={inputStyles}
                    wrapperClassName="w-full"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="single-date" className="sr-only">Date</label>
                <DatePicker
                  id="single-date"
                  selected={startDate}
                  onChange={handleStartDateChange}
                  minDate={startDate || new Date()}
                  isClearable
                  placeholderText="Select date"
                  dateFormat="yyyy/MM/dd"
                  className={inputStyles}
                  wrapperClassName="w-full"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer"
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
