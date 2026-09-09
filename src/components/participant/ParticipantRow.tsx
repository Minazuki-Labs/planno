import { ParticipantItem } from "../../types/participant";
import { ROLE_BADGES } from "./participantConstants";

interface ParticipantRowProps {
  person: ParticipantItem;
  onDelete?: (id: string) => void;
}

export const ParticipantRow = ({ person, onDelete }: ParticipantRowProps) => {
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
