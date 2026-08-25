import { useEffect, useState, useMemo, useRef } from "react";
import { EventItem, ActivityItem } from "../../types/event";
import { useEventStore } from "../../store/useEventStore";
import { CreateActivityModal } from "./CreateActivityModal";
import { ActivityDetailsModal } from "./ActivityDetailsModal";
import { ScheduleDayColumn } from "./ScheduleDayColumn";
import {
  START_HOUR,
  END_HOUR,
  HOUR_HEIGHT_PX,
  TIME_COL_WIDTH,
  MIN_DAY_COL_WIDTH,
  generateEventDays,
  calculateBlockGeometry,
} from "./scheduleUtils";

interface ScheduleTabProps {
  event: EventItem;
}

export const ScheduleTab = ({ event }: ScheduleTabProps) => {
  const { activities, fetchActivities, createActivity, deleteActivity, undoActivity, updateActivity } = useEventStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ dayDate: string; startTime: string; endTime: string } | null>(null);
  const [viewedActivity, setViewedActivity] = useState<ActivityItem | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrolledEventIdRef = useRef<string | null>(null);

  const eventDays = useMemo(() => generateEventDays(event.eventDate), [event.eventDate]);
  const hoursArray = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
  const totalGridHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT_PX;

  const handleOpenSlot = (dayDate: string, hour: number) => {
    const formattedStart = `${hour.toString().padStart(2, "0")}:00`;
    const endHour = Math.min(hour + 1, END_HOUR);
    const formattedEnd = `${endHour.toString().padStart(2, "0")}:00`;

    setSelectedSlot({ dayDate, startTime: formattedStart, endTime: formattedEnd });
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchActivities(event.id);
  }, [event.id, fetchActivities]);

  // Keyboard shortcut for undo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes(
        (e.target as HTMLElement)?.tagName
      );
      if (isInput || isModalOpen || viewedActivity) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undoActivity();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undoActivity, isModalOpen, viewedActivity]);

  // Auto-scroll to earliest activity on event change
  useEffect(() => {
    if (lastScrolledEventIdRef.current === event.id || !activities?.length || !scrollContainerRef.current) return;

    const currentEventActivities = activities.filter((act) => act.eventId === event.id);
    if (!currentEventActivities.length) return;

    const earliestTop = currentEventActivities.reduce((minTop, act) => {
      const { top } = calculateBlockGeometry(act.startTime, act.endTime);
      return Math.min(minTop, top);
    }, Infinity);

    if (earliestTop !== Infinity) {
      scrollContainerRef.current.scrollTo({ top: Math.max(0, earliestTop - 40), behavior: "smooth" });
      lastScrolledEventIdRef.current = event.id;
    }
  }, [activities, event.id]);

  const handleCreateActivity = async (newActivity: ActivityItem) => {
    await createActivity(newActivity);

    const { top } = calculateBlockGeometry(newActivity.startTime, newActivity.endTime);
    const targetTop = Math.max(0, top - 40);

    const dayIndex = eventDays.findIndex((d) => d.fullDate === newActivity.dayDate);
    let targetLeft = 0;

    if (scrollContainerRef.current && dayIndex !== -1) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      const dayColumnWidth = Math.max(MIN_DAY_COL_WIDTH, (containerWidth - TIME_COL_WIDTH) / Math.max(eventDays.length, 1));
      targetLeft = Math.max(0, dayIndex * dayColumnWidth);
    }

    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({ top: targetTop, left: targetLeft, behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-6 flex flex-col min-h-[640px]">
      {/* Header Controls */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-800/70 shrink-0">
        <h2 className="text-lg font-semibold tracking-tight text-white">Event Schedule</h2>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl text-xs font-medium transition-all shadow-lg shadow-indigo-600/25 border border-indigo-400/20 cursor-pointer"
        >
          <span className="text-base leading-none">+</span> Add Activity
        </button>
      </div>

      <div ref={scrollContainerRef} className="bg-slate-950/40 border border-slate-800/70 rounded-2xl flex-1 min-h-[500px] max-h-[700px] overflow-auto relative scroll-smooth">
        <div className="w-full min-w-full inline-grid" style={{ gridTemplateColumns: `64px repeat(${eventDays.length}, minmax(130px, 1fr))` }}>
          {/* Days Header */}
          <div className="col-span-full grid grid-cols-subgrid items-center border-b border-slate-800/80 sticky top-0 bg-slate-900/95 backdrop-blur-md z-30 py-3">
            <div />
            {eventDays.map((day) => (
              <div key={day.fullDate} className="flex flex-col items-center justify-center gap-1">
                <span className="text-[11px] font-medium tracking-wider uppercase text-slate-400">{day.dayLabel}</span>
                <span className="w-8 h-8 flex items-center justify-center rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 border border-slate-700/60 transition-all">
                  {day.dateNum}
                </span>
              </div>
            ))}
          </div>

          {/* Timetable Body */}
          <div className="col-span-full grid grid-cols-subgrid relative">
            {/* Hour Labels Column */}
            <div 
              className="relative text-[11px] font-medium text-slate-500 select-none pr-3 sticky left-0 bg-slate-900/95 backdrop-blur-md z-20"
              style={{ height: `${totalGridHeight}px` }}
            >
              {hoursArray.map((hour) => (
                <div 
                  key={hour} 
                  style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT_PX}px` }} 
                  className="absolute right-3 -translate-y-1/2"
                >
                  {hour.toString().padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {eventDays.map((day) => (
              <ScheduleDayColumn
                key={day.fullDate}
                dayDate={day.fullDate}
                activities={activities.filter((a) => a.dayDate === day.fullDate)}
                totalGridHeight={totalGridHeight}
                onSelectSlot={handleOpenSlot}
                onSelectActivity={(act) => setViewedActivity(act)}
                onDeleteActivity={deleteActivity}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Add Activity Modal */}
      <CreateActivityModal
        isOpen={isModalOpen}
        eventId={event.id}
        availableDays={eventDays}
        existingActivities={activities}
        initialDayDate={selectedSlot?.dayDate}
        initialStartTime={selectedSlot?.startTime}
        initialEndTime={selectedSlot?.endTime}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSlot(null);
        }}
        onSubmit={handleCreateActivity}
      />

      {/* View Activity Details Modal */}
      <ActivityDetailsModal
        activity={viewedActivity}
        availableDays={eventDays}
        existingActivities={activities}
        onClose={() => setViewedActivity(null)}
        onDelete={deleteActivity}
        onUpdate={updateActivity}
      />
    </div>
  );
};
