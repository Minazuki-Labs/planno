import { useState, SubmitEvent } from "react";

interface EventItem {
  id: string;
  name: string;
  eventDate: string;
  lastEdited: string;
}

function App() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");

  const handleOpenModal = () => {
    setEventName("");
    setEventDate(new Date().toISOString().split("T")[0]);
    setIsModalOpen(true);
  };

  const handleCreateEvent = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!eventName.trim()) return;

    const newEvent: EventItem = {
      id: crypto.randomUUID(),
      name: eventName.trim(),
      eventDate: new Date(eventDate).toLocaleDateString(),
      lastEdited: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setEvents((prev) => [newEvent, ...prev]);
    setIsModalOpen(false);
  };

  return (
    <main className="relative flex min-h-screen flex-col bg-slate-900 p-8 text-white select-none">
      {/* Header Section */}
      <header className="border-b border-slate-800 pb-6 mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">My Drive</h1>
        <p className="text-sm text-slate-400 mt-1">Manage and view your upcoming events</p>
      </header>

      {/* Grid View for Event Cards */}
      {events.length === 0 ? (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-2xl p-12">
          <p className="text-base font-medium text-slate-400">No events created yet</p>
          <p className="text-xs text-slate-500 mt-1">Click the + button below to create one.</p>
        </div>
      ) : (
        /* Card Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex flex-col justify-between bg-slate-800/60 border border-slate-800 hover:border-slate-700 p-5 rounded-xl transition-all duration-200 group"
            >
              <div>
                <span className="inline-block text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 bg-slate-700/50 text-indigo-400 rounded mb-3">
                  Event
                </span>
                <h2 className="text-base font-medium text-slate-200 group-hover:text-indigo-400 transition-colors">
                  {event.name}
                </h2>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400 space-y-1.5">
                <div className="flex justify-between">
                  <span>Event Date</span>
                  <span className="text-slate-300 font-medium">{event.eventDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Edited</span>
                  <span className="text-slate-300 font-medium">{event.lastEdited}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={handleOpenModal}
        title="Create Event"
        className="fixed bottom-8 right-8 flex items-center justify-center w-14 h-14 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-full shadow-lg shadow-indigo-600/30 transition-all duration-200 cursor-pointer z-10"
      >
        <span className="text-2xl font-light leading-none">+</span>
      </button>

      {/* Minimalist Create Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-6">
            <h2 className="text-lg font-semibold text-slate-100">Create New Event</h2>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Event Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design Sync"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700 focus:border-indigo-500 rounded-lg px-3.5 py-2 text-sm text-slate-200 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Event Date
                </label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700 focus:border-indigo-500 rounded-lg px-3.5 py-2 text-sm text-slate-200 outline-none transition-colors [color-scheme:dark]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
