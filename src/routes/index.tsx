import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Bird, ChevronDown, ChevronUp, Phone, PhoneOff, X } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WakeUp AI — AI Morning Call" },
      { name: "description", content: "An AI morning call app that wakes you up with a phone call. Set your time and voice tone." },
      { property: "og:title", content: "WakeUp AI — AI Morning Call" },
      { property: "og:description", content: "An AI morning call app that wakes you up with a phone call. Set your time and voice tone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Screen = "main" | "incoming" | "incall";

const BIRDS_URL = "/morning-birds.mp3";

const pad = (n: number) => String(n).padStart(2, "0");

function TimeUnit({ value, onStep }: { value: number; onStep: (d: number) => void }) {
  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => onStep(1)}
        aria-label="Increase"
        className="mb-1 grid size-7 place-items-center rounded-full bg-white/60 text-ink/40 ring-1 ring-white/70 transition-colors hover:bg-white/80"
      >
        <ChevronUp className="size-4" />
      </button>
      <div className="grid size-20 place-items-center rounded-2xl bg-white/70 ring-1 ring-white/70">
        <span className="font-display text-5xl font-semibold leading-none tabular-nums">{pad(value)}</span>
      </div>
      <button
        onClick={() => onStep(-1)}
        aria-label="Decrease"
        className="mt-1 grid size-7 place-items-center rounded-full bg-white/60 text-ink/40 ring-1 ring-white/70 transition-colors hover:bg-white/80"
      >
        <ChevronDown className="size-4" />
      </button>
    </div>
  );
}

