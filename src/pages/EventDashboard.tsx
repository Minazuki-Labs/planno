import { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { useEventStore } from "../store/useEventStore";
import { EventCard } from "../components/events/EventCard";
import { CreateEventModal } from "../components/events/CreateEventModal";

export const EventDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const events = useEventStore((state) => state.events);
  const selectEvent = useEventStore((state) => state.selectEvent);

  useEffect(() => {
    setIsMac(navigator.userAgent.toUpperCase().includes("MAC"));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setIsModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDateRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const setPresetToday = () => {
    const now = new Date();
    setStartDate(now);
    setEndDate(now);
  };

  const setPresetThisWeek = () => {
    const now = new Date();
    const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
    const lastDay = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    setStartDate(firstDay);
    setEndDate(lastDay);
  };

  const setPresetThisMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setStartDate(firstDay);
    setEndDate(lastDay);
  };

  const filteredEvents = events.filter((event) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = event.name?.toLowerCase().includes(query);
    const locationMatch = event.location?.toLowerCase().includes(query);
    const matchesSearch = nameMatch || locationMatch;

    if (!matchesSearch) return false;

    if (startDate || endDate) {
      if (!event.eventDate || event.eventDate === "To Be Confirmed") return false;

      const parseToMidnight = (dateVal: string | Date) => {
        if (typeof dateVal === "string") {
          const cleaned = dateVal.trim().replace(/-/g, "/");
          const parts = cleaned.split("/").map(Number);
          if (parts.length === 3 && !parts.some(isNaN)) {
            return new Date(parts[0], parts[1] - 1, parts[2]).getTime();
          }
        }
        const d = new Date(dateVal);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      };

      const rawDateStr = String(event.eventDate);
      const rangeParts = rawDateStr.includes(" - ") 
        ? rawDateStr.split(" - ") 
        : [rawDateStr, rawDateStr];

      const eventStartTime = parseToMidnight(rangeParts[0]);
      const eventEndTime = parseToMidnight(rangeParts[1]);

      if (isNaN(eventStartTime) || isNaN(eventEndTime)) return false;

      if (startDate) {
        const filterStartTime = parseToMidnight(startDate);
        if (eventEndTime < filterStartTime) return false;
      }

      if (endDate) {
        const filterEndTime = parseToMidnight(endDate);
        if (eventStartTime > filterEndTime) return false;
      }
    }

    return true;
  });

  const hasDateFilter = Boolean(startDate || endDate);
  const hasActiveFilters = searchQuery || hasDateFilter;

  const clearFilters = () => {
    setSearchQuery("");
    setStartDate(null);
    setEndDate(null);
  };

  const formatDateLabel = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const renderActiveDateLabel = () => {
    if (startDate && !endDate) return formatDateLabel(startDate);
    if (startDate && endDate) {
      return `${formatDateLabel(startDate)} – ${formatDateLabel(endDate)}`;
    }
    return "";
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto px-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/60 select-none">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Events</h1>
          <p className="text-xs text-slate-400">Manage and schedule your event calendar</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-900/80 border border-slate-800 focus:border-indigo-500/80 text-slate-200 placeholder-slate-500 rounded-lg text-xs outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="relative" ref={filterRef}>
            <button
              type="button"
              aria-label="Filter by date"
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className={`relative flex items-center justify-center p-2 bg-slate-900/80 border text-xs rounded-lg transition-all shadow-sm shrink-0 ${
                hasDateFilter
                  ? "border-indigo-500/80 text-indigo-400 bg-indigo-950/30"
                  : "border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>

              {hasDateFilter && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-2 ring-slate-950" />
              )}
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 w-72 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-semibold text-slate-200">Filter by Date</span>
                  {hasDateFilter && (
                    <button
                      type="button"
                      onClick={() => {
                        setStartDate(null);
                        setEndDate(null);
                      }}
                      className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1.5 pb-1">
                  <button
                    type="button"
                    onClick={setPresetToday}
                    className="py-1 px-2 text-[11px] font-medium rounded-md bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-slate-100 transition-colors border border-slate-700/50"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={setPresetThisWeek}
                    className="py-1 px-2 text-[11px] font-medium rounded-md bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-slate-100 transition-colors border border-slate-700/50"
                  >
                    This Week
                  </button>
                  <button
                    type="button"
                    onClick={setPresetThisMonth}
                    className="py-1 px-2 text-[11px] font-medium rounded-md bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-slate-100 transition-colors border border-slate-700/50"
                  >
                    This Month
                  </button>
                </div>

                <div className="flex justify-center pt-1">
                  <DatePicker
                    selectsRange
                    startDate={startDate}
                    endDate={endDate}
                    onChange={handleDateRangeChange}
                    inline
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-sm transition-all duration-150 cursor-pointer shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Event</span>
            <kbd className="hidden sm:inline-flex items-center ml-1 px-1.5 py-0.5 text-[10px] bg-slate-950/40 text-indigo-100 rounded border border-white/20 font-mono font-medium shadow-inner">
              {isMac ? "⌘N" : "Ctrl+N"}
            </kbd>
          </button>
        </div>
      </div>

      {hasDateFilter && (
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-950/40 border border-indigo-500/30 rounded-full text-xs font-medium text-indigo-300 animate-in fade-in duration-150">
            <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{renderActiveDateLabel()}</span>
            <button
              type="button"
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
              }}
              className="ml-1 p-0.5 hover:bg-indigo-900/50 rounded-full text-indigo-400 hover:text-indigo-200 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        </div>
      )}

      {filteredEvents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-slate-800/70 rounded-2xl bg-slate-900/30">
          <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mb-4 text-slate-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-200">
            {hasActiveFilters ? "No matching events" : "No events found"}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            {hasActiveFilters
              ? "No events found matching your filter criteria. Try adjusting your search term or date range."
              : "Get started by creating your first scheduled event."}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="mt-4 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-lg transition-colors"
            >
              + Create Event
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-1">
          {filteredEvents.map((event) => (
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
