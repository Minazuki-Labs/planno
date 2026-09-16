import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ParticipantItem } from "../../types/participant";
import { ROLE_BADGES } from "./participantConstants";

interface ParticipantRowProps {
  person: ParticipantItem;
  onDelete?: (id: string) => void;
}

export const ParticipantRow = ({ person, onDelete }: ParticipantRowProps) => {
  const badge = ROLE_BADGES[person.role] || ROLE_BADGES.member;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: person.id,
    data: { person },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center justify-between p-2 rounded-xl bg-slate-950/40 hover:bg-slate-950/70 border border-slate-800/40 hover:border-slate-700/60 transition-colors"
    >
      <div className="flex items-center gap-2">
        {/* Drag handle */}
        <button
          type="button"
          {...listeners}
          {...attributes}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 p-0.5"
          title="Drag member"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>

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
