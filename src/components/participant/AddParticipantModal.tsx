import { useState, useEffect, useRef } from "react";
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
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setRole("member");
      setGroupId("");
      setError("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a valid participant name.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({ name: name.trim(), role, groupId: groupId || null });
      setName("");
      setRole("member");
      setGroupId("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-5"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <h2 className="text-sm font-semibold text-slate-100">Add Participant</h2>
          <kbd
            onClick={onClose}
            className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 hover:text-slate-200 rounded border border-slate-700 font-mono cursor-pointer transition-colors"
          >
            ESC
          </kbd>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="participant-name" className="block text-[11px] font-medium text-slate-400 mb-1.5">
              Name <span className="text-rose-400">*</span>
            </label>
            <input
              id="participant-name"
              ref={inputRef}
              type="text"
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              className={`w-full min-h-[38px] bg-slate-950 border ${
                error
                  ? "border-rose-500 focus:ring-rose-500"
                  : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-500"
              } focus:ring-1 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 outline-none transition-all`}
            />
            {error && <p className="text-[11px] text-rose-400 mt-1">{error}</p>}
          </div>

          <div>
  <label htmlFor="participant-role" className="block text-[11px] font-medium text-slate-400 mb-1.5">
    Role
  </label>
  <select
    id="participant-role"
    value={role}
    onChange={(e) => setRole(e.target.value as ParticipantRole)}
    className="w-full h-10 px-3 pr-8 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-xs text-slate-100 outline-none transition-all cursor-pointer"
  >
    <option value="member">Member</option>
    <option value="co_leader">Co-Leader</option>
    <option value="leader">Leader</option>
    <option value="teacher">Teacher</option>
  </select>
          </div>

          <div>
            <label htmlFor="group-assignment" className="block text-[11px] font-medium text-slate-400 mb-1.5">
              Group Assignment <span className="text-slate-600">(Optional)</span>
            </label>
            <select
              id="group-assignment"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full h-10 px-3 pr-8 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-xs text-slate-100 outline-none transition-all cursor-pointer"
            >
              <option value="">No Group (Unassigned)</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors min-h-[36px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-all shadow-sm min-h-[36px]"
            >
              Add Participant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
