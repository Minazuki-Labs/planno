import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensors, useSensor, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { EventTabItem } from "../../types/event";
import { SortableTabItem } from "./TabRow";
import { TabTypeIcon } from "../common/TabTypeIcon";

interface TabListSectionProps {
  eventId: string;
  eventTabs: EventTabItem[];
  expandedTabIds: Set<string>;
  onDeleteTab: (tabId: string, eventId: string) => void;
  onToggleExpansion: (tabId: string) => void;
  onUpdateTabLabel: (tab: EventTabItem, newLabel: string) => void;
  onToggleGroups: (tab: EventTabItem, groupsEnabled: boolean) => void;
  onReorderTabs: (eventId: string, reorderedTabs: EventTabItem[]) => void;
  onOpenAddModal: () => void;
}

export const TabListSection = ({
  eventId,
  eventTabs,
  expandedTabIds,
  onDeleteTab,
  onToggleExpansion,
  onUpdateTabLabel,
  onToggleGroups,
  onReorderTabs,
  onOpenAddModal,
}: TabListSectionProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (dragEvent: DragEndEvent) => {
    const { active, over } = dragEvent;
    if (!over || active.id === over.id) return;

    const oldIndex = eventTabs.findIndex((t) => t.id === active.id);
    const newIndex = eventTabs.findIndex((t) => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(eventTabs, oldIndex, newIndex);
      const updatedTabsWithPositions = reordered.map((tab, idx) => ({
        ...tab,
        position: idx,
      }));
      onReorderTabs(eventId, updatedTabsWithPositions);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-6 backdrop-blur-md shadow-xl">
      <div className="pb-4 border-b border-slate-800/60">
        <span className="text-[10px] font-extrabold tracking-widest text-indigo-400 uppercase">
          Tabs Settings
        </span>
        <p className="text-xs text-slate-400 mt-1">
          Configure specific tabs and features for this event.
        </p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={eventTabs.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {eventTabs.map((tab, index) => (
              <SortableTabItem
                key={tab.id}
                tab={tab}
                index={index}
                isExpanded={expandedTabIds.has(tab.id)}
                onDelete={onDeleteTab}
                onToggleExpansion={onToggleExpansion}
                onUpdateLabel={onUpdateTabLabel}
                onToggleGroups={onToggleGroups}
                getTabTypeIcon={(type) => <TabTypeIcon type={type} />}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="pt-4 border-t border-slate-800/60 flex justify-end">
        <button
          type="button"
          onClick={onOpenAddModal}
          className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap min-h-[38px]"
        >
          + Add Tab
        </button>
      </div>
    </div>
  );
};
