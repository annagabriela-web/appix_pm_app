// Shared team configuration for utilization charts
export type TeamKey = "diseno" | "sistemas" | "admin" | "hibrido";

export interface TeamDef {
  label: string;
  color: string;
  members: string[]; // lowercase names for matching
}

export const TEAMS: Record<TeamKey, TeamDef> = {
  diseno: {
    label: "Diseño",
    color: "#ec4899",
    members: ["camila veliz", "christian luna"],
  },
  sistemas: {
    label: "Sistemas",
    color: "#67adee",
    members: ["natalia río", "armando ruiz", "alejandro alvarez"],
  },
  admin: {
    label: "Administrativos",
    color: "#f59e0b",
    members: ["sofia.saul", "jose francisco monroy"],
  },
  hibrido: {
    label: "Híbrido",
    color: "#6278fb",
    members: ["rafael castillo lópez", "roberto.aguilar", "ana gabriela cedeño"],
  },
};

export const TEAM_KEYS: TeamKey[] = ["diseno", "sistemas", "admin", "hibrido"];

// Part-time people work 4h/day instead of 8h/day
export const PART_TIME_PERSONS = new Set(["ana gabriela cedeño", "roberto.aguilar"]);
export const HOURS_PER_DAY_FULL = 8;
export const HOURS_PER_DAY_PART = 4;

/** Find which team a person belongs to */
export function getTeamForPerson(name: string): TeamKey | null {
  const lower = name.toLowerCase();
  for (const [key, def] of Object.entries(TEAMS)) {
    if (def.members.includes(lower)) return key as TeamKey;
  }
  return null;
}

/** Compliance color based on % */
export function getComplianceColor(pct: number): string {
  if (pct > 100) return "#8b5cf6"; // purple — over capacity
  if (pct >= 90) return "#10b981";  // green — on target
  if (pct >= 81) return "#f59e0b";  // amber — warning
  return "#ef4444";                  // red — critical
}

export function getComplianceTextColor(pct: number): string {
  if (pct >= 81 && pct <= 100) return "#ffffff";
  return "#ffffff";
}
