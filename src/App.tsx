import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { EventItem } from "./types/event";
import { EventDashboard } from "./pages/EventDashboard";
import { EventDetail } from "./pages/EventDetail";

export default function App() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const fetchedEvents = await invoke<EventItem[]>("get_events");
      setEvents(fetchedEvents);
    } catch (err) {
      console.error("Failed to fetch events from SQLite:", err);
    }
  };

  const handleCreateEvent = async (newEvent: EventItem) => {
    try {
      await invoke("create_event", { item: newEvent });
      await loadEvents();
    } catch (err) {
      console.error("Failed to create event:", err);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await invoke("delete_event", { id: eventId });
      setSelectedEventId(null);
      await loadEvents();
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null;

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
