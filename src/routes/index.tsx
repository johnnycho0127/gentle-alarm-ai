import React, { useState, useEffect, useRef } from 'react';

export default function Index() {
  const [alarmTime, setAlarmTime] = useState('07:00');
  const [selectedSoundType, setSelectedSoundType] = useState<'recorded' | 'nature'>('recorded');
  const [natureSound, setNatureSound] = useState('birds');
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);

  // 1. Audio Recording Handler
  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        setAudioUrl(URL.createObjectURL(audioBlob));
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access is required to record custom alarms.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 2. Alarm Trigger & Call Timer
  const triggerAlarm = () => {
    setIsAlarmActive(true);
  };

  const handleAnswer = () => {
    setIsAlarmActive(false);
    setInCall(true);

    if (selectedSoundType === 'recorded' && audioUrl) {
      playbackAudioRef.current = new Audio(audioUrl);
      playbackAudioRef.current.play();
    } else {
      const natureUrls: Record<string, string> = {
        birds: 'https://actions.google.com/sounds/v1/ambiences/outdoor_birds.ogg',
        rain: 'https://actions.google.com/sounds/v1/weather/rain_heavy.ogg'
      };
      playbackAudioRef.current = new Audio(natureUrls[natureSound] || natureUrls.birds);
      playbackAudioRef.current.play();
    }
  };

  const handleHangUp = () => {
    if (playbackAudioRef.current) {
      playbackAudioRef.current.pause();
    }
    setInCall(false);
    setCallDuration(0);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (inCall) {
      timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [inCall]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      
      {/* SCREEN 1: MAIN SETUP */}
      {!isAlarmActive && !inCall && (
        <div className="w-full max-w-md bg-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <h1 className="text-2xl font-bold text-center">WakeUp App ($0 API Cost)</h1>

          {/* Time Picker */}
          <div>
            <label className="block text-sm font-medium mb-2">Set Alarm Time</label>
            <input
              type="time"
              value={alarmTime}
              onChange={(e) => setAlarmTime(e.target.value)}
              className="w-full bg-slate-700 text-3xl text-center p-3 rounded-xl border border-slate-600 font-mono"
            />
          </div>

          {/* Sound Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Alarm Sound Source</label>
            <select
              value={selectedSoundType}
              onChange={(e) => setSelectedSoundType(e.target.value as 'recorded' | 'nature')}
              className="w-full bg-slate-700 p-3 rounded-xl border border-slate-600"
            >
              <option value="recorded">Record Custom Voice / Friend Note</option>
              <option value="nature">Nature Ambient Sound</option>
            </select>
          </div>

          {/* Recorder Component */}
          {selectedSoundType === 'recorded' && (
            <div className="p-4 bg-slate-700/50 rounded-xl space-y-3 text-center">
              <p className="text-xs text-slate-400">Record a 10s wake-up message</p>
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  🎙️ Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium animate-pulse"
                >
                  ⏹️ Stop Recording
                </button>
              )}
              {audioUrl && <p className="text-xs text-green-400">✓ Recording Saved!</p>}
            </div>
          )}

          {/* Nature Sound Component */}
          {selectedSoundType === 'nature' && (
            <div>
              <select
                value={natureSound}
                onChange={(e) => setNatureSound(e.target.value)}
                className="w-full bg-slate-700 p-3 rounded-xl border border-slate-600"
              >
                <option value="birds">Morning Birds</option>
                <option value="rain">Gentle Rain</option>
              </select>
            </div>
          )}

          {/* Test Alarm Trigger */}
          <button
            onClick={triggerAlarm}
            className="w-full bg-indigo-600 hover:bg-indigo-500 p-4 rounded-xl font-bold text-lg transition"
          >
            Save & Test Alarm Call
          </button>
        </div>
      )}

      {/* SCREEN 2: INCOMING CALL UI */}
      {isAlarmActive && (
        <div className="w-full max-w-md h-[600px] bg-slate-950 rounded-3xl p-8 flex flex-col justify-between items-center text-center shadow-2xl border border-slate-800">
          <div className="mt-12 space-y-2">
            <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
              ⏰
            </div>
            <h2 className="text-2xl font-bold mt-4">Morning Alarm Call</h2>
            <p className="text-slate-400 text-sm">Wake up! Incoming sound call...</p>
          </div>

          <div className="w-full flex justify-around mb-8">
            <button
              onClick={() => setIsAlarmActive(false)}
              className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-105 transition"
            >
              🛑
            </button>
            <button
              onClick={handleAnswer}
              className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-105 transition animate-pulse"
            >
              📞
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 3: ACTIVE CALL UI */}
      {inCall && (
        <div className="w-full max-w-md h-[600px] bg-slate-950 rounded-3xl p-8 flex flex-col justify-between items-center text-center shadow-2xl border border-slate-800">
          <div className="mt-12 space-y-2">
            <div className="w-24 h-24 bg-green-600/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto text-3xl">
              🗣️
            </div>
            <h2 className="text-2xl font-bold mt-4">In Call</h2>
            <p className="text-green-400 font-mono text-sm">
              00:{callDuration < 10 ? `0${callDuration}` : callDuration}
            </p>
          </div>

          <button
            onClick={handleHangUp}
            className="w-full bg-red-600 hover:bg-red-500 p-4 rounded-xl font-bold text-lg mb-8"
          >
            End Call
          </button>
        </div>
      )}
    </div>
  );
}
