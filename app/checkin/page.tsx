"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const QUESTIONS = [
  { key: "sleep_quality", label: "Sleep quality last night", low: "Terrible", high: "Excellent" },
  { key: "morning_energy", label: "Morning energy right now", low: "Flat", high: "Charged" },
  { key: "stress_level", label: "Stress level", low: "Maxed out", high: "Calm" },
  { key: "soreness", label: "Muscle soreness", low: "Wrecked", high: "Fresh" },
  { key: "motivation", label: "Motivation to train", low: "None", high: "Ready" },
];

export default function CheckInPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    sleep_quality: 3,
    morning_energy: 3,
    stress_level: 3,
    soreness: 3,
    motivation: 3,
  });
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [edgeResponse, setEdgeResponse] = useState("");
  const [done, setDone] = useState(false);

  const isNotesStep = step === QUESTIONS.length;
  const q = QUESTIONS[step];

  async function submit() {
    setLoading(true);
    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...scores, notes }),
    });
    const data = await res.json();
    setEdgeResponse(data.response ?? "");
    setLoading(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-edge-bg flex flex-col items-center justify-center px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-edge-gold flex items-center justify-center mb-6">
          <span className="font-condensed font-black text-xl text-edge-bg">E</span>
        </div>
        <h1 className="font-condensed font-bold text-2xl uppercase tracking-wide mb-4">Check-in done.</h1>
        {edgeResponse && (
          <div className="bg-edge-surface rounded-xl p-4 border border-edge-gold/30 mb-8 max-w-xs text-left">
            <p className="text-white/90 font-body text-sm leading-relaxed">{edgeResponse}</p>
          </div>
        )}
        <button
          onClick={() => router.push("/home")}
          className="w-full max-w-xs bg-edge-red text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-edge-bg flex flex-col max-w-lg mx-auto px-4 pt-safe">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 py-6">
        {QUESTIONS.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-edge-red" : i < step ? "w-3 bg-white/40" : "w-3 bg-white/15"}`} />
        ))}
        <div className={`h-1.5 rounded-full transition-all ${step === QUESTIONS.length ? "w-6 bg-edge-red" : "w-3 bg-white/15"}`} />
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {!isNotesStep ? (
          <div>
            <h2 className="font-condensed font-bold text-2xl uppercase tracking-wide text-white mb-8 leading-tight">
              {q.label}
            </h2>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-edge-muted text-xs">{q.low}</span>
                <span className="font-condensed font-black text-3xl text-white">{scores[q.key]}</span>
                <span className="text-edge-muted text-xs">{q.high}</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={scores[q.key]}
                onChange={(e) => setScores({ ...scores, [q.key]: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between mt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className={`text-xs font-condensed ${scores[q.key] === n ? "text-edge-red font-bold" : "text-edge-muted"}`}>{n}</span>
                ))}
              </div>
            </div>
            <button
              onClick={() => setStep((s) => s + 1)}
              className="w-full bg-edge-red text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl active:scale-95"
            >
              Next
            </button>
          </div>
        ) : (
          <div>
            <h2 className="font-condensed font-bold text-2xl uppercase tracking-wide mb-2">
              Anything Edge should know today?
            </h2>
            <p className="text-edge-muted text-sm mb-6">Optional. Back tight, tough night, work mental...</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything relevant... or leave blank"
              rows={4}
              className="w-full bg-edge-surface border border-white/10 rounded-xl px-4 py-4 text-white font-body placeholder:text-edge-muted focus:outline-none focus:border-edge-red resize-none mb-6"
            />
            <button
              onClick={submit}
              disabled={loading}
              className="w-full bg-edge-red text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl disabled:opacity-50 active:scale-95"
            >
              {loading ? "Submitting..." : "Submit Check-in"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
