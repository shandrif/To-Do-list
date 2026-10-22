import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Search,
  LogOut,
  Layers,
  Hourglass,
  Zap,
  CheckCircle2,
  ShieldAlert,
  Inbox,
  Radio,
  WifiOff,
} from "./icons";
import ArcReactor from "./ArcReactor";
import TaskCard from "./TaskCard";
import TaskForm, { type TaskPayload } from "./TaskForm";
import type { Session } from "./LoginPortal";
import { type ClientTask, PRIORITY_CONFIG, type Status, isOverdue } from "@/lib/types";
import { sfx } from "@/lib/sfx";
import { speak, stopSpeaking } from "@/lib/voice";
import { api } from "@/lib/api";

type Filter = "all" | Status | "overdue";
type Sort = "newest" | "due" | "priority";

const TICKER_ITEMS = [
  "ARC REACTOR OUTPUT: 3.2 GJ/S — NOMINAL",
  "SATELLITE UPLINK: STABLE",
  "PERIMETER DEFENSE: ARMED",
  "MISSION DATABASE: SYNCED",
  "J.A.R.V.I.S. COGNITION: 100%",
  "THREAT LEVEL: MINIMAL",
  "POWER RESERVES: 400%",
];

function errText(e: unknown): string {
  return (e instanceof Error ? e.message : "LINK ERROR").toUpperCase().slice(0, 60);
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(62,230,255,0.12)" strokeWidth="6" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke="#3ee6ff" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)", filter: "drop-shadow(0 0 6px rgba(62,230,255,0.8))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-bold text-cyan-200 text-glow">{pct}%</span>
        <span className="font-tech text-[9px] tracking-[0.3em] text-cyan-600">MISSIONS DONE</span>
      </div>
    </div>
  );
}

