import { useState } from "react";
import { EventItem } from "../../../types/event";
import { DatePickerField } from "../../common/DatePickerField";

interface DetailsTabProps {
  event: EventItem;
  onDelete: () => void;
  onUpdate: (updatedEvent: EventItem) => void;
}

const formatDateToYMD = (date: Date | null): string => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
};

export const DetailsTab = ({ event, onDelete, onUpdate }: DetailsTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: event.name,
    location: event.location || "",
  });

  const [isRange, setIsRange] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleStartEdit = () => {
    setIsEditing(true);
    setShowDeleteConfirm(false);
    setFormData({
      name: event.name,
      location: event.location || "",
    });

    if (event.eventDate && event.eventDate !== "To Be Confirmed") {
      const dates = event.eventDate.split(" - ");
      if (dates[0]) setStartDate(new Date(dates[0]));
      if (dates[1]) {
        setEndDate(new Date(dates[1]));
        setIsRange(true);
      } else {
        setEndDate(null);
        setIsRange(false);
      }
    } else {
      setStartDate(null);
      setEndDate(null);
      setIsRange(false);
    }
  };

  const handleSave = () => {
    let formattedEventDate = "To Be Confirmed";

    if (startDate) {
      const startFormatted = formatDateToYMD(startDate);
      formattedEventDate = startFormatted;

      if (isRange && endDate) {
        const endFormatted = formatDateToYMD(endDate);
        formattedEventDate = `${startFormatted} - ${endFormatted}`;
      }
    }

    const updatedEvent: EventItem = {
      ...event,
      name: formData.name,
      location: formData.location.trim() ? formData.location : null,
      eventDate: formattedEventDate,
      lastEdited: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    onUpdate(updatedEvent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const inputStyles =
    "w-full min-h-[40px] bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none rounded-xl px-3 py-2 text-xs font-medium text-slate-100 placeholder-slate-500 transition-all shadow-inner";

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-6 backdrop-blur-md shadow-xl">
      {/* Header Section */}
      <div className="pb-5 border-b border-slate-800/60 flex justify-between items-start gap-4">
        <div className="w-full">
          <span className="text-[10px] font-extrabold tracking-widest text-indigo-400 uppercase">
            Event Details
          </span>
          {isEditing ? (
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-2 w-full bg-slate-950/80 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none rounded-xl px-3.5 py-2 text-xl font-bold text-slate-100 transition-all shadow-inner"
              placeholder="Event Name"
            />
          ) : (
            <h1 className="text-2xl font-bold text-slate-100 mt-1 tracking-tight">
              {event.name}
            </h1>
          )}
        </div>

        {/* Edit Button*/}
        {!isEditing && (
          <div className="pt-1 flex-shrink-0">
            <button
              type="button"
              onClick={handleStartEdit}
              className="px-4 py-2 text-xs font-semibold bg-slate-800/60 hover:bg-indigo-600 hover:text-white text-slate-300 border border-slate-700/60 hover:border-indigo-500/50 rounded-xl transition-all cursor-pointer shadow-sm whitespace-nowrap min-h-[38px] active:scale-[0.98]"
            >
              Edit Details
            </button>
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Location Card */}
        <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-800/40 flex flex-col justify-center min-h-[96px] transition-all hover:border-slate-800/80">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">
            Location
          </p>
          {isEditing ? (
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className={inputStyles}
              placeholder="e.g. San Francisco"
            />
          ) : (
            <p className="text-sm font-semibold text-slate-200">
              {event.location || "N/A"}
            </p>
          )}
        </div>

        {/* Date Card */}
        <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-800/40 flex flex-col justify-center min-h-[96px] transition-all hover:border-slate-800/80">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">
            Date
          </p>
          {isEditing ? (
            <DatePickerField
              startDate={startDate}
              endDate={endDate}
              isRange={isRange}
              onRangeToggle={setIsRange}
              onChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
              }}
              className={inputStyles}
            />
          ) : (
            <p className="text-sm font-semibold text-slate-200">
              {event.eventDate}
            </p>
          )}
        </div>

        {/* Last Edited Card */}
        <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-800/40 flex flex-col justify-center min-h-[96px] transition-all hover:border-slate-800/80">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">
            Last Edited
          </p>
          <p className="text-sm font-semibold text-slate-200">{event.lastEdited}</p>
        </div>
      </div>

      {/* Footer Section */}
      <div className="pt-4 border-t border-slate-800/60 flex justify-end items-center">
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-xl border border-slate-700/60 transition-all cursor-pointer whitespace-nowrap min-h-[38px] active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/25 transition-all cursor-pointer whitespace-nowrap min-h-[38px] active:scale-[0.98]"
            >
              Save Changes
            </button>
          </div>
        ) : showDeleteConfirm ? (
          <div className="flex items-center space-x-2 animate-in fade-in duration-200">
            <span className="text-xs text-slate-400 mr-2 font-medium">
              Are you sure?
            </span>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-lg shadow-rose-600/20 transition-all active:scale-[0.98]"
            >
              Confirm Delete
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-3.5 py-2 text-xs font-semibold text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer min-h-[36px]"
          >
            Delete Event
          </button>
        )}
      </div>
    </div>
  );
};
