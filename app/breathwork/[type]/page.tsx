"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

const BREATHWORK = {
  box: {
    name: "Box Breathing",
    subtitle: "Navy SEAL technique for stress and focus",
    color: "#E8291C",
    rounds: 4,
    phases: [
      { label: "Inhale", duration: 4 },
      { label: "Hold", duration: 4 },
      { label: "Exhale", duration: 4 },
      { label: "Hold", duration: 4 },
    ],
  },
  "478": {
    name: "4-7-8 Breathing",
    subtitle: "Relaxation and sleep technique",
    color: "#F5A623",
    rounds: 4,
    phases: [
      { label: "Inhale", duration: 4 },
      { label: "Hold", duration: 7 },
      { label: "Exhale", duration: 8 },
    ],
  },
  power: {
    name: "Power Breathing",
    subtitle: "Quick energy and clarity boost",
    color: "#3B82F6",
    rounds: 10,
    phases: [
      { label: "Inhale", duration: 3 },
      { label: "Exhale", duration: 3 },
    ],
  },
};

export default function BreathworkPage() {
  const params = useParams();
  const router = useRouter();
  const bw = BREATHWORK[params.type as keyof typeof BREATHWORK];

  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(1);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [finished, setFinished] = useState(false);
  const [scale, setScale] = useState(0.6);

  const phase = bw?.phases[phaseIdx];

  const advance = useCallback(() => {
    const nextPhaseIdx = phaseIdx + 1;
    if (nextPhaseIdx >= bw.phases.length) {
      const nextRound = round + 1;
      if (nextRound > bw.rounds) {
        setFinished(true);
        return;
      }
      setRound(nextRound);
      setPhaseIdx(0);
      setCountdown(bw.phases[0].duration);
    } else {
      setPhaseIdx(nextPhaseIdx);
      setCountdown(bw.phases[nextPhaseIdx].duration);
    }
  }, [phaseIdx, round, bw]);

  useEffect(() => {
    if (!started || finished) return;
    if (countdown <= 0) { advance(); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [started, finished, countdown, advance]);

  useEffect(() => {
    if (!started) return;
    const label = phase?.label ?? "";
    if (label === "Inhale") setScale(1);
    else if (label === "Exhale") setScale(0.6);
  }, [phase, started]);

  function start() {
    setCountdown(bw.phases[0].duration);
    setStarted(true);
  }

  if (!bw) return null;

  return (
    <div className="min-h-screen bg-edge-bg flex flex-col items-center justify-center px-6 max-w-lg mx-auto">
      {/* Header */}
      <button onClick={() => router.back()} className="absolute top-6 left-4 w-9 h-9 rounded-xl bg-edge-surface border border-white/10 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="text-center mb-12">
        <h1 className="font-condensed font-black text-3xl uppercase tracking-wide text-white mb-1">{bw.name}</h1>
        <p className="text-edge-muted text-sm">{bw.subtitle}</p>
      </div>

      {finished ? (
        <div className="text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 mx-auto" style={{ backgroundColor: `${bw.color}20`, border: `2px solid ${bw.color}` }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-10 h-10" style={{ color: bw.color }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-condensed font-black text-3xl uppercase tracking-wide mb-2">Done.</h2>
          <p className="text-edge-muted mb-8">{bw.rounds} rounds complete.</p>
          <button onClick={() => router.push("/mind")} className="bg-edge-red text-white font-condensed font-bold text-xl uppercase tracking-widest px-8 py-4 rounded-xl">
            Back to Mind
          </button>
        </div>
      ) : (
        <>
          {/* Animated circle */}
          <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
            <div
              className="absolute w-full h-full rounded-full transition-transform"
              style={{
                backgroundColor: `${bw.color}20`,
                border: `2px solid ${bw.color}`,
                transform: `scale(${scale})`,
                transition: started ? `transform ${phase?.duration ?? 4}s ease-in-out` : "none",
              }}
            />
            <div className="text-center z-10">
              {started ? (
                <>
                  <p className="font-condensed font-bold text-sm uppercase tracking-widest mb-1" style={{ color: bw.color }}>
                    {phase?.label}
                  </p>
                  <p className="font-condensed font-black text-5xl text-white">{countdown}</p>
                </>
              ) : (
                <p className="font-condensed font-bold text-sm text-edge-muted uppercase tracking-wide">
                  Ready
                </p>
              )}
            </div>
          </div>

          {/* Round indicator */}
          {started && (
            <div className="flex gap-2 mb-8">
              {Array.from({ length: bw.rounds }).map((_, i) => (
                <div key={i} className={`h-1.5 w-6 rounded-full ${i < round - 1 ? "opacity-100" : i === round - 1 ? "opacity-80" : "opacity-20"}`} style={{ backgroundColor: bw.color }} />
              ))}
            </div>
          )}

          {!started ? (
            <button
              onClick={start}
              className="font-condensed font-bold text-xl uppercase tracking-widest px-12 py-4 rounded-xl text-white"
              style={{ backgroundColor: bw.color }}
            >
              Begin
            </button>
          ) : (
            <div className="text-center">
              <p className="text-edge-muted text-sm">Round {round} of {bw.rounds}</p>
              <button onClick={() => { setStarted(false); setRound(1); setPhaseIdx(0); setFinished(false); setScale(0.6); }} className="text-edge-muted text-xs underline mt-2">
                Stop
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
