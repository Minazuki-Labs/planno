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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header & Actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors cursor-pointer"
        >
          ← Back to Dashboard
        </button>

        <button
          type="button"
          onClick={() => setShowConfirmModal(true)}
          className="px-4 py-2 text-xs font-semibold bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl transition-all cursor-pointer"
        >
          Delete Event
        </button>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Views */}
      {activeTab === "details" && <DetailsTab event={event} />}
      {activeTab === "schedule" && <ScheduleTab />}
      {activeTab === "budget" && <BudgetTab />}
      {activeTab === "committee" && <CommitteeTab />}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Delete Event?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to delete <span className="text-slate-200 font-medium">"{event.name}"</span>? This action cannot be undone.
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
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all shadow-lg shadow-rose-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
