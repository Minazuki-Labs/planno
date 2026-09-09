import { useState, useMemo, useEffect } from "react";
import { ParticipantItem } from "../../types/participant";
import { useEventStore } from "../../store/useEventStore";
import { ParticipantHeader } from "./ParticipantHeader";
import { ParticipantGroupCard } from "./ParticipantGroupCard";
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
    createParticipant,
    deleteParticipant,
  } = useEventStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      next.has(groupId) ? next.delete(groupId) : next.add(groupId);
      return next;
    });
  };

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

  const unassigned = groupedData.get(null) || [];

  return (
    <div className="space-y-6">
      <ParticipantHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenGroupModal={() => setIsGroupModalOpen(true)}
        onOpenParticipantModal={() => setIsParticipantModalOpen(true)}
      />

      {groups.length === 0 && participants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-slate-800/70 rounded-2xl bg-slate-900/30">
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mb-3 text-slate-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-200">No participants or groups yet</h3>
          <p className="text-xs text-slate-400 mt-1">Create groups and add members to organise your roster.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <ParticipantGroupCard
              key={group.id}
              title={group.name}
              members={groupedData.get(group.id) || []}
              isCollapsed={collapsedGroups.has(group.id)}
              onToggleCollapse={() => toggleCollapse(group.id)}
              onDeleteParticipant={deleteParticipant}
            />
          ))}

          {unassigned.length > 0 && (
            <ParticipantGroupCard
              title="Unassigned"
              members={unassigned}
              isCollapsed={collapsedGroups.has("unassigned")}
              isUnassigned
              onToggleCollapse={() => toggleCollapse("unassigned")}
              onDeleteParticipant={deleteParticipant}
            />
          )}
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
  );
};
