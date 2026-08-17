import { useEffect, useState, useMemo, useRef } from "react";
import { EventItem, ActivityItem } from "../../types/event";
import { useEventStore } from "../../store/useEventStore";
import { CreateActivityModal } from "./CreateActivityModal";

interface ScheduleTabProps {
  event: EventItem;
}

const START_HOUR = 0;
const END_HOUR = 24;
const HOUR_HEIGHT_PX = 80;
const TIME_COL_WIDTH = 64;
const MIN_DAY_COL_WIDTH = 130;

export const ScheduleTab = ({ event }: ScheduleTabProps) => {
  const { activities, fetchActivities, createActivity, deleteActivity } = useEventStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrolledEventIdRef = useRef<string | null>(null);

  useEffect(() => {
    fetchActivities(event.id);
  }, [event.id, fetchActivities]);

  useEffect(() => {
    if (lastScrolledEventIdRef.current === event.id) return;
    if (!activities || activities.length === 0 || !scrollContainerRef.current) return;

    const currentEventActivities = activities.filter((act) => act.eventId === event.id);
    if (currentEventActivities.length === 0) return;

    // Find the earliest activity by start time
    const earliestTop = currentEventActivities.reduce((minTop, act) => {
      const { top } = calculateBlockGeometry(act.startTime, act.endTime);
      return Math.min(minTop, top);
    }, Infinity);

    if (earliestTop !== Infinity) {
      const targetScroll = Math.max(0, earliestTop - 40);
      
      scrollContainerRef.current.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });

      lastScrolledEventIdRef.current = event.id;
    }
  }, [activities, event.id]);

  const eventDays = useMemo(() => {
    const days: { fullDate: string; dayLabel: string; dateNum: number }[] = [];
    
    // Fallback if eventDate is "To Be Confirmed"
    let startDate = new Date();
    let endDate = new Date();

    if (event.eventDate && event.eventDate !== "To Be Confirmed") {
      const parts = event.eventDate.split(" - ");
      const parsedStart = new Date(parts[0]);
      if (!isNaN(parsedStart.getTime())) startDate = parsedStart;
      
      if (parts[1]) {
        const parsedEnd = new Date(parts[1]);
        if (!isNaN(parsedEnd.getTime())) endDate = parsedEnd;
      } else {
        // Single day event
        endDate = new Date(startDate);
      }
    } else {
      // Default fallback 4 days when event date is unconfirmed
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 3);
    }

    const current = new Date(startDate);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    while (current <= endDate && days.length < 7) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, "0");
      const day = String(current.getDate()).padStart(2, "0");

      days.push({
        fullDate: `${year}-${month}-${day}`,
        dayLabel: dayNames[current.getDay()],
        dateNum: current.getDate(),
      });
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [event.eventDate]);

  // Calculate pixel top offset and height based on time strings
  const calculateBlockGeometry = (startTime: string, endTime: string) => {
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    const startTotalHours = startH + startM / 60;
    const endTotalHours = endH + endM / 60;

    const top = (startTotalHours - START_HOUR) * HOUR_HEIGHT_PX;
    const height = Math.max(24, (endTotalHours - startTotalHours) * HOUR_HEIGHT_PX);

    return { top, height };
  };

  // Scroll to new activity
  const handleCreateActivity = async (newActivity: ActivityItem) => {
    await createActivity(newActivity);

    const { top } = calculateBlockGeometry(newActivity.startTime, newActivity.endTime);
    const targetTop = Math.max(0, top - 40);

    const dayIndex = eventDays.findIndex((d) => d.fullDate === newActivity.dayDate);
    let targetLeft = 0;

    if (scrollContainerRef.current && dayIndex !== -1) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      const totalDays = eventDays.length;
      
      const dayColumnWidth = Math.max(
        MIN_DAY_COL_WIDTH,
        (containerWidth - TIME_COL_WIDTH) / Math.max(totalDays, 1)
      );
      targetLeft = Math.max(0, dayIndex * dayColumnWidth);
    }

    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: targetTop,
          left: targetLeft,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  const hoursArray = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
  const totalGridHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT_PX;

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-6 flex flex-col min-h-[640px]">
      {/* Header Controls */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-800/70 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-white">Event Schedule</h2>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl text-xs font-medium transition-all shadow-lg shadow-indigo-600/25 border border-indigo-400/20 cursor-pointer"
        >
          <span className="text-base leading-none">+</span> Add Activity
        </button>
      </div>

      {/* Grid Container */}
      <div 
        ref={scrollContainerRef}
        className="bg-slate-950/40 border border-slate-800/70 rounded-2xl flex-1 min-h-[500px] max-h-[700px] overflow-auto relative scroll-smooth"
      >
        <div 
          className="w-full min-w-full inline-grid"
          style={{
            gridTemplateColumns: `64px repeat(${eventDays.length}, minmax(130px, 1fr))`,
          }}
        >
          {/* Days Header */}
          <div className="col-span-full grid grid-cols-subgrid items-center border-b border-slate-800/80 sticky top-0 bg-slate-900/95 backdrop-blur-md z-30 py-3">
            <div /> {/* Corner spacer */}
            {eventDays.map((day) => (
              <div key={day.fullDate} className="flex flex-col items-center justify-center gap-1">
                <span className="text-[11px] font-medium tracking-wider uppercase text-slate-400">
                  {day.dayLabel}
                </span>
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

            {/* Grid Day Columns */}
            {eventDays.map((day) => {
              const dayActivities = activities.filter((a) => a.dayDate === day.fullDate);

              return (
                <div
                  key={day.fullDate}
                  className="relative border-l border-slate-800/60"
                  style={{ height: `${totalGridHeight}px` }}
                >
                  {/* Horizontal Guideline Grid */}
                  {hoursArray.map((hour) => (
                    <div
                      key={hour}
                      className="absolute left-0 right-0 border-t border-slate-800/50 pointer-events-none"
                      style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT_PX}px` }}
                    />
                  ))}

                  {/* Activity Cards */}
                  {dayActivities.map((act) => {
                    const { top, height } = calculateBlockGeometry(act.startTime, act.endTime);

                    return (
                      <div
                        key={act.id}
                        style={{ 
                          top: `${top + 1}px`, 
                          height: `${height - 2}px` 
                        }}
                        className={`absolute left-1 right-1 rounded-xl p-2.5 shadow-lg border border-white/10 ${act.color} flex flex-col justify-between group transition-all duration-150 hover:z-20 hover:scale-[1.01] hover:brightness-110 hover:shadow-xl z-10 cursor-pointer overflow-hidden backdrop-blur-sm`}
                      >
                        <div className="min-w-0 pr-4">
                          <p className="font-semibold text-xs leading-snug truncate text-white drop-shadow-sm">
                            {act.title}
                          </p>
                          <p className="text-[10px] font-medium text-white/80 mt-0.5 truncate tracking-wide">
                            {act.startTime} - {act.endTime}
                          </p>
                        </div>

                        {/* Delete action on block hover */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteActivity(act.id);
                          }}
                          aria-label="Delete activity"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center text-[10px] bg-black/40 hover:bg-red-500/80 text-white rounded-md transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Activity Modal */}
      <CreateActivityModal
        isOpen={isModalOpen}
        eventId={event.id}
        availableDays={eventDays}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateActivity}
      />
    </div>
  );
};
