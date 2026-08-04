import { useState } from "react";
import { useEventStore } from "../store/useEventStore";
import { EventCard } from "../components/events/EventCard";
import { CreateEventModal } from "../components/events/CreateEventModal";

export const EventDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const events = useEventStore((state) => state.events);
  const selectEvent = useEventStore((state) => state.selectEvent);

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto px-6 py-4">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/60 select-none">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Events</h1>
          <p className="text-xs text-slate-400">Manage and schedule your event calendar</p>
        </div>
        
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-sm transition-all duration-150 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Event</span>
          <kbd className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] bg-indigo-700/50 text-indigo-200 rounded border border-indigo-400/30 font-mono">
            ⌘N
          </kbd>
        </button>
      </div>

      {events.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-slate-800/70 rounded-2xl bg-slate-900/30">
          <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mb-4 text-slate-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-200">No events found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Get started by creating your first scheduled event.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-lg transition-colors"
          >
            + Create Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-1">
          {events.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              onSelect={(e) => selectEvent(e.id)} 
            />
          ))}
        </div>
      )}

      <CreateEventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
