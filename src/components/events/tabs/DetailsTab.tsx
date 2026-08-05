import { EventItem } from "../../../types/event";

interface DetailsTabProps {
  event: EventItem;
  onDelete: () => void;
}

export const DetailsTab = ({ event, onDelete }: DetailsTabProps) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-6 backdrop-blur-md shadow-xl">
      <div className="pb-4 border-b border-slate-800/80">
        <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase">Event Details</span>
        <h1 className="text-2xl font-bold text-slate-100 mt-1">{event.name}</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Location</p>
          <p className="text-sm font-medium text-slate-200">{event.location || "N/A"}</p>
        </div>
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Date</p>
          <p className="text-sm font-medium text-slate-200">{event.eventDate}</p>
        </div>
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Last Edited</p>
          <p className="text-sm font-medium text-slate-200">{event.lastEdited}</p>
        </div>
      </div>

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
