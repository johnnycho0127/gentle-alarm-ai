import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Phone, PhoneOff, X } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WakeUp AI — AI 모닝콜" },
      { name: "description", content: "알람을 전화로 맞는 AI 모닝콜 앱. 원하는 시간과 목소리 톤을 설정하세요." },
      { property: "og:title", content: "WakeUp AI — AI 모닝콜" },
      { property: "og:description", content: "알람을 전화로 맞는 AI 모닝콜 앱. 원하는 시간과 목소리 톤을 설정하세요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Tone = "friend" | "drill" | "anchor";
type Screen = "main" | "incoming" | "incall";

const TONES: { id: Tone; label: string; pitch: number; rate: number; message: string }[] = [
  {
    id: "friend",
    label: "다정한 친구",
    pitch: 1.1,
    rate: 1.0,
    message: "좋은 아침이에요! 지금은 설정하신 시간입니다. 오늘 하루도 당신의 멋진 도전을 응원해요!",
  },
  {
    id: "drill",
    label: "엄격한 교관",
    pitch: 0.7,
    rate: 1.15,
    message: "기상하십시오! 지금은 설정하신 시간입니다. 오늘 하루도 당신의 멋진 도전을 응원합니다!",
  },
  {
    id: "anchor",
    label: "밝은 아나운서",
    pitch: 1.3,
    rate: 1.1,
    message: "좋은 아침입니다! 지금은 설정하신 시간입니다. 오늘 하루도 당신의 멋진 도전을 응원합니다!",
  },
];

const pad = (n: number) => String(n).padStart(2, "0");

function Index() {
  const [screen, setScreen] = useState<Screen>("main");
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(30);
  const [tone, setTone] = useState<Tone>("friend");
  const [saved, setSaved] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wakeup-alarm");
      if (raw) {
        const a = JSON.parse(raw);
        if (typeof a.hour === "number") setHour(a.hour);
        if (typeof a.minute === "number") setMinute(a.minute);
        if (a.tone) setTone(a.tone);
      }
    } catch {}
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speak = (t: Tone) => {
    const cfg = TONES.find((x) => x.id === t)!;
    window.speechSynthesis?.cancel();
    const u = new SpeechSynthesisUtterance(cfg.message);
    u.lang = "ko-KR";
    u.pitch = cfg.pitch;
    u.rate = cfg.rate;
    const koVoice = window.speechSynthesis
      ?.getVoices()
      .find((v) => v.lang.startsWith("ko"));
    if (koVoice) u.voice = koVoice;
    window.speechSynthesis?.speak(u);
  };

  const startCall = () => {
    setScreen("incall");
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    speak(tone);
  };

  const endCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    window.speechSynthesis?.cancel();
    setScreen("main");
  };

  const saveAlarm = () => {
    localStorage.setItem("wakeup-alarm", JSON.stringify({ hour, minute, tone }));
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
            모닝콜
          </span>
        </div>

        <div className="mt-10">
          <p className="text-sm font-medium text-ink/50">오늘 아침을 깨워드릴게요</p>
          <h1 className="mt-1 font-display text-3xl font-semibold leading-tight tracking-tight text-balance">
            알람을 <span className="text-brand">전화</span>로 맞게요
          </h1>
        </div>

        {/* time picker */}
        <div className="mt-8 rounded-3xl bg-white/45 p-6 ring-1 ring-white/60 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-ink/40">알람 시간</span>
            <span className="text-xs font-medium text-brand-deep">매일 반복</span>
          </div>
          <div className="mt-4 flex items-end justify-center gap-3">
            {[
              { value: hour, step: stepHour },
              { value: minute, step: stepMinute },
            ].map((unit, i) => (
              <div key={i} className="flex flex-col items-center">
                <button
                  onClick={() => unit.step(1)}
                  aria-label="증가"
                  className="mb-1 grid size-7 place-items-center rounded-full bg-white/60 text-ink/40 ring-1 ring-white/70 transition-colors hover:bg-white/80"
                >
                  <ChevronUp className="size-4" />
                </button>
                <div className="grid size-20 place-items-center rounded-2xl bg-white/70 ring-1 ring-white/70">
                  <span className="font-display text-5xl font-semibold leading-none tabular-nums">
                    {pad(unit.value)}
                  </span>
                </div>
                <button
                  onClick={() => unit.step(-1)}
                  aria-label="감소"
                  className="mt-1 grid size-7 place-items-center rounded-full bg-white/60 text-ink/40 ring-1 ring-white/70 transition-colors hover:bg-white/80"
                >
                  <ChevronDown className="size-4" />
                </button>
              </div>
            )).reduce<React.ReactNode[]>((acc, el, i) => (i === 0 ? [el] : [...acc, <span key="colon" className="pb-16 font-display text-4xl font-semibold text-brand">:</span>, el]), [])}
          </div>
        </div>

        {/* voice tone */}
        <div className="mt-6">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-ink/40">목소리 톤</span>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {TONES.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                className={
                  tone === t.id
                    ? "rounded-2xl bg-brand p-3 text-left text-primary-foreground ring-1 ring-brand/40 transition-all"
                    : "rounded-2xl bg-white/45 p-3 text-left ring-1 ring-white/60 backdrop-blur-md transition-all hover:bg-white/60"
                }
              >
                <span className={`block text-xs font-medium ${tone === t.id ? "opacity-80" : "text-ink/40"}`}>
                  톤 {pad(i + 1)}
                </span>
                <span className="mt-1 block text-sm font-semibold leading-tight">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={saveAlarm}
          className="mt-6 w-full rounded-2xl bg-ink py-4 text-sm font-semibold text-primary-foreground ring-1 ring-ink/10 transition-opacity hover:opacity-90"
        >
          {saved ? `저장됨 · ${pad(hour)}:${pad(minute)}` : "알람 저장"}
        </button>

        <button
          onClick={() => setScreen("incoming")}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-white/50 py-4 text-sm font-semibold text-brand-deep ring-1 ring-white/60 backdrop-blur-md transition-colors hover:bg-white/70"
        >
          <span className="relative grid size-5 place-items-center">
            <span className="absolute inset-0 rounded-full bg-brand/40 animate-ripple" />
            <Phone className="relative size-4 text-brand" />
          </span>
          전화 수신 테스트
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
            <p className="mt-8 text-sm font-medium uppercase tracking-[0.2em] text-white/60">AI 모닝콜</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">WakeUp AI</h2>
            <p className="mt-1 text-sm text-white/50">
              {screen === "incoming"
                ? "전화 수신 중..."
                : `통화 중 (${pad(Math.floor(elapsed / 60))}:${pad(elapsed % 60)})`}
            </p>
          </div>

          {screen === "incoming" ? (
            <div className="flex flex-col items-center gap-10 px-8 pb-16">
              <div className="flex items-center gap-20">
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={startCall}
                    aria-label="전화 받기"
                    className="grid size-16 place-items-center rounded-full bg-accept text-primary-foreground ring-1 ring-accept/40 transition-transform hover:scale-105"
                  >
                    <Phone className="size-6" />
                  </button>
                  <span className="text-xs font-medium text-white/70">받기</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={endCall}
                    aria-label="거절"
                    className="grid size-16 place-items-center rounded-full bg-decline text-primary-foreground ring-1 ring-decline/40 transition-transform hover:scale-105"
                  >
                    <X className="size-6" />
                  </button>
                  <span className="text-xs font-medium text-white/70">거절</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 px-8 pb-16">
              <p className="max-w-xs text-center text-sm leading-relaxed text-white/60">
                "{TONES.find((t) => t.id === tone)!.message}"
              </p>
              <button
                onClick={endCall}
                className="flex items-center gap-2 rounded-full bg-decline px-8 py-3.5 text-sm font-semibold text-primary-foreground ring-1 ring-decline/40 transition-transform hover:scale-105"
              >
                <PhoneOff className="size-4" />
                통화 종료
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
