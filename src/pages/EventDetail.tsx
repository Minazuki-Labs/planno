import { useState } from "react";
import { EventItem } from "../types/event";

interface EventDetailProps {
  event: EventItem;
  onBack: () => void;
  onDelete: (eventId: string) => void;
}

export const EventDetail = ({ event, onBack, onDelete }: EventDetailProps) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const confirmDelete = () => {
    onDelete(event.id);
    onBack();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors cursor-pointer"
        >
          ← Back to Dashboard
        </button>

        <button
          type="button"
          onClick={() => setShowConfirmModal(true)}
          className="px-4 py-2 text-xs font-semibold bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl transition-all cursor-pointer"
        >
          Delete Event
        </button>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-6 backdrop-blur-md">
        <h1 className="text-3xl font-bold text-slate-100">{event.name}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          <div>
            <p className="text-xs uppercase text-slate-400 font-semibold mb-1">Location</p>
            <p className="text-sm text-slate-200">{event.location || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400 font-semibold mb-1">Date</p>
            <p className="text-sm text-slate-200">{event.eventDate}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400 font-semibold mb-1">Last Edited</p>
            <p className="text-sm text-slate-200">{event.lastEdited}</p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Delete Event?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to delete <span className="text-slate-200 font-medium">"{event.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all shadow-lg shadow-rose-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
