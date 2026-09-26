import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  Mic2,
  Phone,
  PhoneOff,
  RefreshCw,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
type VoiceId = "warm" | "energetic" | "calm";
type AudioStatus = "idle" | "generating" | "playing" | "error";

const VOICES: Array<{
  id: VoiceId;
  name: string;
  description: string;
  icon: typeof Sparkles;
}> = [
  { id: "warm", name: "Warm Friend", description: "Gentle and encouraging", icon: Sparkles },
  { id: "energetic", name: "Energetic Coach", description: "Bright and motivating", icon: Sun },
  { id: "calm", name: "Calm Presenter", description: "Clear and reassuring", icon: Mic2 },
];

const pad = (n: number) => String(n).padStart(2, "0");

function TimeUnit({ value, onStep }: { value: number; onStep: (d: number) => void }) {
  return (
    <div className="flex flex-col items-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onStep(1)}
        aria-label="Increase"
        className="mb-1 size-7 rounded-full bg-card/60 text-ink/40 ring-1 ring-card/70 hover:bg-card/80"
      >
        <ChevronUp className="size-4" />
      </Button>
      <div className="grid size-20 place-items-center rounded-2xl bg-card/70 ring-1 ring-card/70">
        <span className="font-display text-5xl font-semibold leading-none tabular-nums">{pad(value)}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onStep(-1)}
        aria-label="Decrease"
        className="mt-1 size-7 rounded-full bg-card/60 text-ink/40 ring-1 ring-card/70 hover:bg-card/80"
      >
        <ChevronDown className="size-4" />
      </Button>
    </div>
  );
}

