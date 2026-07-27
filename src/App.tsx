// src/App.tsx
import { useEffect } from "react";
import { useEventStore } from "./store/useEventStore";
import { EventDashboard } from "./pages/EventDashboard";
import { EventDetail } from "./pages/EventDetail";

export default function App() {
  const { events, selectedEventId, fetchEvents, selectEvent, deleteEvent } =
    useEventStore();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null;

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      {selectedEvent ? (
        <EventDetail
          event={selectedEvent}
          onBack={() => selectEvent(null)}
          onDelete={deleteEvent}
        />
      ) : (
        <EventDashboard />
      )}
    </main>
  );
}
