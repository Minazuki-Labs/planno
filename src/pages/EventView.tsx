import { useState, useRef, useEffect, useLayoutEffect } from "react";

import { EventItem } from "../types/event";
import { useEventStore } from "../store/useEventStore";
import { DetailsTab } from "../components/details/DetailsTab";
import { ScheduleTab } from "../components/schedule/ScheduleTab";
import { BudgetTab } from "../components/budget/BudgetTab";
import { CommitteeTab } from "../components/committee/CommitteeTab";
import { ParticipantTab } from "../components/participant/ParticipantTab";

interface EventViewProps {
  event: EventItem;
  onBack: () => void;
  onDelete: (eventId: string) => void;
}

type TabType = "schedule" | "participant" | "budget" | "committee" | "details";

export const EventView = ({ event, onBack, onDelete }: EventViewProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("schedule");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [useDropdown, setUseDropdown] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const backBtnRef = useRef<HTMLButtonElement>(null);
  const fullNavMeasureRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updateEvent = useEventStore((state) => state.updateEvent);

  const confirmDelete = () => {
    onDelete(event.id);
    onBack();
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "schedule", label: "Schedule" },
    { id: "participant", label: "Participant" },
    { id: "budget", label: "Budget" },
    { id: "committee", label: "Committee" },
    { id: "details", label: "Details" },
  ];

  useLayoutEffect(() => {
    const checkOverflow = () => {
      if (!containerRef.current || !backBtnRef.current || !fullNavMeasureRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      const backBtnWidth = backBtnRef.current.offsetWidth;
      const fullNavWidth = fullNavMeasureRef.current.offsetWidth;
      const gap = 16;

      setUseDropdown(backBtnWidth + fullNavWidth + gap > containerWidth);
    };

    checkOverflow();

    const resizeObserver = new ResizeObserver(() => checkOverflow());
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [tabs.length]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUpdateEvent = async (updatedEvent: EventItem) => {
    await updateEvent(updatedEvent);
  };

  const currentTabLabel = tabs.find((tab) => tab.id === activeTab)?.label || "Menu";

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6">
      <div
        ref={fullNavMeasureRef}
        aria-hidden="true"
        className="fixed -top-[9999px] -left-[9999px] pointer-events-none opacity-0 flex items-center gap-1.5 p-1.5"
      >
        {tabs.map((tab) => (
          <span key={tab.id} className="px-4 py-2.5 text-sm font-medium whitespace-nowrap">
            {tab.label}
          </span>
        ))}
      </div>

      {/* Navigation Header */}
      <div
        ref={containerRef}
        className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-3 h-[60px]"
      >
        <button
          ref={backBtnRef}
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 h-10.5 px-4 text-sm font-medium text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-all cursor-pointer shrink-0"
        >
          <span>←</span> Back to Dashboard
        </button>

        {useDropdown ? (
          /* Dropdown Menu Mode */
          <div ref={dropdownRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="inline-flex items-center gap-2.5 h-10.5 px-4 bg-slate-900/80 hover:bg-slate-900 border border-slate-700/70 hover:border-slate-600 text-white rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{currentTabLabel}</span>
              <svg
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-slate-950/95 border border-slate-800 rounded-2xl p-2 shadow-2xl backdrop-blur-xl z-50 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                          : "text-slate-300 hover:text-white hover:bg-slate-900"
                      }`}
                    >
                      <span>{tab.label}</span>
                      {isActive && (
                        <svg className="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Full Pill Tabs Mode */
          <nav className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 border border-slate-800 rounded-xl shadow-sm backdrop-blur-sm shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* Tab Views */}
      <main>
        {activeTab === "details" && (
          <DetailsTab 
            event={event} 
            onDelete={() => setShowConfirmModal(true)}
            onUpdate={handleUpdateEvent} 
          />
        )}
        {activeTab === "schedule" && <ScheduleTab event={event} />}
        {activeTab === "budget" && <BudgetTab />}
        {activeTab === "committee" && <CommitteeTab />}
        {activeTab === "participant" && <ParticipantTab eventId={event.id} />}
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Delete Event</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to delete <span className="text-slate-200 font-semibold">"{event.name}"</span>? This action is permanent and cannot be undone.[cite: 2]
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
