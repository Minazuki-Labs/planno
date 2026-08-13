import { useEffect, useState, useMemo } from "react";
import { EventItem } from "../../../types/event";
import { useEventStore } from "../../../store/useEventStore";
import { CreateActivityModal } from "../CreateActivityModal";

interface ScheduleTabProps {
  event: EventItem;
}

const START_HOUR = 8;
const END_HOUR = 13;
const HOUR_HEIGHT_PX = 80;

export const ScheduleTab = ({ event }: ScheduleTabProps) => {
  const { activities, fetchActivities, createActivity, deleteActivity } = useEventStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchActivities(event.id);
  }, [event.id, fetchActivities]);

  const eventDays = useMemo(() => {
    const days: { fullDate: string; dayLabel: string; dateNum: number }[] = [];
    
    // Fallback if eventDate is "To Be Confirmed" or single day
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
        // Default to a 4-day view starting from event date
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 3);
      }
    } else {
      // Default fallback 4 days
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 3);
    }

    const current = new Date(startDate);
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
    const height = (endTotalHours - startTotalHours) * HOUR_HEIGHT_PX;

    return { top: Math.max(0, top), height };
  };

  const hoursArray = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-6 flex flex-col min-h-[600px]">      {/* Header Controls */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 shrink-0">
        <div>
          <h2 className="text-base font-bold text-white">Event Schedule Canvas</h2>
          <p className="text-xs text-slate-400">Manage daily activity timetable blocks</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          + Add Activity
        </button>
      </div>

      {/* Canvas Timetable Grid */}
      <div className="bg-white text-slate-900 rounded-2xl shadow-xl flex-1 min-h-0 overflow-auto relative">
        <div 
          className="w-full min-w-[700px] p-6"
          style={{
            display: "grid",
            gridTemplateColumns: `60px repeat(${eventDays.length}, 1fr)`,
          }}
        >
          {/* Days Header */}
          <div className="col-span-full grid grid-cols-subgrid items-center border-b border-slate-100 pb-4 mb-2 sticky top-0 bg-white z-20">
            <div /> {/* Empty corner block */}
            {eventDays.map((day, idx) => (
              <div key={day.fullDate} className="flex flex-col items-center justify-center space-y-1">
                <span className="text-xs font-semibold text-slate-500">{day.dayLabel}</span>
                <span
                  className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold transition-all ${
                    idx === 0 ? "bg-blue-600 text-white shadow-md shadow-blue-500/30" : "text-slate-800"
                  }`}
                >
                  {day.dateNum}
                </span>
              </div>
            ))}
          </div>

          {/* Timetable Body */}
          <div className="col-span-full grid grid-cols-subgrid relative">
            {/* Hour Labels Column */}
            <div className="flex flex-col text-xs font-semibold text-slate-400 select-none pr-2 sticky left-0 bg-white z-20">
              {hoursArray.map((hour) => (
                <div key={hour} style={{ height: `${HOUR_HEIGHT_PX}px` }} className="pt-0">
                  {hour}:00
                </div>
              ))}
            </div>

            {/* Grid Day Columns */}
            {eventDays.map((day) => {
              const dayActivities = activities.filter((a) => a.dayDate === day.fullDate);

              return (
                <div
                  key={day.fullDate}
                  className="relative border-l border-slate-100/80 px-1"
                  style={{ height: `${(END_HOUR - START_HOUR + 1) * HOUR_HEIGHT_PX}px` }}
                >
                  {/* Horizontal Guide Lines */}
                  {hoursArray.map((hour) => (
                    <div
                      key={hour}
                      className="absolute w-full border-b border-slate-100/60"
                      style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT_PX}px` }}
                    />
                  ))}

                  {/* Activity Color Blocks */}
                  {dayActivities.map((act) => {
                    const { top, height } = calculateBlockGeometry(act.startTime, act.endTime);

                    return (
                      <div
                        key={act.id}
                        style={{ top: `${top}px`, height: `${height - 4}px` }}
                        className={`absolute left-1 right-1 rounded-2xl p-3 shadow-md ${act.color} flex flex-col justify-between group transition-transform hover:scale-[1.02] z-10 cursor-pointer overflow-hidden`}
                      >
                        <div>
                          <p className="font-semibold text-xs leading-tight truncate">{act.title}</p>
                          <p className="text-[10px] opacity-80 mt-1">
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
                          className="self-end opacity-0 group-hover:opacity-100 text-[10px] bg-black/20 hover:bg-black/40 px-1.5 py-0.5 rounded transition-opacity"
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

      {/* Add Modal */}
      <CreateActivityModal
        isOpen={isModalOpen}
        eventId={event.id}
        availableDays={eventDays}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createActivity}
      />
    </div>
  );
};
