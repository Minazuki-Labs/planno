import { useState, useMemo, useEffect } from "react";
import { ParticipantItem, ParticipantRole } from "../../types/participant";
import { useEventStore } from "../../store/useEventStore";

interface ParticipantTabProps {
  eventId: string;
}

const ROLE_BADGES: Record<ParticipantRole, { label: string; className: string }> = {
  teacher: {
    label: "Teacher",
    className: "bg-purple-950/40 border-purple-500/30 text-purple-300",
  },
  leader: {
    label: "Leader",
    className: "bg-indigo-950/40 border-indigo-500/30 text-indigo-300",
  },
  co_leader: {
    label: "Co-Leader",
    className: "bg-sky-950/40 border-sky-500/30 text-sky-300",
  },
  member: {
    label: "Member",
    className: "bg-slate-800/60 border-slate-700/60 text-slate-400",
  },
};

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

  // Group Form state
  const [newGroupName, setNewGroupName] = useState("");

  // Participant Form state
  const [newParticipantName, setNewParticipantName] = useState("");
  const [selectedRole, setSelectedRole] = useState<ParticipantRole>("member");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

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

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    await createGroup({
      id: crypto.randomUUID(),
      eventId,
      name: newGroupName.trim(),
    });

    setNewGroupName("");
    setIsGroupModalOpen(false);
  };

  const handleCreateParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipantName.trim()) return;

    await createParticipant({
      id: crypto.randomUUID(),
      eventId,
      name: newParticipantName.trim(),
      role: selectedRole,
      groupId: selectedGroupId || null,
    });

    setNewParticipantName("");
    setSelectedRole("member");
    setSelectedGroupId("");
    setIsParticipantModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Tab Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest text-indigo-400 uppercase">
            Roster & Teams
          </span>
          <h2 className="text-xl font-bold text-slate-100 mt-0.5">Participants</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-56">
            <svg
              className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search participant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-slate-900/90 border border-slate-800 focus:border-indigo-500/80 text-slate-200 placeholder-slate-500 rounded-xl text-xs outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <button
            type="button"
            onClick={() => setIsGroupModalOpen(true)}
            className="px-3 py-1.5 bg-slate-800/70 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-medium transition-all shadow-sm cursor-pointer whitespace-nowrap active:scale-[0.98]"
          >
            + Add Group
          </button>
          <button
            type="button"
            onClick={() => setIsParticipantModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-all shadow-sm cursor-pointer whitespace-nowrap active:scale-[0.98]"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Participant</span>
          </button>
        </div>
      </div>

      {/* Group Sections */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
          {/* Render Groups */}
          {groups.map((group) => {
            const members = groupedData.get(group.id) || [];
            return (
              <div
                key={group.id}
                className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3 backdrop-blur-md shadow-lg"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-200">{group.name}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-medium">
                      {members.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 min-h-[40px]">
                  {members.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">No members assigned.</p>
                  ) : (
                    members.map((person) => (
                      <ParticipantRow
                        key={person.id}
                        person={person}
                        onDelete={deleteParticipant}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}

          {/* Render Unassigned / No Group */}
          {(groupedData.get(null)?.length || 0) > 0 && (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-xs uppercase tracking-wider text-slate-400">Unassigned</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-medium">
                    {groupedData.get(null)?.length || 0}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                {groupedData.get(null)?.map((person) => (
                  <ParticipantRow
                    key={person.id}
                    person={person}
                    onDelete={deleteParticipant}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Group Modal */}
      {isGroupModalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
          onClick={(e) => e.target === e.currentTarget && setIsGroupModalOpen(false)}
        >
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <h2 className="text-sm font-semibold text-slate-100">Add New Group</h2>
              <button 
                onClick={() => setIsGroupModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono"
              >
                ESC
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                  Group Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alpha Team"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none transition-all"
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm"
                >
                  Add Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Participant Modal */}
      {isParticipantModalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
          onClick={(e) => e.target === e.currentTarget && setIsParticipantModalOpen(false)}
        >
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <h2 className="text-sm font-semibold text-slate-100">Add Participant</h2>
              <button 
                onClick={() => setIsParticipantModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono"
              >
                ESC
              </button>
            </div>
            <form onSubmit={handleCreateParticipant} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                  Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={newParticipantName}
                  onChange={(e) => setNewParticipantName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as ParticipantRole)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none transition-all"
                >
                  <option value="member">Member</option>
                  <option value="co_leader">Co-Leader</option>
                  <option value="leader">Leader</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Group Assignment</label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none transition-all"
                >
                  <option value="">No Group (Unassigned)</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsParticipantModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm"
                >
                  Add Participant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface ParticipantRowProps {
  person: ParticipantItem;
  onDelete?: (id: string) => void;
}

const ParticipantRow = ({ person, onDelete }: ParticipantRowProps) => {
  const badge = ROLE_BADGES[person.role] || ROLE_BADGES.member;

  return (
    <div className="group flex items-center justify-between p-2 rounded-xl bg-slate-950/40 hover:bg-slate-950/70 border border-slate-800/40 hover:border-slate-700/60 transition-all">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-200">{person.name}</span>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(person.id)}
          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 transition-opacity text-xs"
          title="Remove participant"
        >
          ✕
        </button>
      )}
    </div>
  );
};