function Index() {
  const [screen, setScreen] = useState<Screen>("main");
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(30);
  const [saved, setSaved] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wakeup-alarm");
      if (raw) {
        const a = JSON.parse(raw);
        if (typeof a.hour === "number") setHour(a.hour);
        if (typeof a.minute === "number") setMinute(a.minute);
      }
    } catch {}
  }, []);

  const stopBirds = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopBirds();
    };
  }, []);

  const startCall = () => {
    setScreen("incall");
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    const audio = new Audio(BIRDS_URL);
    audio.loop = true;
    audio.volume = 0.9;
    audioRef.current = audio;
    audio.play().catch(() => {});
  };

  const endCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    stopBirds();
    setScreen("main");
  };

  const saveAlarm = () => {
    localStorage.setItem("wakeup-alarm", JSON.stringify({ hour, minute }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const stepHour = (d: number) => setHour((h) => (h + d + 24) % 24);
  const stepMinute = (d: number) => setMinute((m) => (m + d + 60) % 60);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#cfe0ff] via-[#e8f0ff] to-[#f7f9ff] font-sans text-ink">
      <div className="pointer-events-none absolute -top-24 -left-16 size-72 rounded-full bg-morning/30 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -right-20 size-80 rounded-full bg-brand/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 size-96 -translate-x-1/2 rounded-full bg-brand/15 blur-3xl" />

      {/* MAIN SCREEN */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-8 pt-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl bg-brand text-primary-foreground ring-1 ring-white/40">
              <span className="font-display text-sm font-semibold">W</span>
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">WakeUp AI</span>
          </div>
          <span className="rounded-full bg-white/50 px-3 py-1 text-xs font-medium text-brand-deep ring-1 ring-white/60 backdrop-blur-md">
            Morning Call
          </span>
        </div>

        <div className="mt-10">
          <p className="text-sm font-medium text-ink/50">We'll wake you up this morning</p>
          <h1 className="mt-1 font-display text-3xl font-semibold leading-tight tracking-tight text-balance">
            Wake up to a <span className="text-brand">phone call</span>
          </h1>
        </div>

        {/* time picker */}
        <div className="mt-8 rounded-3xl bg-white/45 p-6 ring-1 ring-white/60 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-ink/40">Alarm Time</span>
            <span className="text-xs font-medium text-brand-deep">Repeats daily</span>
          </div>
          <div className="mt-4 flex items-end justify-center gap-3">
            <TimeUnit value={hour} onStep={stepHour} />
            <span className="pb-5 font-display text-4xl font-semibold text-brand">:</span>
            <TimeUnit value={minute} onStep={stepMinute} />
          </div>
        </div>

        {/* wake-up sound */}
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/45 p-4 ring-1 ring-white/60 backdrop-blur-md">
          <div className="grid size-10 place-items-center rounded-xl bg-brand/15">
            <Bird className="size-5 text-brand" />
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-[0.15em] text-ink/40">Wake-up Sound</span>
            <span className="mt-0.5 block text-sm font-semibold">Morning Birds</span>
          </div>
        </div>

        <button
          onClick={saveAlarm}
          className="mt-6 w-full rounded-2xl bg-ink py-4 text-sm font-semibold text-primary-foreground ring-1 ring-ink/10 transition-opacity hover:opacity-90"
        >
          {saved ? `Saved · ${pad(hour)}:${pad(minute)}` : "Save Alarm"}
        </button>

        <button
          onClick={() => setScreen("incoming")}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-white/50 py-4 text-sm font-semibold text-brand-deep ring-1 ring-white/60 backdrop-blur-md transition-colors hover:bg-white/70"
        >
          <span className="relative grid size-5 place-items-center">
            <span className="absolute inset-0 rounded-full bg-brand/40 animate-ripple" />
            <Phone className="relative size-4 text-brand" />
          </span>
          Test Incoming Call
        </button>
      </div>

      {/* INCOMING CALL / IN-CALL OVERLAY */}
      {screen !== "main" && (
        <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-[#0b1220] via-[#111c33] to-[#0a0f1c] text-primary-foreground animate-slide-up">
          <div className="pointer-events-none absolute -top-20 left-1/2 size-96 -translate-x-1/2 rounded-full bg-brand/30 blur-3xl" />

          <div className="flex items-center justify-between px-7 pt-5 text-xs font-medium text-white/70">
            <span>{pad(hour)}:{pad(minute)}</span>
            <span className="flex items-center gap-1.5">
              <span>5G</span>
              <span>100%</span>
            </span>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center px-8">
            <div className="relative grid place-items-center">
              <span className="absolute size-28 rounded-full bg-brand/40 animate-pulse-ring" />
              <span className="absolute size-28 rounded-full bg-brand/40 animate-pulse-ring-2" />
              <div className="relative grid size-28 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-deep ring-1 ring-white/30">
                <span className="font-display text-4xl font-semibold">AI</span>
              </div>
            </div>
            <p className="mt-8 text-sm font-medium uppercase tracking-[0.2em] text-white/60">AI Morning Call</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">WakeUp AI</h2>
            <p className="mt-1 text-sm text-white/50">
              {screen === "incoming"
                ? "Incoming call..."
                : `On call (${pad(Math.floor(elapsed / 60))}:${pad(elapsed % 60)})`}
            </p>
          </div>

          {screen === "incoming" ? (
            <div className="flex flex-col items-center gap-10 px-8 pb-16">
              <div className="flex items-center gap-20">
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={startCall}
                    aria-label="Answer call"
                    className="grid size-16 place-items-center rounded-full bg-accept text-primary-foreground ring-1 ring-accept/40 transition-transform hover:scale-105"
                  >
                    <Phone className="size-6" />
                  </button>
                  <span className="text-xs font-medium text-white/70">Answer</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={endCall}
                    aria-label="Decline call"
                    className="grid size-16 place-items-center rounded-full bg-decline text-primary-foreground ring-1 ring-decline/40 transition-transform hover:scale-105"
                  >
                    <X className="size-6" />
                  </button>
                  <span className="text-xs font-medium text-white/70">Decline</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 px-8 pb-16">
              <p className="max-w-xs text-center text-sm leading-relaxed text-white/60">
                Good morning! The birds are singing — time to rise and shine.
              </p>
              <button
                onClick={endCall}
                className="flex items-center gap-2 rounded-full bg-decline px-8 py-3.5 text-sm font-semibold text-primary-foreground ring-1 ring-decline/40 transition-transform hover:scale-105"
              >
                <PhoneOff className="size-4" />
                End Call
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
