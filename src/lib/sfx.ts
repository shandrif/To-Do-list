let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, duration: number, delay = 0, type: OscillatorType = "sine", gain = 0.06) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = ac.currentTime + delay;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(g).connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

export const sfx = {
  hover() {
    tone(1400, 0.06, 0, "sine", 0.02);
  },
  click() {
    tone(880, 0.08, 0, "triangle", 0.05);
    tone(1760, 0.1, 0.05, "sine", 0.04);
  },
  confirm() {
    tone(660, 0.12, 0, "sine", 0.06);
    tone(990, 0.14, 0.09, "sine", 0.06);
    tone(1320, 0.2, 0.18, "sine", 0.05);
  },
  complete() {
    tone(523, 0.12, 0, "triangle", 0.06);
    tone(784, 0.12, 0.1, "triangle", 0.06);
    tone(1047, 0.25, 0.2, "triangle", 0.06);
  },
  error() {
    tone(220, 0.2, 0, "sawtooth", 0.04);
    tone(180, 0.25, 0.15, "sawtooth", 0.04);
  },
  powerUp() {
    const ac = audio();
    if (!ac) return;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = "sawtooth";
    const t = ac.currentTime;
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.9);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    osc.connect(g).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 1.2);
  },
};