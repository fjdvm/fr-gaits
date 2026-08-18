import type { RosterStudent, RosterInstructor } from "./types";

export interface AuthorDisplay {
  name: string;
  email: string | null;
}

export function resolveAuthorDisplay(
  authorId: string,
  currentUserId: string | undefined,
  instructor: RosterInstructor | undefined,
  roster: RosterStudent[] | undefined
): AuthorDisplay {
  if (instructor?.id === authorId) return { name: instructor.name || instructor.email, email: instructor.name ? instructor.email : null };
  const student = roster?.find((s) => s.id === authorId);
  if (student) return { name: student.name || student.email, email: student.name ? student.email : null };
  if (authorId === currentUserId) return { name: "You", email: null };
  return { name: "Unknown", email: null };
}

export function initialsFor(display: AuthorDisplay): string {
  if (display.name === "You" || display.name === "Unknown") return display.name[0];
  return display.name[0]?.toUpperCase() ?? "?";
}

export function relativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}
