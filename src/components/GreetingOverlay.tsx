import { useEffect, useState } from "react";
import ArcReactor from "./ArcReactor";
import { speak } from "@/lib/voice";

export default function GreetingOverlay({
  name,
  mode,
  onDone,
}: {
  name: string;
  mode: "assign" | "mine";
  onDone: () => void;
}) {
  const [phase, setPhase] = useState(0);
  const greeting = `Welcome ${name}`;

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase(1);
      speak(
        mode === "mine"
          ? `Welcome ${name}. All systems are online. Your missions await.`
          : `Welcome ${name}. Command console initialized. Ready to assign missions.`
      );
    }, 700);
    const t2 = setTimeout(() => setPhase(2), 3400);
    const t3 = setTimeout(onDone, 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [name, mode, onDone]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 transition-opacity duration-700 ${
        phase === 2 ? "opacity-0" : "opacity-100"
      }`}
    >
      <ArcReactor size={170} />
      <div className="holo-in text-center px-6">
        <p className="font-tech text-xs tracking-[0.5em] text-cyan-500/80">
          {mode === "mine" ? "OPERATIVE AUTHENTICATED" : "COMMANDER AUTHENTICATED"}
        </p>
        <h1 className="font-display mt-4 text-4xl sm:text-6xl font-black tracking-[0.12em] text-cyan-200 text-glow uppercase">
          {greeting}
        </h1>
      </div>
      {/* voice waveform */}
      <div className="flex h-12 items-center gap-1.5">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="wave-bar w-1 rounded-full bg-cyan-400"
            style={{
              height: `${18 + ((i * 37) % 30)}px`,
              animationDelay: `${(i % 8) * 0.09}s`,
              boxShadow: "0 0 8px rgba(62,230,255,0.7)",
              opacity: phase >= 1 ? 1 : 0.2,
            }}
          />
        ))}
      </div>
      <p className="font-tech text-[11px] tracking-[0.4em] text-cyan-600">
        J.A.R.V.I.S. VOICE INTERFACE ACTIVE
      </p>
    </div>
  );
}