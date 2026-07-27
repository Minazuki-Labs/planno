// src/App.tsx
import { useState } from "react";
import { EventItem } from "./types/event";
import { EventDashboard } from "./pages/EventDashboard";
import { EventDetail } from "./pages/EventDetail";

export default function App() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null;

  const handleCreateEvent = (newEvent: EventItem) => {
    setEvents((prev) => [newEvent, ...prev]);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setSelectedEventId(null);
  };

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      {selectedEvent ? (
        <EventDetail
          event={selectedEvent}
          onBack={() => setSelectedEventId(null)}
          onDelete={handleDeleteEvent}
        />
      ) : (
        <EventDashboard
          events={events}
          onSelectEvent={(event) => setSelectedEventId(event.id)}
          onCreateEvent={handleCreateEvent}
        />
      )}
    </main>
  );
}
