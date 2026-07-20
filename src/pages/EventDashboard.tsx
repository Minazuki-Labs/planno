import { useState } from "react";
import { EventItem } from "../types/event";
import { EventCard } from "../components/events/EventCard";
import { CreateEventModal } from "../components/events/CreateEventModal";

interface EventDashboardProps {
  onSelectEvent: (event: EventItem) => void;
}

export const EventDashboard = ({ onSelectEvent }: EventDashboardProps) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateEvent = (newEvent: EventItem) => {
    setEvents((prev) => [newEvent, ...prev]);
  };

  return (
    <div className="relative max-w-6xl mx-auto">
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] py-24 px-4 text-center border border-dashed border-slate-800/80 rounded-3xl bg-slate-900/20 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-base font-semibold text-slate-200">No events created yet</p>
          <p className="text-sm text-slate-400 mt-1 max-w-sm">
            Your dashboard is clean. Click the action button below to add your first event.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-24">
          {events.map((event) => (
            <EventCard key={event.id} event={event} onSelect={onSelectEvent} />
          ))}
        </div>
      )}

      <button
        onClick={() => setIsModalOpen(true)}
        title="Create Event"
        className="fixed bottom-8 right-8 flex items-center justify-center w-14 h-14 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-full shadow-lg shadow-indigo-600/30 transition-all duration-200 cursor-pointer z-40 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <CreateEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateEvent}
      />
    </div>
  );
};
