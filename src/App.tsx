import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEventStore } from "./store/useEventStore";
import { EventDashboard } from "./pages/EventDashboard";
import { EventView } from "./pages/EventView";

export default function App() {
  const { events, selectedEventId, fetchEvents, selectEvent, deleteEvent } =
    useEventStore();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null;

  const handleStartDrag = async (e: React.MouseEvent) => {
    if (e.button === 0) {
      try {
        await getCurrentWindow().startDragging();
      } catch (err) {
        console.error("Window drag error:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <header
        onMouseDown={handleStartDrag}
        className="h-10 bg-slate-950/80 backdrop-blur border-b border-slate-800/80 flex items-center justify-between px-4 z-50 select-none cursor-default"
      >
        <div className="flex items-center gap-2 pointer-events-none">
          <div className="w-16" />
        </div>

        <span className="text-xs font-medium tracking-wide text-slate-400 pointer-events-none">
          {selectedEvent?.name || "Planno"}
        </span>

        <div className="w-16 flex justify-end pointer-events-none" />
      </header>

      {/* Main Content Area */}
      <main className="relative flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none" />

        {selectedEvent ? (
          <EventView
            event={selectedEvent}
            onBack={() => selectEvent(null)}
            onDelete={deleteEvent}
          />
        ) : (
          <EventDashboard />
        )}
      </main>
    </div>
  );
}
