import { useEffect, useState } from "react";
import ArcReactor from "./ArcReactor";

const BOOT_LINES = [
  "> STARK INDUSTRIES UNIFIED OS v42.0.7",
  "> INITIALIZING ARC REACTOR CORE ............ [OK]",
  "> CALIBRATING REPULSOR MATRIX .............. [OK]",
  "> LOADING J.A.R.V.I.S. NEURAL LATTICE ...... [OK]",
  "> SYNCING MISSION DATABASE ................. [OK]",
  "> VOICE INTERFACE MODULE ................... [ARMED]",
  "> THREAT ASSESSMENT: NONE DETECTED",
  "> TASK COMMAND PROTOCOL .................... [ONLINE]",
];

export default function BootScreen({ onDone }: { onDone: () => void }) {
  const [lineCount, setLineCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    BOOT_LINES.forEach((_, i) => {
      timers.push(setTimeout(() => setLineCount(i + 1), 260 * (i + 1)));
    });
    const total = 260 * BOOT_LINES.length + 500;
    const start = Date.now();
    const iv = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / total) * 100);
      setProgress(p);
      if (p >= 100) clearInterval(iv);
    }, 40);
    timers.push(
      setTimeout(() => setFading(true), total + 200),
      setTimeout(onDone, total + 800)
    );
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(iv);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 px-6 transition-opacity duration-700 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <ArcReactor size={150} />
      <div className="w-full max-w-xl">
        <div className="hud-panel hud-corners p-5 font-tech text-[13px] leading-6 text-cyan-300/90 min-h-[240px]">
          {BOOT_LINES.slice(0, lineCount).map((line, i) => (
            <div key={i} className="boot-line">
              {line}
            </div>
          ))}
          {lineCount < BOOT_LINES.length && <span className="typing-caret" />}
        </div>
        <div className="mt-4 h-1.5 w-full bg-cyan-950/80 border border-cyan-500/20 overflow-hidden">
          <div
            className="h-full bg-cyan-400 transition-[width] duration-100"
            style={{ width: `${progress}%`, boxShadow: "0 0 12px rgba(62,230,255,0.9)" }}
          />
        </div>
        <div className="mt-2 flex justify-between font-tech text-[11px] text-cyan-500/70">
          <span>SYSTEM BOOT SEQUENCE</span>
          <span>{Math.floor(progress)}%</span>
        </div>
      </div>
    </div>
  );
}