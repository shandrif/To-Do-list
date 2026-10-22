import { useState } from "react";
import { ListChecks, Radar, ChevronRight, ScanLine, Fingerprint } from "./icons";
import ArcReactor from "./ArcReactor";
import { sfx } from "@/lib/sfx";

export type Session = { mode: "assign" | "mine"; name: string };

export default function LoginPortal({ onEnter }: { onEnter: (s: Session) => void }) {
  const [askName, setAskName] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState(false);

  const enterMine = () => {
    sfx.powerUp();
    onEnter({ mode: "mine", name: "Shuja" });
  };

  const enterAssign = () => {
    sfx.click();
    setAskName(true);
  };

  const submitName = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(true);
      sfx.error();
      return;
    }
    sfx.powerUp();
    onEnter({ mode: "assign", name: trimmed });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="fade-up flex flex-col items-center text-center">
        <ArcReactor size={110} />
        <h1 className="font-display mt-6 text-3xl sm:text-5xl font-extrabold tracking-[0.25em] text-cyan-300 text-glow flicker">
          STARK.OS
        </h1>
        <p className="font-tech mt-3 text-[12px] sm:text-sm tracking-[0.35em] text-cyan-500/80">
          TASK COMMAND PROTOCOL // SELECT ACCESS TERMINAL
        </p>
        <div className="mt-3 h-px w-64 bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />
      </div>

      {!askName ? (
        <div className="mt-12 grid w-full max-w-3xl gap-6 sm:grid-cols-2">
          <button
            onClick={enterAssign}
            onMouseEnter={() => sfx.hover()}
            className="portal-card portal-card-gold hud-panel hud-panel-gold hud-corners fade-up p-8 text-left cursor-pointer"
            style={{ animationDelay: "0.15s" }}
          >
            <div className="flex items-center justify-between">
              <Radar className="h-10 w-10 text-amber-400" />
              <span className="font-tech text-[10px] tracking-[0.3em] text-amber-500/70">
                TERMINAL-01
              </span>
            </div>
            <h2 className="font-display mt-6 text-xl font-bold tracking-[0.15em] text-amber-300 text-glow-gold">
              ASSIGN TASK
            </h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-amber-100/60">
              Commander console. Deploy missions, set priority levels and schedule
              deadlines for your operatives.
            </p>
            <div className="mt-6 flex items-center gap-2 font-tech text-xs tracking-[0.25em] text-amber-400">
              IDENTIFY YOURSELF <ChevronRight className="h-4 w-4" />
            </div>
          </button>

          <button
            onClick={enterMine}
            onMouseEnter={() => sfx.hover()}
            className="portal-card hud-panel hud-corners fade-up p-8 text-left cursor-pointer"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center justify-between">
              <ListChecks className="h-10 w-10 text-cyan-300" />
              <span className="font-tech text-[10px] tracking-[0.3em] text-cyan-500/70">
                TERMINAL-02
              </span>
            </div>
            <h2 className="font-display mt-6 text-xl font-bold tracking-[0.15em] text-cyan-300 text-glow">
              MY TASKS
            </h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-cyan-100/60">
              Operative console. Biometric match confirmed: SHUJA. Review assigned
              missions and execute the protocol.
            </p>
            <div className="mt-6 flex items-center gap-2 font-tech text-xs tracking-[0.25em] text-cyan-300">
              <Fingerprint className="h-4 w-4" /> ENTER AS SHUJA <ChevronRight className="h-4 w-4" />
            </div>
          </button>
        </div>
      ) : (
        <div className="holo-in mt-12 w-full max-w-md">
          <div className="hud-panel hud-panel-gold hud-corners p-8">
            <div className="flex items-center gap-3">
              <ScanLine className="h-6 w-6 text-amber-400" />
              <span className="font-tech text-xs tracking-[0.3em] text-amber-400">
                IDENTITY SCAN REQUIRED
              </span>
            </div>
            <p className="mt-4 text-sm text-amber-100/60 font-medium">
              State your designation, Commander.
            </p>
            <input
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && submitName()}
              placeholder="ENTER YOUR NAME"
              className={`hud-input mt-4 text-lg tracking-[0.15em] uppercase ${
                error ? "!border-red-500" : ""
              }`}
              maxLength={40}
            />
            {error && (
              <p className="mt-2 font-tech text-xs text-red-400 text-glow-red">
                ⚠ DESIGNATION CANNOT BE EMPTY
              </p>
            )}
            <div className="mt-6 flex gap-3">
              <button onClick={submitName} className="hud-btn hud-btn-gold flex-1 px-5 py-3 text-sm">
                INITIATE LINK
              </button>
              <button
                onClick={() => {
                  sfx.click();
                  setAskName(false);
                }}
                className="hud-btn px-5 py-3 text-sm"
              >
                BACK
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="font-tech mt-12 text-[10px] tracking-[0.3em] text-cyan-700">
        STARK INDUSTRIES © SECURE CHANNEL // ENCRYPTION LEVEL 7
      </p>
    </div>
  );
}