export default function Dashboard({
  session,
  onLogout,
}: {
  session: Session;
  onLogout: () => void;
}) {
  const [tasks, setTasks] = useState<ClientTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClientTask | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [linkOk, setLinkOk] = useState(true);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // bumps on every local change so an in-flight poll can't overwrite fresher local state
  const mutationSeq = useRef(0);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const fetchTasks = useCallback(async () => {
    const seq = mutationSeq.current;
    try {
      const list = await api.list(session.mode === "mine" ? session.name : undefined);
      if (seq === mutationSeq.current) setTasks(list);
      setLinkOk(true);
    } catch {
      // keep the last good list on screen; retry on next poll
      setLinkOk(false);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    void fetchTasks();
    const iv = setInterval(fetchTasks, 5000);
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(iv);
      clearInterval(clock);
    };
  }, [fetchTasks]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const active = tasks.filter((t) => t.status === "active").length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const overdue = tasks.filter((t) => isOverdue(t, now)).length;
    return {
      total,
      completed,
      active,
      pending,
      overdue,
      pct: total ? Math.round((completed / total) * 100) : 0,
    };
  }, [tasks, now]);

  const visible = useMemo(() => {
    let list = tasks;
    if (filter === "overdue") list = list.filter((t) => isOverdue(t, now));
    else if (filter !== "all") list = list.filter((t) => t.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.assignee.toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    if (sort === "due") {
      sorted.sort((a, b) => {
        if (!a.dueAt && !b.dueAt) return 0;
        if (!a.dueAt) return 1;
        if (!b.dueAt) return -1;
        return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
      });
    } else if (sort === "priority") {
      sorted.sort(
        (a, b) => PRIORITY_CONFIG[b.priority].rank - PRIORITY_CONFIG[a.priority].rank
      );
    }
    return sorted;
  }, [tasks, filter, search, sort, now]);

  const createTask = async (payload: TaskPayload) => {
    try {
      await api.create({ ...payload, assignedBy: session.name });
      mutationSeq.current++;
      sfx.confirm();
      speak(`Mission deployed to ${payload.assignee}.`);
      showToast(`MISSION DEPLOYED → ${payload.assignee.toUpperCase()}`);
      setFormOpen(false);
      void fetchTasks();
    } catch (e) {
      sfx.error();
      showToast(`TRANSMISSION FAILED — ${errText(e)}`);
    }
  };

  const updateTask = async (payload: TaskPayload) => {
    if (!editing) return;
    try {
      await api.update(editing.id, payload);
      mutationSeq.current++;
      sfx.confirm();
      showToast("MISSION PARAMETERS UPDATED");
      setEditing(null);
      setFormOpen(false);
      void fetchTasks();
    } catch (e) {
      sfx.error();
      showToast(`UPDATE FAILED — ${errText(e)}`);
    }
  };

  const changeStatus = async (task: ClientTask, status: Status) => {
    const before = tasks;
    mutationSeq.current++;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              status,
              completedAt:
                status === "completed" ? t.completedAt ?? new Date().toISOString() : null,
            }
          : t
      )
    );
    if (status === "completed") {
      sfx.complete();
      speak(`Mission complete. Excellent work, ${session.name}.`);
      showToast("MISSION ACCOMPLISHED ✔");
    } else if (status === "active") {
      sfx.click();
      showToast("MISSION ENGAGED — GODSPEED");
    } else {
      sfx.click();
      showToast("MISSION RETURNED TO STANDBY");
    }
    try {
      await api.update(task.id, { status });
      mutationSeq.current++;
    } catch (e) {
      mutationSeq.current++;
      setTasks(before); // roll back the optimistic change
      sfx.error();
      showToast(`STATUS SYNC FAILED — ${errText(e)}`);
    }
    void fetchTasks();
  };

  const deleteTask = async (task: ClientTask) => {
    const before = tasks;
    mutationSeq.current++;
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    try {
      await api.remove(task.id);
      mutationSeq.current++;
      sfx.error();
      showToast(`MISSION #${String(task.id).padStart(4, "0")} TERMINATED`);
    } catch (e) {
      mutationSeq.current++;
      setTasks(before);
      sfx.error();
      showToast(`TERMINATION FAILED — ${errText(e)}`);
    }
    void fetchTasks();
  };

  const logout = () => {
    sfx.click();
    stopSpeaking();
    onLogout();
  };

  const clockDate = new Date(now);
  const filters: { key: Filter; label: string; icon: typeof Layers; count: number }[] = [
    { key: "all", label: "ALL MISSIONS", icon: Layers, count: stats.total },
    { key: "pending", label: "STANDBY", icon: Hourglass, count: stats.pending },
    { key: "active", label: "IN PROGRESS", icon: Zap, count: stats.active },
    { key: "completed", label: "COMPLETE", icon: CheckCircle2, count: stats.completed },
    { key: "overdue", label: "BREACHED", icon: ShieldAlert, count: stats.overdue },
  ];

  return (
    <div className="min-h-screen pb-16">
      {/* HEADER */}
      <header className="hud-panel sticky top-0 z-30 border-x-0 border-t-0 px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-2">
          <div className="flex items-center gap-3">
            <ArcReactor size={44} />
            <div>
              <h1 className="font-display text-sm sm:text-base font-bold tracking-[0.25em] text-cyan-300 text-glow">
                STARK.OS
              </h1>
              <p className="font-tech text-[9px] tracking-[0.3em] text-cyan-600">
                TASK COMMAND PROTOCOL
              </p>
            </div>
          </div>
          <span
            className={`border px-2.5 py-1 font-tech text-[10px] tracking-[0.25em] ${
              session.mode === "mine"
                ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                : "border-amber-400/40 bg-amber-400/10 text-amber-300"
            }`}
          >
            {session.mode === "mine" ? "OPERATIVE CONSOLE" : "COMMAND CONSOLE"}
          </span>
          <div className="ml-auto flex items-center gap-4 sm:gap-6">
            <div className="text-right">
              <div className="font-tech text-base sm:text-lg leading-5 text-cyan-200 text-glow tabular-nums">
                {clockDate.toLocaleTimeString(undefined, { hour12: false })}
              </div>
              <div className="font-tech text-[9px] tracking-[0.2em] text-cyan-600">
                {clockDate.toLocaleDateString(undefined, {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }).toUpperCase()}
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <div className="font-display text-sm font-semibold tracking-[0.15em] text-amber-300 text-glow-gold uppercase">
                {session.name}
              </div>
              {linkOk ? (
                <div className="font-tech flex items-center justify-end gap-1.5 text-[9px] tracking-[0.2em] text-emerald-400">
                  <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  LINK ACTIVE
                </div>
              ) : (
                <div className="font-tech critical-flash flex items-center justify-end gap-1.5 text-[9px] tracking-[0.2em] text-red-400">
                  <WifiOff className="h-3 w-3" />
                  LINK LOST
                </div>
              )}
            </div>
            <button onClick={logout} className="hud-btn hud-btn-red flex items-center gap-1.5 px-3 py-2 text-[10px]">
              <LogOut className="h-3.5 w-3.5" /> DISCONNECT
            </button>
          </div>
        </div>
      </header>

      {/* TICKER */}
      <div className="overflow-hidden border-b border-cyan-500/10 bg-cyan-950/20 py-1.5">
        <div className="ticker flex gap-12 font-tech text-[10px] tracking-[0.25em] text-cyan-600">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              <Radio className="h-3 w-3 text-cyan-500" /> {item}
            </span>
          ))}
        </div>
      </div>

      <main className="mx-auto mt-6 grid max-w-7xl gap-6 px-4 sm:px-8 lg:grid-cols-[300px_1fr]">
        {/* SIDEBAR */}
        <aside className="space-y-5">
          <div className="hud-panel hud-corners fade-up flex flex-col items-center p-6">
            <ProgressRing pct={stats.pct} />
            <p className="mt-3 font-tech text-[10px] tracking-[0.3em] text-cyan-500">
              {session.mode === "mine"
                ? `${session.name.toUpperCase()}'S COMBAT READINESS`
                : "FLEET READINESS"}
            </p>
            <div className="mt-4 grid w-full grid-cols-2 gap-2">
              {[
                { label: "TOTAL", value: stats.total, cls: "text-cyan-300" },
                { label: "ACTIVE", value: stats.active, cls: "text-amber-300" },
                { label: "DONE", value: stats.completed, cls: "text-emerald-300" },
                { label: "BREACHED", value: stats.overdue, cls: "text-red-400" },
              ].map((s) => (
                <div key={s.label} className="border border-cyan-500/15 bg-cyan-950/30 p-2.5 text-center">
                  <div className={`font-display text-xl font-bold ${s.cls}`}>{s.value}</div>
                  <div className="font-tech text-[9px] tracking-[0.25em] text-cyan-700">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hud-panel hud-corners fade-up p-4" style={{ animationDelay: "0.1s" }}>
            <p className="font-tech mb-3 text-[10px] tracking-[0.3em] text-cyan-600">
              TACTICAL FILTERS
            </p>
            <div className="space-y-1.5">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => {
                    setFilter(f.key);
                    sfx.click();
                  }}
                  className={`flex w-full items-center gap-2.5 border px-3 py-2 font-tech text-[11px] tracking-[0.2em] transition-all cursor-pointer ${
                    filter === f.key
                      ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-200 shadow-[0_0_14px_rgba(62,230,255,0.15)]"
                      : "border-transparent text-cyan-600 hover:border-cyan-800 hover:text-cyan-400"
                  }`}
                >
                  <f.icon className="h-4 w-4" />
                  {f.label}
                  <span className="ml-auto tabular-nums">{f.count}</span>
                </button>
              ))}
            </div>
            <p className="font-tech mb-2 mt-5 text-[10px] tracking-[0.3em] text-cyan-600">
              SORT PROTOCOL
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="hud-input text-sm"
            >
              <option value="newest">NEWEST FIRST</option>
              <option value="due">DEADLINE ASCENDING</option>
              <option value="priority">PRIORITY DESCENDING</option>
            </select>
          </div>
        </aside>

        {/* MAIN */}
        <section>
          <div className="fade-up flex flex-wrap items-center gap-3">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-600" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="SCAN MISSION DATABASE..."
                className="hud-input pl-10 font-tech text-sm tracking-wider"
              />
            </div>
            {session.mode === "assign" && (
              <button
                onClick={() => {
                  sfx.click();
                  setEditing(null);
                  setFormOpen(true);
                }}
                className="hud-btn hud-btn-gold flex items-center gap-2 px-5 py-2.5 text-xs"
              >
                <Plus className="h-4 w-4" /> NEW MISSION
              </button>
            )}
          </div>

          <div className="mt-5 space-y-3">
            {loading ? (
              <div className="hud-panel hud-corners p-10 text-center">
                <p className="typing-caret font-tech text-sm tracking-[0.3em] text-cyan-400">
                  SCANNING MISSION DATABASE
                </p>
              </div>
            ) : visible.length === 0 ? (
              <div className="hud-panel hud-corners fade-up flex flex-col items-center p-12 text-center">
                <Inbox className="h-12 w-12 text-cyan-800" />
                <p className="font-display mt-4 text-sm tracking-[0.25em] text-cyan-500">
                  NO MISSIONS ON RADAR
                </p>
                <p className="mt-2 max-w-sm text-sm font-medium text-cyan-700">
                  {session.mode === "assign"
                    ? "Deploy a new mission to get your operatives moving."
                    : "All clear. Await new mission assignments from command."}
                </p>
              </div>
            ) : (
              visible.map((task, i) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  now={now}
                  mode={session.mode}
                  index={i}
                  onStatus={changeStatus}
                  onEdit={(t) => {
                    sfx.click();
                    setEditing(t);
                    setFormOpen(true);
                  }}
                  onDelete={deleteTask}
                />
              ))
            )}
          </div>
        </section>
      </main>

      {/* FORM MODAL */}
      {formOpen && (
        <TaskForm
          initial={editing}
          commanderName={session.name}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSubmit={editing ? updateTask : createTask}
        />
      )}

      {/* TOAST */}
      {toast && (
        <div
          role="status"
          className="card-in hud-panel hud-corners fixed bottom-6 right-4 left-4 z-50 px-5 py-3 sm:left-auto sm:right-6"
        >
          <p className="font-tech text-xs tracking-[0.25em] text-cyan-200 text-glow">{toast}</p>
        </div>
      )}
    </div>
  );
}