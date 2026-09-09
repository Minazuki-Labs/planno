import { useMemo } from "react";
import { ParticipantItem } from "../../types/participant";
import { ROLE_ORDER } from "./participantConstants";
import { ParticipantRow } from "./ParticipantRow";

interface ParticipantGroupCardProps {
  title: string;
  members: ParticipantItem[];
  isCollapsed: boolean;
  isUnassigned?: boolean;
  onToggleCollapse: () => void;
  onDeleteParticipant: (id: string) => void;
}

export const ParticipantGroupCard = ({
  title,
  members,
  isCollapsed,
  isUnassigned = false,
  onToggleCollapse,
  onDeleteParticipant,
}: ParticipantGroupCardProps) => {
  const { teachers, nonTeachers } = useMemo(() => {
    return {
      teachers: members.filter((m) => m.role === "teacher"),
      nonTeachers: members
        .filter((m) => m.role !== "teacher")
        .sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]),
    };
  }, [members]);

  const containerStyle = isUnassigned
    ? "w-full bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl overflow-hidden shadow-sm"
    : "w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-md shadow-lg transition-all";

  return (
    <div className={containerStyle}>
      <button
        type="button"
        onClick={onToggleCollapse}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-900/90 hover:bg-slate-900 border-b border-slate-800/70 transition-colors cursor-pointer text-left group/btn"
      >
        <div className="flex items-center gap-2.5">
          <span className={`font-semibold ${isUnassigned ? "text-xs uppercase tracking-wider text-slate-400" : "text-sm text-slate-100"}`}>
            {title}
          </span>
          <span className="text-[11px] bg-slate-800 border border-slate-700/50 text-slate-300 px-2.5 py-0.5 rounded-full font-medium">
            {members.length} {members.length === 1 ? "member" : "members"}
          </span>
        </div>

        <svg
          className={`w-4 h-4 text-slate-400 group-hover/btn:text-slate-200 transition-transform duration-200 ${
            isCollapsed ? "-rotate-90" : "rotate-0"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!isCollapsed && (
        <div className="p-3 flex flex-col gap-2.5">
          {members.length === 0 ? (
            <div className="h-16 flex items-center justify-center border border-dashed border-slate-800/60 rounded-xl bg-slate-950/20">
              <p className="text-xs text-slate-500 italic">No members assigned to this group.</p>
            </div>
          ) : (
            <>
              {teachers.map((person) => (
                <ParticipantRow key={person.id} person={person} onDelete={onDeleteParticipant} />
              ))}
              {teachers.length > 0 && nonTeachers.length > 0 && (
                <div className="border-t border-slate-800/80 my-1" />
              )}
              {nonTeachers.map((person) => (
                <ParticipantRow key={person.id} person={person} onDelete={onDeleteParticipant} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};
