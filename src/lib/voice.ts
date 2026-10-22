let cachedVoice: SpeechSynthesisVoice | null = null;

function pickMaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const preferred = [
    "google uk english male",
    "microsoft david",
    "microsoft guy",
    "microsoft mark",
    "daniel",
    "alex",
    "fred",
    "george",
    "james",
    "rishi",
  ];
  for (const name of preferred) {
    const v = voices.find(
      (voice) =>
        voice.name.toLowerCase().includes(name) && voice.lang.toLowerCase().startsWith("en")
    );
    if (v) {
      cachedVoice = v;
      return v;
    }
  }
  const male = voices.find(
    (v) => v.lang.toLowerCase().startsWith("en") && /male/i.test(v.name) && !/female/i.test(v.name)
  );
  if (male) {
    cachedVoice = male;
    return male;
  }
  const en = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
  cachedVoice = en ?? voices[0];
  return cachedVoice;
}

export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  let spoken = false; // voiceschanged + fallback timer could both fire — speak only once
  const doSpeak = () => {
    if (spoken) return;
    spoken = true;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const voice = pickMaleVoice();
    if (voice) utter.voice = voice;
    utter.pitch = 0.75; // deeper, JARVIS-like male tone
    utter.rate = 0.95;
    utter.volume = 1;
    synth.speak(utter);
  };
  if (synth.getVoices().length === 0) {
    synth.addEventListener("voiceschanged", doSpeak, { once: true });
    // fallback in case event never fires
    setTimeout(doSpeak, 600);
  } else {
    doSpeak();
  }
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}