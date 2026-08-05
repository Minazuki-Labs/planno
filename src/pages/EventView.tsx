import { useState } from "react";
import { EventItem } from "../types/event";
import { DetailsTab } from "../components/events/tabs/DetailsTab";
import { ScheduleTab } from "../components/events/tabs/ScheduleTab";
import { BudgetTab } from "../components/events/tabs/BudgetTab";
import { CommitteeTab } from "../components/events/tabs/CommitteeTab";

interface EventViewProps {
  event: EventItem;
  onBack: () => void;
  onDelete: (eventId: string) => void;
}

type TabType = "schedule" | "budget" | "committee" | "details";

export const EventView = ({ event, onBack, onDelete }: EventViewProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("schedule");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const confirmDelete = () => {
    onDelete(event.id);
    onBack();
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "schedule", label: "Schedule" },
    { id: "budget", label: "Budget" },
    { id: "committee", label: "Committee" },
    { id: "details", label: "Details" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 rounded-lg transition-all cursor-pointer"
        >
          <span>←</span> Back to Dashboard
        </button>

        <nav className="flex items-center gap-1 bg-slate-900/80 p-1 border border-slate-800 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Views */}
      <main>
        {activeTab === "details" && (
          <DetailsTab 
            event={event} 
            onDelete={() => setShowConfirmModal(true)} 
          />
        )}
        {activeTab === "schedule" && <ScheduleTab />}
        {activeTab === "budget" && <BudgetTab />}
        {activeTab === "committee" && <CommitteeTab />}
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Delete Event</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to delete <span className="text-slate-200 font-semibold">"{event.name}"</span>? This action is permanent and cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all shadow-md shadow-rose-600/20"
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
