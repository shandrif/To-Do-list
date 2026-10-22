import { useEffect, useState } from "react";
import {
  Play,
  CheckCircle2,
  RotateCcw,
  Pencil,
  Trash2,
  Clock,
  User,
  Tag,
  AlarmClock,
  ShieldAlert,
} from "./icons";
import {
  ClientTask,
  PRIORITY_CONFIG,
  STATUS_CONFIG,
  formatDue,
  isOverdue,
  timeLeft,
} from "@/lib/types";

export default function TaskCard({
  task,
  now,
  mode,
  index,
  onStatus,
  onEdit,
  onDelete,
}: {
  task: ClientTask;
  now: number;
  mode: "assign" | "mine";
  index: number;
  onStatus: (t: ClientTask, status: ClientTask["status"]) => void;
  onEdit: (t: ClientTask) => void;
  onDelete: (t: ClientTask) => void;
}) {
  const p = PRIORITY_CONFIG[task.priority];
  const s = STATUS_CONFIG[task.status];
  const overdue = isOverdue(task, now);
  const done = task.status === "completed";
  // two-step delete: first click arms, second click (within 3s) terminates
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);

  return (
    <div
      className={`task-row card-in hud-panel relative flex overflow-hidden ${
        done ? "opacity-60" : ""
      } ${overdue ? "!border-red-500/50" : ""}`}
      style={{ animationDelay: `${Math.min(index * 0.06, 0.5)}s` }}
    >
      <div className={`w-1.5 shrink-0 ${p.bar} ${task.priority === "critical" && !done ? "critical-flash" : ""}`} />
      <div className="flex-1 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`font-tech text-[10px] tracking-[0.25em] ${p.color}`}>
            ◆ {p.label}
          </span>
          <span className={`border px-2 py-0.5 font-tech text-[10px] tracking-[0.2em] ${s.color}`}>
            {s.label}
          </span>
          {overdue && (
            <span className="critical-flash flex items-center gap-1 border border-red-500/50 bg-red-500/10 px-2 py-0.5 font-tech text-[10px] tracking-[0.2em] text-red-400">
              <ShieldAlert className="h-3 w-3" /> BREACHED
            </span>
          )}
          <span className="ml-auto font-tech text-[10px] text-cyan-700">
            #{String(task.id).padStart(4, "0")}
          </span>
        </div>

        <h3
          className={`font-display mt-2 text-base sm:text-lg font-semibold tracking-wide ${
            done ? "line-through text-cyan-100/50" : "text-cyan-50"
          }`}
        >
          {task.title}
        </h3>
        {task.description && (
          <p className="mt-1 text-sm font-medium leading-relaxed text-cyan-100/55">
            {task.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 font-tech text-[11px] tracking-wider text-cyan-400/80">
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            {mode === "mine" ? `BY ${task.assignedBy.toUpperCase()}` : task.assignee.toUpperCase()}
          </span>
          <span className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            {task.category.toUpperCase()}
          </span>
          {task.dueAt && (
            <span className={`flex items-center gap-1.5 ${overdue ? "text-red-400" : ""}`}>
              <Clock className="h-3.5 w-3.5" />
              {formatDue(task.dueAt)}
            </span>
          )}
          {task.dueAt && !done && (
            <span
              className={`flex items-center gap-1.5 ${
                overdue ? "text-red-400 text-glow-red" : "text-amber-300"
              }`}
            >
              <AlarmClock className="h-3.5 w-3.5" />
              {timeLeft(task.dueAt, now)}
            </span>
          )}
          {done && task.completedAt && (
            <span className="flex items-center gap-1.5 text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              DONE {formatDue(task.completedAt)}
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {mode === "mine" && task.status === "pending" && (
            <button
              onClick={() => onStatus(task, "active")}
              className="hud-btn hud-btn-gold flex items-center gap-1.5 px-3 py-1.5 text-[11px]"
            >
              <Play className="h-3.5 w-3.5" /> ENGAGE
            </button>
          )}
          {mode === "mine" && !done && (
            <button
              onClick={() => onStatus(task, "completed")}
              className="hud-btn flex items-center gap-1.5 px-3 py-1.5 text-[11px]"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> COMPLETE
            </button>
          )}
          {mode === "mine" && done && (
            <button
              onClick={() => onStatus(task, "pending")}
              className="hud-btn flex items-center gap-1.5 px-3 py-1.5 text-[11px]"
            >
              <RotateCcw className="h-3.5 w-3.5" /> REOPEN
            </button>
          )}
          {mode === "assign" && (
            <>
              <button
                onClick={() => onEdit(task)}
                className="hud-btn flex items-center gap-1.5 px-3 py-1.5 text-[11px]"
              >
                <Pencil className="h-3.5 w-3.5" /> EDIT
              </button>
              <button
                onClick={() => {
                  if (armed) {
                    setArmed(false);
                    onDelete(task);
                  } else {
                    setArmed(true);
                  }
                }}
                className={`hud-btn hud-btn-red flex items-center gap-1.5 px-3 py-1.5 text-[11px] ${
                  armed ? "critical-flash" : ""
                }`}
              >
                <Trash2 className="h-3.5 w-3.5" /> {armed ? "CONFIRM TERMINATE?" : "TERMINATE"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}