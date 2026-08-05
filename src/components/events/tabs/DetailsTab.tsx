import { EventItem } from "../../../types/event";

interface DetailsTabProps {
  event: EventItem;
}

export const DetailsTab = ({ event }: DetailsTabProps) => {
  return (
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
  );
};
