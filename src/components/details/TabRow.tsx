import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { EventTabItem, EventTabType } from "../../types/event";

interface SortableTabItemProps {
  tab: EventTabItem;
  index: number;
  isExpanded: boolean;
  onDelete: (tabId: string, eventId: string) => void;
  onToggleExpansion: (tabId: string) => void;
  onUpdateLabel: (tab: EventTabItem, newLabel: string) => void;
  onToggleGroups: (tab: EventTabItem, groupsEnabled: boolean) => void;
  getTabTypeIcon: (type: EventTabType) => React.ReactNode;
}

export const SortableTabItem = ({
  tab,
  isExpanded,
  onDelete,
  onToggleExpansion,
  onUpdateLabel,
  onToggleGroups,
  getTabTypeIcon,
}: SortableTabItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  const isParticipant = tab.tabType === EventTabType.Participant;
  const groupsEnabled = isParticipant && (tab.settings?.groupsEnabled ?? true);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-slate-950/40 border rounded-xl transition-colors overflow-hidden ${
        isDragging ? "opacity-50 border-indigo-500 shadow-2xl bg-slate-900/80" : "border-slate-800/60 hover:border-slate-700/80"
      }`}
    >
      {/* Header Row */}
      <div className="p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3 flex-1">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="text-slate-600 hover:text-slate-300 cursor-grab active:cursor-grabbing p-1 touch-none"
            title="Drag to reorder"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>

          <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800/80 flex items-center justify-center">
            {getTabTypeIcon(tab.tabType)}
          </div>

          <input
            type="text"
            value={tab.label}
            onChange={(e) => onUpdateLabel(tab, e.target.value)}
            className="bg-slate-900 border border-slate-700/60 focus:border-indigo-500 focus:outline-none rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-100 w-full max-w-xs transition-all"
            placeholder="Tab Label"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onDelete(tab.id, tab.eventId)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
            title="Delete Tab"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => onToggleExpansion(tab.id)}
            className={`p-1.5 rounded-lg border transition-all text-slate-400 cursor-pointer ${
              isExpanded
                ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300"
                : "bg-slate-900/80 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
            }`}
            title={isExpanded ? "Collapse Settings" : "Extend Settings"}
          >
            <svg
              className={`w-4 h-4 transform transition-transform duration-200 ${
                isExpanded ? "rotate-180" : "rotate-0"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Extended Settings Drawer */}
      {isExpanded && (
        <div className="bg-slate-950/60 border-t border-slate-800/60 p-4 space-y-3">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">
            {tab.label} Settings ({tab.tabType})
          </p>

          {isParticipant ? (
            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-200">Groups</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Enable grouping to organize participants into teams.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={groupsEnabled}
                onClick={() => onToggleGroups(tab, !groupsEnabled)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  groupsEnabled ? "bg-indigo-600" : "bg-slate-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    groupsEnabled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ) : (
            <div className="p-3 text-xs text-slate-400 italic bg-slate-900/30 rounded-lg border border-slate-800/40">
              No configurable settings available for this tab type yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
