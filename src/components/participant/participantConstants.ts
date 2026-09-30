import { ParticipantRole } from "../../types/participant";

export const ROLE_BADGES: Record<ParticipantRole, { label: string; className: string }> = {
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

export const ROLE_ORDER: Record<ParticipantRole, number> = {
  teacher: 0,
  leader: 1,
  co_leader: 2,
  member: 3,
};
