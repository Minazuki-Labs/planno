import { useState, useMemo, useEffect } from "react";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { ParticipantItem } from "../../types/participant";
import { useEventStore } from "../../store/useEventStore";
import { ParticipantHeader } from "./ParticipantHeader";
import { ParticipantGroupCard } from "./ParticipantGroupCard";
import { ParticipantRow } from "./ParticipantRow";
import { AddGroupModal } from "./AddGroupModal";
import { AddParticipantModal } from "./AddParticipantModal";

interface ParticipantTabProps {
  eventId: string;
}

export const ParticipantTab = ({ eventId }: ParticipantTabProps) => {
  const {
    groups,
    participants,
    fetchGroups,
    fetchParticipants,
    createGroup,
    updateGroup,
    updateParticipant,
    createParticipant,
    deleteParticipant,
  } = useEventStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [activeParticipant, setActiveParticipant] = useState<ParticipantItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    if (eventId) {
      fetchGroups(eventId);
      fetchParticipants(eventId);
    }
  }, [eventId, fetchGroups, fetchParticipants]);

  // Filter participants by search query
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [participants, searchQuery]);

  // Group categorized data
  const groupedData = useMemo(() => {
    const map = new Map<string | null, ParticipantItem[]>();

    groups.forEach((g) => map.set(g.id, []));
    map.set(null, []); // Unassigned group

    filteredParticipants.forEach((p) => {
      const groupKey = p.groupId && groups.some((g) => g.id === p.groupId) ? p.groupId : null;
      map.set(groupKey, [...(map.get(groupKey) || []), p]);
    });

    return map;
  }, [groups, filteredParticipants]);

  const handleDragStart = (event: DragStartEvent) => {
    const item = participants.find((p) => p.id === event.active.id);
    if (item) setActiveParticipant(item);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveParticipant(null);

    if (!over) return;

    const participantId = active.id as string;
    const targetGroupId = over.id === "unassigned" ? null : (over.id as string);

    const currentParticipant = participants.find((p) => p.id === participantId);
    if (!currentParticipant || currentParticipant.groupId === targetGroupId) return;

    await updateParticipant({
      ...currentParticipant,
      groupId: targetGroupId,
    });
  };

  const unassigned = groupedData.get(null) || [];

  return (
    <DndContext
      sensors={sensors}
      autoScroll={{ threshold: { x: 0.15, y: 0.15 }, acceleration: 15 }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full space-y-6">
        <ParticipantHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenGroupModal={() => setIsGroupModalOpen(true)}
          onOpenParticipantModal={() => setIsParticipantModalOpen(true)}
        />

        {groups.length === 0 && participants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-slate-800/70 rounded-2xl bg-slate-900/30">
            <h3 className="text-sm font-semibold text-slate-200">No participants or groups yet</h3>
            <p className="text-xs text-slate-400 mt-1">Create groups and add members to organise your roster.</p>
          </div>
        ) : (
          <div className="flex flex-row gap-5 overflow-x-auto pb-4 items-start scrollbar-thin scrollbar-thumb-slate-800">
            {groups.map((group) => (
              <ParticipantGroupCard
                key={group.id}
                id={group.id}
                title={group.name}
                members={groupedData.get(group.id) || []}
                onDeleteParticipant={deleteParticipant}
                onRename={(newName) => updateGroup(group.id, newName)}
              />
            ))}

            <ParticipantGroupCard
              id="unassigned"
              title="Unassigned"
              members={unassigned}
              isUnassigned
              onDeleteParticipant={deleteParticipant}
            />
          </div>
        )}

        <AddGroupModal
          isOpen={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
          onSubmit={async (name) => {
            await createGroup({ id: crypto.randomUUID(), eventId, name });
          }}
        />

        <AddParticipantModal
          isOpen={isParticipantModalOpen}
          groups={groups}
          onClose={() => setIsParticipantModalOpen(false)}
          onSubmit={async (data) => {
            await createParticipant({ id: crypto.randomUUID(), eventId, ...data });
          }}
        />
      </div>

      <DragOverlay>
        {activeParticipant ? (
          <div className="opacity-90 shadow-2xl scale-[1.02] pointer-events-none w-72">
            <ParticipantRow person={activeParticipant} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
