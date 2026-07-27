import { EventItem } from "../../types/event";

interface EventCardProps {
  event: EventItem;
  onSelect?: (event: EventItem) => void;
}

export const EventCard = ({ event, onSelect }: EventCardProps) => {
  return (
    <div
      onClick={() => onSelect?.(event)}
      className="group relative flex flex-col justify-between bg-slate-900/60 backdrop-blur-md border border-slate-800/80 hover:border-slate-700/80 p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 cursor-pointer"
    >
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2">
          {event.name}
        </h2>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-800/60 text-xs text-slate-400 space-y-2">
        {event.location && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Location
            </span>
            <span className="text-slate-200 font-medium truncate max-w-[160px]">{event.location}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-400">
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Date
          </span>
          <span className="text-slate-200 font-medium">{event.eventDate}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-400">
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Last Edited
          </span>
          <span className="text-slate-300 font-medium">{event.lastEdited}</span>
        </div>
      </div>
    </div>
  );
};
