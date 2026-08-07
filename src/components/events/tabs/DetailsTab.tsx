import { useState } from "react";
import { EventItem } from "../../../types/event";

interface DetailsTabProps {
  event: EventItem;
  onDelete: () => void;
  onUpdate: (updatedEvent: EventItem) => void;
}

export const DetailsTab = ({ event, onDelete, onUpdate }: DetailsTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: event.name,
    location: event.location || "",
    eventDate: event.eventDate,
  });

  const handleSave = () => {
    const updatedEvent: EventItem = {
      ...event,
      name: formData.name,
      location: formData.location.trim() ? formData.location : null,
      eventDate: formData.eventDate,
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
    setFormData({
      name: event.name,
      location: event.location || "",
      eventDate: event.eventDate,
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-6 backdrop-blur-md shadow-xl">
      {/* Header Section */}
      <div className="pb-4 border-b border-slate-800/80 flex justify-between items-start">
        <div className="w-full mr-4">
          <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase">
            Event Details
          </span>
          {isEditing ? (
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-2 w-full bg-slate-950/60 border border-slate-700/80 focus:border-indigo-500 focus:outline-none rounded-xl px-3 py-1.5 text-xl font-bold text-slate-100 transition-all"
            />
          ) : (
            <h1 className="text-2xl font-bold text-slate-100 mt-1">{event.name}</h1>
          )}
        </div>

        {/* Top Actions: Edit / Save / Cancel */}
        <div className="flex items-center space-x-2 pt-1">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="px-3.5 py-1.5 text-xs font-semibold bg-slate-800/60 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700/50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
              >
                Save
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              Edit Details
            </button>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Location Box */}
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
            Location
          </p>
          {isEditing ? (
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none rounded-lg px-2.5 py-1 text-sm font-medium text-slate-200"
              placeholder="e.g. San Francisco"
            />
          ) : (
            <p className="text-sm font-medium text-slate-200">
              {event.location || "N/A"}
            </p>
          )}
        </div>

        {/* Date Box */}
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
            Date
          </p>
          {isEditing ? (
            <input
              type="text"
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none rounded-lg px-2.5 py-1 text-sm font-medium text-slate-200"
            />
          ) : (
            <p className="text-sm font-medium text-slate-200">{event.eventDate}</p>
          )}
        </div>

        {/* Last Edited Box */}
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
            Last Edited
          </p>
          <p className="text-sm font-medium text-slate-200">{event.lastEdited}</p>
        </div>
      </div>

      {/* Footer Section */}
      <div className="pt-4 border-t border-slate-800/80 flex justify-end">
        <button
          type="button"
          onClick={onDelete}
          className="px-3.5 py-2 text-xs font-semibold bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl transition-all cursor-pointer shadow-sm"
        >
          Delete Event
        </button>
      </div>
    </div>
  );
};
