import { useState, useEffect } from "react";
import { EventItem, EventTabItem, EventTabType } from "../../types/event";
import { useEventStore } from "../../store/useEventStore";
import { EventDetailsCard } from "./EventDetailsCard";
import { TabListSection } from "./TabListSection";
import { AddTabModal } from "./AddTabModal";

interface DetailsTabProps {
  event: EventItem;
  onDelete: () => void;
  onUpdate: (updatedEvent: EventItem) => void;
}

const formatDateToYMD = (date: Date | null): string => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
};

const formatTimestampToDisplay = (timestampStr: string): string => {
  const date = new Date(timestampStr);
  if (isNaN(date.getTime())) return timestampStr;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const DetailsTab = ({ event, onDelete, onUpdate }: DetailsTabProps) => {
  const eventTabs = useEventStore((state) => state.eventTabs[event.id] || []);
  const fetchEventTabs = useEventStore((state) => state.fetchEventTabs);
  const createTab = useEventStore((state) => state.createTab);
  const deleteTab = useEventStore((state) => state.deleteTab);
  const updateTab = useEventStore((state) => state.updateTab);
  const reorderTabs = useEventStore((state) => state.reorderTabs);

  const [expandedTabIds, setExpandedTabIds] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchEventTabs(event.id);
  }, [event.id, fetchEventTabs]);

  const toggleTabExpansion = (tabId: string) => {
    setExpandedTabIds((prev) => {
      const next = new Set(prev);
      if (next.has(tabId)) next.delete(tabId);
      else next.add(tabId);
      return next;
    });
  };

  const handleAddTabSubmit = (label: string, type: EventTabType) => {
    const newTab: EventTabItem = {
      id: crypto.randomUUID(),
      eventId: event.id,
      tabType: type,
      label,
      position: eventTabs.length,
      ...(type === EventTabType.Participant ? { settings: { groupsEnabled: true } } : {}),
    } as EventTabItem;

    createTab(newTab);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <EventDetailsCard
        event={event}
        onDelete={onDelete}
        onUpdate={onUpdate}
        formatTimestampToDisplay={formatTimestampToDisplay}
        formatDateToYMD={formatDateToYMD}
      />

      <TabListSection
        eventId={event.id}
        eventTabs={eventTabs}
        expandedTabIds={expandedTabIds}
        onDeleteTab={deleteTab}
        onToggleExpansion={toggleTabExpansion}
        onUpdateTabLabel={(tab, newLabel) => updateTab({ ...tab, label: newLabel })}
        onToggleGroups={(tab, groupsEnabled) => {
          if (tab.tabType === EventTabType.Participant) {
            updateTab({ ...tab, settings: { ...tab.settings, groupsEnabled } });
          }
        }}
        onReorderTabs={reorderTabs}
        onOpenAddModal={() => setShowAddModal(true)}
      />

      <AddTabModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddTabSubmit}
      />
    </div>
  );
};
