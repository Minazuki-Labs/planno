import { EventItem } from "../../types/event";

interface EventCardProps {
  event: EventItem;
  onSelect?: (event: EventItem) => void;
}

export const EventCard = ({ event, onSelect }: EventCardProps) => {
  return (
    <div
      onClick={() => onSelect?.(event)}
      className="group relative flex flex-col justify-between bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl transition-all duration-150 cursor-default select-none shadow-sm hover:shadow-md"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
            {event.name}
          </h2>
        </div>
      </div>

      <div className="mt-6 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
        {event.location && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Location
            </span>
            <span className="text-slate-300 font-medium truncate max-w-[140px]">{event.location}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-500">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Date
          </span>
          <span className="text-slate-300 font-medium">{event.eventDate}</span>
        </div>
      </div>
    </div>
  );
};
