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
  
  const [isRange, setIsRange] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const formatToYMDHM = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
  };

  const formatToYMD = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}/${mm}/${dd}`;
  };

  const handleOpenModal = () => {
    const today = new Date().toISOString().split("T")[0];
    setEventName("");
    setIsRange(false);
    setStartDate(today);
    setEndDate(today);
    setIsModalOpen(true);
  };

  const handleCreateEvent = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!eventName.trim()) return;

    let formattedEventDate = formatToYMD(startDate);
    if (isRange && endDate) {
      formattedEventDate = `${formatToYMD(startDate)} - ${formatToYMD(endDate)}`;
    }

    const newEvent: EventItem = {
      id: crypto.randomUUID(),
      name: eventName.trim(),
      eventDate: formattedEventDate,
      lastEdited: formatToYMDHM(new Date()),
    };

    setEvents((prev) => [newEvent, ...prev]);
    setIsModalOpen(false);
  };

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none" />

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
              <div
                key={event.id}
                className="group relative flex flex-col justify-between bg-slate-900/60 backdrop-blur-md border border-slate-800/80 hover:border-slate-700/80 p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
                      Upcoming
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {event.name}
                  </h2>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800/60 text-xs text-slate-400 space-y-2">
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
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleOpenModal}
        title="Create Event"
        className="fixed bottom-8 right-8 flex items-center justify-center w-14 h-14 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-full shadow-lg shadow-indigo-600/30 transition-all duration-200 cursor-pointer z-40 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Create New Event</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design Systems Sync"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Event Date Format
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsRange(!isRange)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer"
                  >
                    {isRange ? "Switch to Single Day" : "Switch to Date Range"}
                  </button>
                </div>

                {isRange ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase mb-1">Start Date</span>
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-100 outline-none transition-all [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase mb-1">End Date</span>
                      <input
                        type="date"
                        required
                        min={startDate}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-100 outline-none transition-all [color-scheme:dark]"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none transition-all [color-scheme:dark]"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer"
                >
                  Create Event
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