function Index() {
  const [screen, setScreen] = useState<Screen>("main");
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(30);
  const [voice, setVoice] = useState<VoiceId>("warm");
  const [saved, setSaved] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wakeup-alarm");
      if (raw) {
        const a = JSON.parse(raw);
        if (typeof a.hour === "number") setHour(a.hour);
        if (typeof a.minute === "number") setMinute(a.minute);
        if (a.voice === "warm" || a.voice === "energetic" || a.voice === "calm") {
          setVoice(a.voice);
        }
      }
    } catch {}
  }, []);

  const stopAudio = () => {
    requestRef.current?.abort();
    requestRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopAudio();
    };
  }, []);

  const generateVoice = async () => {
    stopAudio();
    setAudioStatus("generating");
    const controller = new AbortController();
    requestRef.current = controller;

    try {
      const response = await fetch("/api/elevenlabs/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hour, minute, voice }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Voice generation failed");

      const audioUrl = URL.createObjectURL(await response.blob());
      audioUrlRef.current = audioUrl;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onplay = () => setAudioStatus("playing");
      audio.onended = () => setAudioStatus("idle");
      audio.onerror = () => setAudioStatus("error");
      await audio.play();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setAudioStatus("error");
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
    }
  };

  const startCall = () => {
    setScreen("incall");
    setElapsed(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed((value) => value + 1), 1000);
    void generateVoice();
  };

  const endCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    stopAudio();
    setAudioStatus("idle");
    setScreen("main");
  };

  const saveAlarm = () => {
    localStorage.setItem("wakeup-alarm", JSON.stringify({ hour, minute, voice }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const stepHour = (d: number) => setHour((h) => (h + d + 24) % 24);
  const stepMinute = (d: number) => setMinute((m) => (m + d + 60) % 60);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#cfe0ff] via-[#e8f0ff] to-[#f7f9ff] font-sans text-ink">
      {/* MAIN SCREEN */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-8 pt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl bg-brand text-primary-foreground ring-1 ring-card/40">
              <span className="font-display text-sm font-semibold">W</span>
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">WakeUp AI</span>
          </div>
          <span className="rounded-full bg-card/50 px-3 py-1 text-xs font-medium text-brand-deep ring-1 ring-card/60 backdrop-blur-md">
            Morning Call
          </span>
        </div>

        <div className="mt-7">
          <p className="text-sm font-medium text-ink/50">Your morning starts with a friendly call</p>
          <h1 className="mt-1 font-display text-3xl font-semibold leading-tight tracking-tight text-balance">
            Wake up to a <span className="text-brand">phone call</span>
          </h1>
        </div>

        {/* time picker */}
        <div className="mt-6 rounded-3xl bg-card/45 p-5 ring-1 ring-card/60 backdrop-blur-xl">
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

        {/* voice selector */}
        <div className="mt-5">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-ink/40">Voice</span>
          <div className="mt-2 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Voice selector">
            {VOICES.map((option) => {
              const Icon = option.icon;
              const selected = voice === option.id;
              return (
                <Button
                  key={option.id}
                  type="button"
                  variant="ghost"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setVoice(option.id)}
                  className={`relative h-28 min-w-0 flex-col whitespace-normal rounded-xl px-2 py-3 text-center ring-1 ${
                    selected
                      ? "bg-brand text-primary-foreground ring-brand"
                      : "bg-card/50 text-ink ring-card/70 hover:bg-card/75"
                  }`}
                >
                  {selected && <Check className="absolute right-2 top-2 size-3.5" />}
                  <Icon className="size-5" />
                  <span className="text-xs font-semibold leading-tight">{option.name}</span>
                  <span className={`text-[10px] font-normal leading-tight ${selected ? "text-primary-foreground/70" : "text-ink/45"}`}>
                    {option.description}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        <Button
          onClick={saveAlarm}
          className="mt-5 h-auto w-full rounded-2xl bg-ink py-4 text-sm font-semibold text-primary-foreground ring-1 ring-ink/10 hover:bg-ink/90"
        >
          {saved ? `Saved · ${pad(hour)}:${pad(minute)}` : "Save Alarm"}
        </Button>

        <Button
          variant="ghost"
          onClick={() => setScreen("incoming")}
          className="mt-5 h-auto w-full rounded-2xl bg-card/50 py-4 text-sm font-semibold text-brand-deep ring-1 ring-card/60 backdrop-blur-md hover:bg-card/70"
        >
          <span className="relative grid size-5 place-items-center">
            <span className="absolute inset-0 rounded-full bg-brand/40 animate-ripple" />
            <Phone className="relative size-4 text-brand" />
          </span>
          Test Incoming Call
        </Button>
      </div>

      {/* INCOMING CALL / IN-CALL OVERLAY */}
      {screen !== "main" && (
        <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-[#0b1220] via-[#111c33] to-[#0a0f1c] text-primary-foreground animate-slide-up">
          <div className="flex items-center justify-between px-7 pt-5 text-xs font-medium text-primary-foreground/70">
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
            <p className="mt-8 text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground/60">
              {screen === "incoming" ? "Incoming Call — AI Morning Call" : "AI Morning Call"}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">WakeUp AI</h2>
            {screen === "incall" && (
              <p className="mt-1 text-sm text-primary-foreground/60">
                In Call ({pad(Math.floor(elapsed / 60))}:{pad(elapsed % 60)})
              </p>
            )}
          </div>

          {screen === "incoming" ? (
            <div className="flex flex-col items-center gap-10 px-8 pb-16">
              <div className="flex items-center gap-20">
                <div className="flex flex-col items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={startCall}
                    aria-label="Answer call"
                    className="size-16 rounded-full bg-accept text-primary-foreground ring-1 ring-accept/40 hover:scale-105 hover:bg-accept"
                  >
                    <Phone className="size-6" />
                  </Button>
                  <span className="text-xs font-medium text-primary-foreground/70">Answer</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={endCall}
                    aria-label="Decline call"
                    className="size-16 rounded-full bg-decline text-primary-foreground ring-1 ring-decline/40 hover:scale-105 hover:bg-decline"
                  >
                    <X className="size-6" />
                  </Button>
                  <span className="text-xs font-medium text-primary-foreground/70">Decline</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 px-8 pb-16">
              <div className="flex min-h-12 items-center justify-center text-center text-sm text-primary-foreground/65" aria-live="polite">
                {audioStatus === "generating" && (
                  <span className="flex items-center gap-2"><LoaderCircle className="size-4 animate-spin" />Preparing your morning voice...</span>
                )}
                {audioStatus === "playing" && <span>Your morning message is playing</span>}
                {audioStatus === "idle" && <span>Morning message complete</span>}
                {audioStatus === "error" && (
                  <span className="flex flex-col items-center gap-2">
                    Voice generation was interrupted.
                    <Button variant="ghost" onClick={() => void generateVoice()} className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                      <RefreshCw className="size-4" /> Try Again
                    </Button>
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                onClick={endCall}
                className="h-auto rounded-full bg-decline px-8 py-3.5 text-sm font-semibold text-primary-foreground ring-1 ring-decline/40 hover:scale-105 hover:bg-decline"
              >
                <PhoneOff className="size-4" />
                Hang Up
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
