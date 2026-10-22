export type Priority = "low" | "medium" | "high" | "critical";
export type Status = "pending" | "active" | "completed";

export type ClientTask = {
  id: number;
  title: string;
  description: string;
  assignee: string;
  assignedBy: string;
  priority: Priority;
  status: Status;
  category: string;
  dueAt: string | null;
  createdAt: string;
  completedAt: string | null;
};

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; bar: string; rank: number }
> = {
  low: { label: "LOW", color: "text-emerald-300", bar: "bg-emerald-400", rank: 0 },
  medium: { label: "MEDIUM", color: "text-cyan-300", bar: "bg-cyan-400", rank: 1 },
  high: { label: "HIGH", color: "text-amber-300", bar: "bg-amber-400", rank: 2 },
  critical: { label: "CRITICAL", color: "text-red-400", bar: "bg-red-500", rank: 3 },
};

export const STATUS_CONFIG: Record<Status, { label: string; color: string }> = {
  pending: { label: "STANDBY", color: "text-cyan-300 border-cyan-400/40 bg-cyan-400/10" },
  active: { label: "IN PROGRESS", color: "text-amber-300 border-amber-400/40 bg-amber-400/10" },
  completed: { label: "COMPLETE", color: "text-emerald-300 border-emerald-400/40 bg-emerald-400/10" },
};

export function isOverdue(t: ClientTask, now: number): boolean {
  return t.status !== "completed" && !!t.dueAt && new Date(t.dueAt).getTime() < now;
}

export function timeLeft(dueAt: string, now: number): string {
  const diff = new Date(dueAt).getTime() - now;
  const abs = Math.abs(diff);
  const mins = Math.floor(abs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  let label: string;
  if (days > 0) label = `${days}d ${hours % 24}h`;
  else if (hours > 0) label = `${hours}h ${mins % 60}m`;
  else label = `${Math.max(mins, 1)}m`;
  return diff < 0 ? `OVERDUE ${label}` : `T-MINUS ${label}`;
}

export function formatDue(dueAt: string): string {
  return new Date(dueAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}