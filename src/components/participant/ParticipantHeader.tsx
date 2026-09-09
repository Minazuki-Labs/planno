interface ParticipantHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOpenGroupModal: () => void;
  onOpenParticipantModal: () => void;
}

export const ParticipantHeader = ({
  searchQuery,
  onSearchChange,
  onOpenGroupModal,
  onOpenParticipantModal,
}: ParticipantHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
      <div>
        <span className="text-[10px] font-extrabold tracking-widest text-indigo-400 uppercase">
          Roster & Teams
        </span>
        <h2 className="text-xl font-bold text-slate-100 mt-0.5">Participants</h2>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 sm:w-56 h-10.5">
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
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-full pl-8 pr-7 bg-slate-900/90 border border-slate-800 focus:border-indigo-500/80 text-slate-200 placeholder-slate-500 rounded-xl text-xs outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenGroupModal}
          className="h-10.5 px-3 bg-slate-800/70 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-medium transition-all shadow-sm cursor-pointer whitespace-nowrap active:scale-[0.98]"
        >
          + Add Group
        </button>
        <button
          type="button"
          onClick={onOpenParticipantModal}
          className="inline-flex items-center gap-1.5 h-10.5 px-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-all shadow-sm cursor-pointer whitespace-nowrap active:scale-[0.98]"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Participant</span>
        </button>
      </div>
    </div>
  );
};
