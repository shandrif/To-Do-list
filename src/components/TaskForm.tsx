import { useEffect, useState } from "react";
import { X, Rocket, CalendarClock } from "./icons";
import { type ClientTask, type Priority, PRIORITY_CONFIG } from "@/lib/types";
import { sfx } from "@/lib/sfx";

const CATEGORIES = ["general", "development", "design", "research", "operations", "security", "personal"];

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export type TaskPayload = {
  title: string;
  description: string;
  assignee: string;
  priority: Priority;
  category: string;
  dueAt: string | null;
};

export default function TaskForm({
  initial,
  commanderName,
  onClose,
  onSubmit,
}: {
  initial: ClientTask | null;
  commanderName: string;
  onClose: () => void;
  onSubmit: (payload: TaskPayload) => Promise<void>;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [assignee, setAssignee] = useState(initial?.assignee ?? "Shuja");
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "medium");
  const [category, setCategory] = useState(initial?.category ?? "general");
  const [dueAt, setDueAt] = useState(
    initial?.dueAt ? toLocalInput(new Date(initial.dueAt)) : ""
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const quickSchedule = (kind: "hour" | "tonight" | "tomorrow" | "week") => {
    sfx.click();
    const d = new Date();
    if (kind === "hour") d.setTime(d.getTime() + 60 * 60 * 1000); // exactly one hour from now
    if (kind === "tonight") {
      d.setHours(20, 0, 0, 0);
      if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1); // already past 20:00 → tomorrow 20:00
    }
    if (kind === "tomorrow") {
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
    }
    if (kind === "week") {
      d.setDate(d.getDate() + 7);
      d.setHours(9, 0, 0, 0);
    }
    setDueAt(toLocalInput(d));
  };

  // Esc closes the modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async () => {
    if (saving) return;
    if (!title.trim()) {
      setError("MISSION DESIGNATION REQUIRED");
      sfx.error();
      return;
    }
    const due = dueAt ? new Date(dueAt) : null;
    if (due && Number.isNaN(due.getTime())) {
      setError("INVALID DEADLINE");
      sfx.error();
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        assignee: assignee.trim() || "Shuja",
        priority,
        category,
        dueAt: due ? due.toISOString() : null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="holo-in hud-panel hud-panel-gold hud-corners w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Rocket className="h-6 w-6 text-amber-400" />
            <h2 className="font-display text-lg font-bold tracking-[0.2em] text-amber-300 text-glow-gold">
              {initial ? "MODIFY MISSION" : "DEPLOY MISSION"}
            </h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-cyan-400 hover:text-cyan-200 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="font-tech text-[11px] tracking-[0.3em] text-cyan-500">
              MISSION DESIGNATION *
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && void submit()}
              placeholder="e.g. Patch the mainframe firewall"
              className="hud-input mt-1.5"
              maxLength={200}
            />
            {error && <p className="mt-1.5 font-tech text-xs text-red-400 text-glow-red">⚠ {error}</p>}
          </div>

          <div>
            <label className="font-tech text-[11px] tracking-[0.3em] text-cyan-500">
              BRIEFING NOTES
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional mission details..."
              rows={3}
              className="hud-input mt-1.5 resize-none"
              maxLength={2000}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-tech text-[11px] tracking-[0.3em] text-cyan-500">
                OPERATIVE
              </label>
              <input
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="hud-input mt-1.5"
                maxLength={60}
              />
            </div>
            <div>
              <label className="font-tech text-[11px] tracking-[0.3em] text-cyan-500">
                SECTOR
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="hud-input mt-1.5"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-tech text-[11px] tracking-[0.3em] text-cyan-500">
              THREAT / PRIORITY LEVEL
            </label>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPriority(p);
                    sfx.click();
                  }}
                  className={`border px-2 py-2 font-tech text-[11px] tracking-[0.15em] transition-all cursor-pointer ${
                    priority === p
                      ? `${PRIORITY_CONFIG[p].color} border-current bg-white/5 shadow-[0_0_14px_rgba(62,230,255,0.2)]`
                      : "border-cyan-900 text-cyan-700 hover:text-cyan-400"
                  }`}
                >
                  {PRIORITY_CONFIG[p].label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-tech flex items-center gap-2 text-[11px] tracking-[0.3em] text-cyan-500">
              <CalendarClock className="h-3.5 w-3.5" /> DEADLINE / SCHEDULE
            </label>
            <input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="hud-input mt-1.5"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  ["hour", "+1 HOUR"],
                  ["tonight", "TONIGHT 20:00"],
                  ["tomorrow", "TOMORROW 09:00"],
                  ["week", "+1 WEEK"],
                ] as const
              ).map(([kind, label]) => (
                <button
                  key={kind}
                  onClick={() => quickSchedule(kind)}
                  className="border border-cyan-800 px-2.5 py-1 font-tech text-[10px] tracking-[0.15em] text-cyan-500 transition-all hover:border-cyan-400 hover:text-cyan-300 cursor-pointer"
                >
                  {label}
                </button>
              ))}
              {dueAt && (
                <button
                  onClick={() => setDueAt("")}
                  className="border border-red-900 px-2.5 py-1 font-tech text-[10px] tracking-[0.15em] text-red-500 hover:border-red-400 cursor-pointer"
                >
                  CLEAR
                </button>
              )}
            </div>
          </div>

          <button
            onClick={submit}
            disabled={saving}
            className="hud-btn hud-btn-gold w-full px-5 py-3.5 text-sm"
          >
            {saving ? "TRANSMITTING..." : initial ? "UPDATE MISSION" : `DEPLOY TO ${assignee.toUpperCase() || "OPERATIVE"}`}
          </button>
          <p className="text-center font-tech text-[10px] tracking-[0.25em] text-cyan-800">
            SIGNED // COMMANDER {commanderName.toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
}