/**
 * STARK.OS task tracker — Cloudflare Worker
 *
 *   /api/health          GET            → D1 connectivity check
 *   /api/tasks           GET ?assignee= → list tasks (newest first)
 *                        POST           → create task
 *   /api/tasks/:id       PATCH          → update task
 *                        DELETE         → delete task
 *   everything else                     → static app from /public (SPA)
 */

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
}

const PRIORITIES = ["low", "medium", "high", "critical"] as const;
const STATUSES = ["pending", "active", "completed"] as const;

type Row = {
  id: number;
  title: string;
  description: string;
  assignee: string;
  assigned_by: string;
  priority: string;
  status: string;
  category: string;
  due_at: string | null;
  created_at: string;
  completed_at: string | null;
};

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

function toClient(r: Row) {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    assignee: r.assignee,
    assignedBy: r.assigned_by,
    priority: r.priority,
    status: r.status,
    category: r.category,
    dueAt: r.due_at,
    createdAt: r.created_at,
    completedAt: r.completed_at,
  };
}

async function readBody(req: Request): Promise<Record<string, unknown>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new HttpError(400, "Body must be valid JSON");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "Body must be a JSON object");
  }
  return body as Record<string, unknown>;
}

/** trimmed, length-capped string — or undefined when missing/blank */
function str(v: unknown, max: number): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t ? t.slice(0, max) : undefined;
}

/** ISO date string, null (clear), or undefined (not provided). Rejects junk dates. */
function dateField(v: unknown): string | null | undefined {
  if (v === undefined) return undefined;
  if (v === null || v === "") return null;
  if (typeof v !== "string" && typeof v !== "number") throw new HttpError(400, "dueAt must be a date");
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) throw new HttpError(400, "dueAt is not a valid date");
  const y = d.getUTCFullYear();
  if (y < 2000 || y > 2100) throw new HttpError(400, "dueAt is out of range");
  return d.toISOString();
}

function oneOf<T extends readonly string[]>(v: unknown, list: T): T[number] | undefined {
  return typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T[number]) : undefined;
}

function parseId(raw: string): number {
  if (!/^\d{1,12}$/.test(raw)) throw new HttpError(400, "Invalid id");
  return Number(raw);
}

// ---------- handlers ----------

async function listTasks(env: Env, url: URL) {
  const assignee = url.searchParams.get("assignee")?.trim();
  const stmt = assignee
    ? env.DB.prepare(
        "SELECT * FROM tasks WHERE assignee = ?1 COLLATE NOCASE ORDER BY created_at DESC, id DESC",
      ).bind(assignee)
    : env.DB.prepare("SELECT * FROM tasks ORDER BY created_at DESC, id DESC");
  const { results } = await stmt.all<Row>();
  return json({ tasks: results.map(toClient) });
}

async function createTask(env: Env, req: Request) {
  const b = await readBody(req);
  const title = str(b.title, 200);
  if (!title) throw new HttpError(400, "Title is required");
  const row = await env.DB.prepare(
    `INSERT INTO tasks (title, description, assignee, assigned_by, priority, category, due_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7) RETURNING *`,
  )
    .bind(
      title,
      typeof b.description === "string" ? b.description.trim().slice(0, 2000) : "",
      str(b.assignee, 60) ?? "Shuja",
      str(b.assignedBy, 60) ?? "Commander",
      oneOf(b.priority, PRIORITIES) ?? "medium",
      str(b.category, 40)?.toLowerCase() ?? "general",
      dateField(b.dueAt) ?? null,
    )
    .first<Row>();
  return json({ task: row && toClient(row) }, 201);
}

async function updateTask(env: Env, req: Request, id: number) {
  const b = await readBody(req);
  const sets: string[] = [];
  const vals: unknown[] = [];
  const set = (col: string, v: unknown) => {
    vals.push(v);
    sets.push(`${col} = ?${vals.length}`);
  };

  if (b.title !== undefined) {
    const t = str(b.title, 200);
    if (!t) throw new HttpError(400, "Title cannot be empty");
    set("title", t);
  }
  if (typeof b.description === "string") set("description", b.description.trim().slice(0, 2000));
  if (str(b.assignee, 60)) set("assignee", str(b.assignee, 60));
  if (b.priority !== undefined) {
    const p = oneOf(b.priority, PRIORITIES);
    if (!p) throw new HttpError(400, "Invalid priority");
    set("priority", p);
  }
  if (b.status !== undefined) {
    const s = oneOf(b.status, STATUSES);
    if (!s) throw new HttpError(400, "Invalid status");
    set("status", s);
    // keep the original completion time if it was already complete; clear it when reopened
    sets.push(
      s === "completed"
        ? "completed_at = COALESCE(completed_at, strftime('%Y-%m-%dT%H:%M:%fZ','now'))"
        : "completed_at = NULL",
    );
  }
  if (str(b.category, 40)) set("category", str(b.category, 40)!.toLowerCase());
  const due = dateField(b.dueAt);
  if (due !== undefined) set("due_at", due);

  if (!sets.length) throw new HttpError(400, "Nothing to update");
  vals.push(id);
  const row = await env.DB.prepare(
    `UPDATE tasks SET ${sets.join(", ")} WHERE id = ?${vals.length} RETURNING *`,
  )
    .bind(...vals)
    .first<Row>();
  if (!row) throw new HttpError(404, "Task not found");
  return json({ task: toClient(row) });
}

async function deleteTask(env: Env, id: number) {
  const row = await env.DB.prepare("DELETE FROM tasks WHERE id = ?1 RETURNING id").bind(id).first();
  if (!row) throw new HttpError(404, "Task not found");
  return json({ ok: true });
}

async function api(req: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname.replace(/\/+$/, "");
  const m = req.method;

  if (path === "/api/health") {
    if (m !== "GET") throw new HttpError(405, "Method not allowed");
    await env.DB.prepare("SELECT 1").first();
    return json({ ok: true });
  }
  if (path === "/api/tasks") {
    if (m === "GET") return listTasks(env, url);
    if (m === "POST") return createTask(env, req);
    throw new HttpError(405, "Method not allowed");
  }
  const match = path.match(/^\/api\/tasks\/([^/]+)$/);
  if (match) {
    const id = parseId(match[1]);
    if (m === "PATCH") return updateTask(env, req, id);
    if (m === "DELETE") return deleteTask(env, id);
    throw new HttpError(405, "Method not allowed");
  }
  throw new HttpError(404, "Not found");
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(req);
    try {
      return await api(req, env, url);
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, err.status);
      console.error("API error", err);
      return json({ error: "Server error" }, 500);
    }
  },
} satisfies ExportedHandler<Env>;
