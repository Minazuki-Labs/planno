import { useMemo, useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ParticipantItem } from "../../types/participant";
import { ROLE_ORDER } from "./participantConstants";
import { ParticipantRow } from "./ParticipantRow";

interface ParticipantGroupCardProps {
  id: string;
  title: string;
  members: ParticipantItem[];
  isUnassigned?: boolean;
  onDeleteParticipant: (id: string) => void;
  onRename?: (newName: string) => void;
}

export const ParticipantGroupCard = ({
  id,
  title,
  members,
  isUnassigned = false,
  onDeleteParticipant,
  onRename,
}: ParticipantGroupCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } = useSortable({
    id,
    disabled: isUnassigned,
    data: { type: "group", groupId: isUnassigned ? null : id },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempTitle(title);
  }, [title]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleCommitRename = () => {
    const trimmed = tempTitle.trim();
    if (trimmed && trimmed !== title && onRename) {
      onRename(trimmed);
    } else {
      setTempTitle(title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCommitRename();
    } else if (e.key === "Escape") {
      setTempTitle(title);
      setIsEditing(false);
    }
  };

  const { teachers, nonTeachers } = useMemo(() => {
    return {
      teachers: members.filter((m) => m.role === "teacher"),
      nonTeachers: members
        .filter((m) => m.role !== "teacher")
        .sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]),
    };
  }, [members]);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const containerStyle = isUnassigned
    ? `w-80 shrink-0 flex flex-col max-h-[calc(100vh-220px)] bg-slate-900/40 border border-dashed rounded-2xl overflow-hidden shadow-sm transition-colors ${
        isOver ? "border-indigo-500/80 bg-indigo-950/20" : "border-slate-800"
      }`
    : `w-80 shrink-0 flex flex-col max-h-[calc(100vh-220px)] bg-slate-900/60 border rounded-2xl overflow-hidden backdrop-blur-md shadow-lg transition-all ${
        isOver ? "border-indigo-500/80 ring-2 ring-indigo-500/20" : "border-slate-800/80"
      }`;

  return (
    <div ref={setNodeRef} style={style} className={containerStyle}>
      {/* Group Header */}
      <div className="flex items-center justify-between px-3 py-3 bg-slate-900/90 border-b border-slate-800/70 select-none">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {!isUnassigned && (
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 p-0.5 rounded touch-none"
              title="Drag to reorder group"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="9" cy="5" r="2" />
                <circle cx="9" cy="12" r="2" />
                <circle cx="9" cy="19" r="2" />
                <circle cx="15" cy="5" r="2" />
                <circle cx="15" cy="12" r="2" />
                <circle cx="15" cy="19" r="2" />
              </svg>
            </button>
          )}

          {isEditing && !isUnassigned ? (
            <input
              ref={inputRef}
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleCommitRename}
              onKeyDown={handleKeyDown}
              className="bg-slate-800 border border-indigo-500 text-slate-100 text-sm font-semibold rounded px-1.5 py-0.5 outline-none w-36"
            />
          ) : (
            <span
              onDoubleClick={() => {
                if (!isUnassigned) setIsEditing(true);
              }}
              title={!isUnassigned ? "Double click to rename" : undefined}
              className={`font-semibold truncate ${
                isUnassigned
                  ? "text-xs uppercase tracking-wider text-slate-400"
                  : "text-sm text-slate-100 hover:text-indigo-300 cursor-pointer"
              }`}
            >
              {title}
            </span>
          )}

          <span className="text-[11px] bg-slate-800 border border-slate-700/50 text-slate-300 px-2 py-0.5 rounded-full font-medium shrink-0">
            {members.length}
          </span>
        </div>
      </div>

      {/* Member Cards Area */}
      <div className="p-3 flex-1 flex flex-col gap-2.5 overflow-y-auto min-h-[100px]">
        {members.length === 0 ? (
          <div className="h-24 flex items-center justify-center border border-dashed border-slate-800/60 rounded-xl bg-slate-950/20 text-center p-2">
            <p className="text-xs text-slate-500 italic">
              {isUnassigned ? "Drop here to unassign" : "Drop members here"}
            </p>
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
    </div>
  );
};
