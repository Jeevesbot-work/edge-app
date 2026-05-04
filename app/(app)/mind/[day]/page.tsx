"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { LESSONS } from "@/lib/data/lessons";
import { getPhaseColor } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type Step = "content" | "journal" | "reflection" | "action" | "score" | "done";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const day = parseInt(params.day as string);
  const lesson = LESSONS.find((l) => l.day === day);

  const [step, setStep] = useState<Step>("content");
  const [reflection, setReflection] = useState("");
  const [microActionDone, setMicroActionDone] = useState(false);
  const [score, setScore] = useState(5);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!lesson) return;
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: prog } = await supabase.from("programme_state").select("*").eq("user_id", user.id).single();
      const cycle = prog ? Math.ceil(prog.current_day / 30) : 1;
      const { data } = await supabase
        .from("lesson_completions")
        .select("*")
        .eq("user_id", user.id)
        .eq("day_number", day)
        .eq("cycle", cycle)
        .single();
      if (data) {
        if (data.reflection) setReflection(data.reflection);
        if (data.micro_action_done) setMicroActionDone(true);
        if (data.end_of_day_score) setScore(data.end_of_day_score);
      }
    }
    load();
  }, [day, lesson]);

  async function saveAndFinish() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: prog } = await supabase.from("programme_state").select("*").eq("user_id", user.id).single();
    const cycle = prog ? Math.ceil(prog.current_day / 30) : 1;

    await supabase.from("lesson_completions").upsert({
      user_id: user.id,
      day_number: day,
      cycle,
      reflection,
      micro_action_done: microActionDone,
      end_of_day_score: score,
      completed_at: new Date().toISOString(),
    });

    setSaving(false);
    setStep("done");
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-edge-muted">Lesson not found.</p>
      </div>
    );
  }

  const phaseColor = getPhaseColor(lesson.phaseCode);
  const steps: Step[] = ["content", "journal", "reflection", "action", "score"];
  const stepIdx = steps.indexOf(step);
  const progress = stepIdx >= 0 ? stepIdx / (steps.length - 1) : 1;

  if (step === "done") {
    return (
      <div className="min-h-screen bg-edge-bg flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${phaseColor}20` }}>
          <span className="font-condensed font-black text-2xl" style={{ color: phaseColor }}>{lesson.phaseCode}</span>
        </div>
        <h1 className="font-condensed font-black text-3xl uppercase tracking-wide mb-2">Lesson done.</h1>
        <p className="text-edge-muted font-body text-sm mb-8">Day {day} · {lesson.title}</p>
        <button
          onClick={() => router.push("/mind")}
          className="w-full max-w-xs bg-edge-red text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl"
        >
          Back to Mind
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-edge-bg flex flex-col max-w-lg mx-auto">
      {/* Progress */}
      <div className="h-1 bg-white/10">
        <div className="h-full transition-all duration-500" style={{ width: `${progress * 100}%`, backgroundColor: phaseColor }} />
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 pt-safe">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-edge-surface border border-white/10 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-condensed uppercase tracking-widest" style={{ color: phaseColor }}>
            Day {day} · Phase {lesson.phaseCode}
          </p>
          <h1 className="font-condensed font-bold text-lg uppercase tracking-wide text-white truncate leading-tight">
            {lesson.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {step === "content" && (
          <div>
            <p className="text-white/90 font-body text-base leading-relaxed whitespace-pre-line mb-8">
              {lesson.content}
            </p>
          </div>
        )}

        {step === "journal" && (
          <div>
            <div className="bg-edge-surface rounded-xl p-4 border-l-4 mb-6" style={{ borderColor: phaseColor }}>
              <p className="text-xs font-condensed uppercase tracking-widest mb-2" style={{ color: phaseColor }}>
                Voice Journal Prompt
              </p>
              <p className="text-white font-body text-base leading-relaxed">{lesson.voiceJournalPrompt}</p>
            </div>
            <p className="text-edge-muted text-sm font-body leading-relaxed mb-6">
              Speak your answer out loud. No one's listening. Just you and the truth.
            </p>
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: `${phaseColor}20`, border: `2px solid ${phaseColor}` }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8" style={{ color: phaseColor }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <p className="text-center text-edge-muted text-xs">Voice recording coming soon — speak your answer aloud</p>
          </div>
        )}

        {step === "reflection" && (
          <div>
            <p className="text-xs font-condensed uppercase tracking-widest mb-4" style={{ color: phaseColor }}>
              Written Reflection
            </p>
            {lesson.reflectionQuestions.map((q, i) => (
              <div key={i} className="mb-4">
                <p className="text-white font-body text-sm leading-relaxed mb-2">{q}</p>
              </div>
            ))}
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Write your honest answer here..."
              rows={6}
              className="w-full bg-edge-surface border border-white/10 rounded-xl px-4 py-4 text-white font-body text-sm placeholder:text-edge-muted focus:outline-none focus:border-edge-red resize-none"
            />
          </div>
        )}

        {step === "action" && (
          <div>
            <p className="text-xs font-condensed uppercase tracking-widest mb-4" style={{ color: phaseColor }}>
              Micro Action
            </p>
            <div className="bg-edge-surface rounded-xl p-5 border border-white/[0.08] mb-6">
              <p className="text-white font-body text-base leading-relaxed">{lesson.microAction}</p>
            </div>
            <button
              onClick={() => setMicroActionDone(!microActionDone)}
              className={`w-full py-4 rounded-xl border font-condensed font-bold text-base uppercase tracking-wide transition-all ${
                microActionDone
                  ? "border-green-500 bg-green-500/10 text-green-400"
                  : "border-white/20 text-white/60"
              }`}
            >
              {microActionDone ? "Done" : "Mark as done"}
            </button>
          </div>
        )}

        {step === "score" && (
          <div>
            <p className="text-xs font-condensed uppercase tracking-widest mb-2" style={{ color: phaseColor }}>
              End of Day
            </p>
            <h2 className="font-condensed font-bold text-2xl uppercase tracking-wide text-white mb-6 leading-tight">
              How did today feel?
            </h2>
            <div className="flex justify-between mb-2">
              <span className="text-edge-muted text-xs">Struggling</span>
              <span className="text-edge-muted text-xs">Powerful</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={score}
              onChange={(e) => setScore(parseInt(e.target.value))}
              className="w-full mb-4"
            />
            <div className="text-center">
              <span className="font-condensed font-black text-6xl" style={{ color: phaseColor }}>{score}</span>
              <span className="text-edge-muted text-lg">/10</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="px-4 pb-safe pb-4 pt-2 border-t border-white/[0.08]">
        {step === "score" ? (
          <button
            onClick={saveAndFinish}
            disabled={saving}
            className="w-full py-4 rounded-xl font-condensed font-bold text-xl uppercase tracking-widest text-white disabled:opacity-50"
            style={{ backgroundColor: phaseColor }}
          >
            {saving ? "Saving..." : "Complete Lesson"}
          </button>
        ) : (
          <button
            onClick={() => {
              const next: Record<Step, Step> = {
                content: "journal",
                journal: "reflection",
                reflection: "action",
                action: "score",
                score: "done",
                done: "done",
              };
              setStep(next[step]);
            }}
            className="w-full py-4 rounded-xl font-condensed font-bold text-xl uppercase tracking-widest text-white"
            style={{ backgroundColor: phaseColor }}
          >
            {step === "content" ? "Continue" : step === "action" ? "Next" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
