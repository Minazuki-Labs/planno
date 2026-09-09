import { useState } from "react";
import { ParticipantRole } from "../../types/participant";

interface AddParticipantModalProps {
  isOpen: boolean;
  groups: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSubmit: (data: { name: string; role: ParticipantRole; groupId: string | null }) => Promise<void>;
}

export const AddParticipantModal = ({
  isOpen,
  groups,
  onClose,
  onSubmit,
}: AddParticipantModalProps) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState<ParticipantRole>("member");
  const [groupId, setGroupId] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmit({ name: name.trim(), role, groupId: groupId || null });
    setName("");
    setRole("member");
    setGroupId("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <h2 className="text-sm font-semibold text-slate-100">Add Participant</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xs font-mono">
            ESC
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
              Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as ParticipantRole)}
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
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
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
              onClick={onClose}
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
  );
};
