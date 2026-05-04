"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { SESSIONS } from "@/lib/data/training";
import { createClient } from "@/lib/supabase/client";

type SetLog = { reps: number; weight: string; done: boolean };

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionType = params.session as string;
  const session = SESSIONS[sessionType];

  const [started, setStarted] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [sets, setSets] = useState<SetLog[][]>([]);
  const [timer, setTimer] = useState(0);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [struggled, setStruggled] = useState<boolean[]>([]);

  useEffect(() => {
    if (!session) return;
    setSets(session.exercises.map((e) =>
      Array(e.sets).fill(null).map(() => ({ reps: 0, weight: "", done: false }))
    ));
    setStruggled(session.exercises.map(() => false));
  }, [session]);

  useEffect(() => {
    if (!started || completed) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [started, completed]);

  useEffect(() => {
    if (restTimer === null) return;
    if (restTimer <= 0) { setRestTimer(null); return; }
    const timeout = setTimeout(() => setRestTimer((t) => (t ?? 1) - 1), 1000);
    return () => clearTimeout(timeout);
  }, [restTimer]);

  const logSet = useCallback((exIdx: number, setIdx: number, field: keyof SetLog, value: string | number | boolean) => {
    setSets((prev) => {
      const next = prev.map((ex) => [...ex]);
      next[exIdx][setIdx] = { ...next[exIdx][setIdx], [field]: value };
      return next;
    });
    if (field === "done" && value === true) {
      setRestTimer(90);
    }
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  async function finishSession() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const duration = Math.round((Date.now() - startTime) / 60000);
    const { data: sessionData } = await supabase
      .from("training_sessions")
      .insert({
        user_id: user.id,
        session_type: sessionType,
        completed_at: new Date().toISOString(),
        duration_minutes: duration,
      })
      .select()
      .single();

    if (sessionData && sets.length) {
      const logs = session.exercises.flatMap((ex, i) =>
        sets[i]
          .filter((s) => s.done)
          .map((s, j) => ({
            session_id: sessionData.id,
            user_id: user.id,
            exercise_name: ex.name,
            sets_completed: j + 1,
            reps: s.reps || null,
            weight_kg: s.weight ? parseFloat(s.weight) : null,
            struggled: struggled[i],
          }))
      );
      if (logs.length) await supabase.from("exercise_logs").insert(logs);
    }

    setCompleted(true);
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-edge-muted">Session not found.</p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-edge-bg flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-10 h-10 text-green-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-condensed font-black text-5xl uppercase tracking-wide mb-2">Done.</h1>
        <p className="text-edge-muted font-body mb-2">{formatTime(timer)} · {session.name}</p>
        <div className="bg-edge-surface rounded-xl p-4 border border-edge-gold/30 mb-8 max-w-xs w-full">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-edge-gold flex items-center justify-center flex-shrink-0">
              <span className="font-condensed font-black text-xs text-edge-bg">E</span>
            </div>
            <p className="text-white/90 font-body text-sm leading-relaxed">
              Session logged. That's one more than the man who didn't show up today. See you next session.
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/train")}
          className="w-full max-w-xs bg-edge-red text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl"
        >
          Back to Training
        </button>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-edge-bg flex flex-col px-4 pt-safe max-w-lg mx-auto">
        <div className="py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-edge-surface border border-white/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-condensed font-black text-2xl uppercase tracking-wide flex-1">{session.name}</h1>
        </div>

        <div className="flex-1 overflow-y-auto pb-6">
          {/* Warmup */}
          <div className="bg-edge-surface rounded-xl p-4 border border-white/[0.08] mb-4">
            <h2 className="font-condensed font-bold text-sm uppercase tracking-widest text-edge-muted mb-3">Warmup</h2>
            <ul className="space-y-2">
              {session.warmup.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-white/80 font-body text-sm">
                  <span className="text-edge-gold mt-0.5 flex-shrink-0">›</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>

          {/* Exercises */}
          <div className="mb-4">
            <h2 className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted mb-3">Exercises</h2>
            <div className="space-y-3">
              {session.exercises.map((ex, i) => (
                <div key={i} className="bg-edge-surface rounded-xl p-4 border border-white/[0.08]">
                  <p className="font-condensed font-bold text-base uppercase tracking-wide text-white mb-1">{ex.name}</p>
                  <p className="text-edge-gold text-sm font-condensed">{ex.sets} sets × {ex.reps}</p>
                  {ex.notes && <p className="text-edge-muted text-xs mt-1 font-body">{ex.notes}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Finisher */}
          <div className="bg-edge-surface rounded-xl p-4 border border-white/[0.08] mb-4">
            <h2 className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted mb-2">Finisher</h2>
            <p className="text-white/80 font-body text-sm">{session.finisher}</p>
          </div>

          {/* Coach note */}
          <div className="bg-edge-surface rounded-xl p-4 border-l-4 border-edge-gold border-t border-r border-b border-white/[0.08] mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-edge-gold flex items-center justify-center">
                <span className="font-condensed font-black text-xs text-edge-bg">E</span>
              </div>
              <span className="text-edge-gold font-condensed font-bold text-xs uppercase tracking-wide">Edge</span>
            </div>
            <p className="text-white/80 font-body text-sm">{session.coachNote}</p>
          </div>
        </div>

        <div className="pb-safe pb-4">
          <button
            onClick={() => setStarted(true)}
            className="w-full bg-edge-red text-white font-condensed font-bold text-xl uppercase tracking-widest py-5 rounded-xl active:scale-95"
          >
            Start & Log This Session
          </button>
        </div>
      </div>
    );
  }

  const ex = session.exercises[currentExercise];
  const exSets = sets[currentExercise] ?? [];
  const doneSets = exSets.filter((s) => s.done).length;

  return (
    <div className="min-h-screen bg-edge-bg flex flex-col max-w-lg mx-auto px-4 pt-safe">
      {/* Header */}
      <div className="py-4 flex items-center justify-between">
        <p className="text-edge-muted text-sm font-condensed">
          {currentExercise + 1}/{session.exercises.length} · {formatTime(timer)}
        </p>
        <div className="flex gap-2">
          {session.exercises.map((_, i) => (
            <div key={i} className={`h-1.5 w-6 rounded-full ${i === currentExercise ? "bg-edge-red" : i < currentExercise ? "bg-green-500" : "bg-white/20"}`} />
          ))}
        </div>
      </div>

      {/* Rest timer overlay */}
      {restTimer !== null && (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
          <p className="text-edge-muted text-sm uppercase tracking-widest mb-2">Rest</p>
          <p className="font-condensed font-black text-8xl text-white">{restTimer}</p>
          <button onClick={() => setRestTimer(null)} className="mt-6 text-edge-muted text-sm underline">
            Skip rest
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {/* Exercise name */}
        <div className="mb-6">
          <h2 className="font-condensed font-black text-3xl uppercase tracking-wide text-white leading-tight mb-1">{ex.name}</h2>
          <p className="text-edge-gold font-condensed font-bold">{ex.sets} sets × {ex.reps}</p>
          {ex.notes && <p className="text-edge-muted text-xs mt-1">{ex.notes}</p>}
        </div>

        {/* Sets */}
        <div className="space-y-3 mb-6">
          {exSets.map((set, si) => (
            <div key={si} className={`bg-edge-surface rounded-xl p-4 border ${set.done ? "border-green-500/40" : "border-white/[0.08]"}`}>
              <div className="flex items-center gap-3">
                <span className={`font-condensed font-bold text-sm w-8 ${set.done ? "text-green-400" : "text-edge-muted"}`}>
                  Set {si + 1}
                </span>
                <input
                  type="number"
                  value={set.reps || ""}
                  onChange={(e) => logSet(currentExercise, si, "reps", parseInt(e.target.value) || 0)}
                  placeholder="Reps"
                  disabled={set.done}
                  className="flex-1 bg-edge-bg border border-white/10 rounded-lg px-3 py-2 text-white text-center font-condensed text-lg disabled:opacity-50"
                />
                <input
                  type="text"
                  value={set.weight}
                  onChange={(e) => logSet(currentExercise, si, "weight", e.target.value)}
                  placeholder="kg"
                  disabled={set.done}
                  className="w-20 bg-edge-bg border border-white/10 rounded-lg px-3 py-2 text-white text-center font-condensed text-lg disabled:opacity-50"
                />
                <button
                  onClick={() => logSet(currentExercise, si, "done", !set.done)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${set.done ? "bg-green-500/20 border border-green-500/40" : "bg-white/10 border border-white/20"}`}
                >
                  {set.done ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-green-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-white/40">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Struggled toggle */}
        <button
          onClick={() => setStruggled((prev) => prev.map((s, i) => i === currentExercise ? !s : s))}
          className={`w-full py-3 rounded-xl border font-condensed font-bold text-sm uppercase tracking-wide mb-6 transition-colors ${
            struggled[currentExercise]
              ? "border-edge-gold bg-edge-gold/10 text-edge-gold"
              : "border-white/10 text-edge-muted"
          }`}
        >
          {struggled[currentExercise] ? "Flagged as hard — Edge will adjust" : "I struggled with this"}
        </button>
      </div>

      {/* Navigation */}
      <div className="pb-safe pb-4 flex gap-3">
        {currentExercise > 0 && (
          <button
            onClick={() => setCurrentExercise((e) => e - 1)}
            className="flex-none w-12 h-14 bg-edge-surface border border-white/10 rounded-xl flex items-center justify-center"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {currentExercise < session.exercises.length - 1 ? (
          <button
            onClick={() => setCurrentExercise((e) => e + 1)}
            disabled={doneSets === 0}
            className="flex-1 bg-edge-red text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl disabled:opacity-40 active:scale-95"
          >
            Next Exercise
          </button>
        ) : (
          <button
            onClick={finishSession}
            className="flex-1 bg-green-600 text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl active:scale-95"
          >
            Finish Session
          </button>
        )}
      </div>
    </div>
  );
}
