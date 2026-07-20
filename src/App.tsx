import { useState } from "react";
import { EventItem } from "./types/event";
import { EventDashboard } from "./pages/EventDashboard";

export default function App() {
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      {selectedEvent ? (
        <div>
          <button
            onClick={() => setSelectedEvent(null)}
            className="mb-6 px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold">{selectedEvent.name} Details</h1>
        </div>
      ) : (
        <EventDashboard onSelectEvent={(event) => setSelectedEvent(event)} />
      )}
    </main>
  );
}
