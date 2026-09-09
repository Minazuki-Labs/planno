import { useState } from "react";

interface AddGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}

export const AddGroupModal = ({ isOpen, onClose, onSubmit }: AddGroupModalProps) => {
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmit(name.trim());
    setName("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <h2 className="text-sm font-semibold text-slate-100">Add New Group</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xs font-mono">
            ESC
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
              Group Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Alpha Team"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none transition-all"
              autoFocus
            />
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
              Add Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
