import type { ClientTask, Priority, Status } from "./types";

const PRIORITIES: Priority[] = ["low", "medium", "high", "critical"];
const STATUSES: Status[] = ["pending", "active", "completed"];

/** Coerce whatever the server sends into a safe ClientTask so one bad row can't crash the UI. */
function normalize(raw: unknown): ClientTask | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = Number(r.id);
  if (!Number.isInteger(id)) return null;
  const s = (v: unknown, d = "") => (typeof v === "string" ? v : d);
  const date = (v: unknown) =>
    typeof v === "string" && !Number.isNaN(new Date(v).getTime()) ? v : null;
  return {
    id,
    title: s(r.title, "(untitled)") || "(untitled)",
    description: s(r.description),
    assignee: s(r.assignee, "Shuja") || "Shuja",
    assignedBy: s(r.assignedBy, "Commander") || "Commander",
    priority: PRIORITIES.includes(r.priority as Priority) ? (r.priority as Priority) : "medium",
    status: STATUSES.includes(r.status as Status) ? (r.status as Status) : "pending",
    category: s(r.category, "general") || "general",
    dueAt: date(r.dueAt),
    createdAt: date(r.createdAt) ?? new Date(0).toISOString(),
    completedAt: date(r.completedAt),
  };
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON body */
  }
  if (!res.ok) {
    const msg =
      data && typeof data === "object" && "error" in data ? String((data as { error: unknown }).error) : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export const api = {
  async list(assignee?: string): Promise<ClientTask[]> {
    const url = assignee ? `/api/tasks?assignee=${encodeURIComponent(assignee)}` : "/api/tasks";
    const data = await request<{ tasks?: unknown }>(url);
    if (!Array.isArray(data?.tasks)) throw new Error("Malformed response");
    return data.tasks.map(normalize).filter((t): t is ClientTask => t !== null);
  },
  create(body: Record<string, unknown>) {
    return request<{ task: unknown }>("/api/tasks", { method: "POST", body: JSON.stringify(body) });
  },
  update(id: number, body: Record<string, unknown>) {
    return request<{ task: unknown }>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  },
  remove(id: number) {
    return request<{ ok: boolean }>(`/api/tasks/${id}`, { method: "DELETE" });
  },
};
