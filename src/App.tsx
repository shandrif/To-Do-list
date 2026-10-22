import { useCallback, useState } from "react";
import BootScreen from "@/components/BootScreen";
import LoginPortal, { type Session } from "@/components/LoginPortal";
import GreetingOverlay from "@/components/GreetingOverlay";
import Dashboard from "@/components/Dashboard";

type Stage = "boot" | "portal" | "greeting" | "dashboard";

const SESSION_KEY = "stark-session";

function loadSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<Session> | null;
    if (p && (p.mode === "mine" || p.mode === "assign") && typeof p.name === "string" && p.name.trim()) {
      return { mode: p.mode, name: p.name.trim().slice(0, 40) };
    }
  } catch {
    /* storage blocked or corrupt — start fresh */
  }
  return null;
}

function saveSession(s: Session | null) {
  try {
    if (s) sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* private mode etc. — session just won't survive a refresh */
  }
}

export default function App() {
  // restore session on refresh (skip boot + greeting) — read once, before first paint
  const [session, setSession] = useState<Session | null>(loadSession);
  const [stage, setStage] = useState<Stage>(() => (session ? "dashboard" : "boot"));

  const bootDone = useCallback(() => {
    setStage((s) => (s === "boot" ? "portal" : s));
  }, []);

  const enter = useCallback((s: Session) => {
    setSession(s);
    saveSession(s);
    setStage("greeting");
  }, []);

  const greetingDone = useCallback(() => setStage("dashboard"), []);

  const logout = useCallback(() => {
    saveSession(null);
    setSession(null);
    setStage("portal");
  }, []);

  return (
    <>
      <div className="hud-bg" />
      <div className="hud-grid" />
      <div className="hud-scanline" />
      <div className="hud-sweep" />

      {stage === "boot" && <BootScreen onDone={bootDone} />}
      {stage === "portal" && <LoginPortal onEnter={enter} />}
      {stage === "greeting" && session && (
        <GreetingOverlay name={session.name} mode={session.mode} onDone={greetingDone} />
      )}
      {stage === "dashboard" && session && (
        <Dashboard session={session} onLogout={logout} />
      )}
    </>
  );
}