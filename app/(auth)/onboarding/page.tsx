"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const GOALS = [
  { value: "stronger", label: "Get stronger" },
  { value: "back", label: "Fix my back and movement" },
  { value: "energy", label: "More energy and vitality" },
  { value: "fat", label: "Lose body fat" },
  { value: "identity", label: "Rebuild my identity" },
  { value: "all", label: "All of the above" },
];

const TRAINING_STATES = [
  { value: "none", label: "Not training at all" },
  { value: "occasional", label: "Training occasionally (1x/week or less)" },
  { value: "inconsistent", label: "Training inconsistently" },
  { value: "regular", label: "Training regularly but not progressing" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    full_name: "",
    age: "",
    goal: "",
    training_state: "",
    injuries: "",
    days_per_week: 3,
    commitment_answer: "",
  });

  const steps = [
    "intro",
    "name",
    "goal",
    "state",
    "injuries",
    "availability",
    "commitment",
    "ready",
  ];

  const current = steps[step];
  const progress = step / (steps.length - 1);

  async function handleComplete() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email!,
      full_name: data.full_name,
      age: parseInt(data.age) || null,
      goal: data.goal,
      training_state: data.training_state,
      injuries: data.injuries || null,
      days_per_week: data.days_per_week,
      commitment_answer: data.commitment_answer,
    });

    router.push("/pending");
  }

  function next() {
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  return (
    <div className="min-h-screen bg-edge-bg flex flex-col">
      {/* Progress bar */}
      {step > 0 && step < steps.length - 1 && (
        <div className="h-1 bg-white/10">
          <div
            className="h-full bg-edge-red transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col px-6 py-10">
        {current === "intro" && (
          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-edge-gold mb-6">
                <span className="font-condensed font-black text-xl text-edge-bg tracking-wider">E</span>
              </div>
              <h1 className="font-condensed font-black text-4xl text-white uppercase tracking-wide leading-tight mb-4">
                Good to meet you.
              </h1>
              <div className="space-y-3 text-white/80 font-body leading-relaxed">
                <p>I'm Edge. Nick built me to work with men in their 40s and 50s who are done feeling buried and ready to build something back.</p>
                <p>I need to ask you five questions before I set up your programme. They matter — so be honest.</p>
              </div>
            </div>
            <button
              onClick={next}
              className="w-full bg-edge-red text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl active:scale-95 transition-transform"
            >
              Let's go
            </button>
          </div>
        )}

        {current === "name" && (
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="font-condensed font-bold text-3xl uppercase tracking-wide mb-2">
              What's your name?
            </h2>
            <p className="text-edge-muted text-sm mb-8">First name is fine.</p>
            <input
              type="text"
              value={data.full_name}
              onChange={(e) => setData({ ...data, full_name: e.target.value })}
              placeholder="Your name"
              autoFocus
              className="w-full bg-edge-surface border border-white/10 rounded-xl px-4 py-4 text-white text-lg font-body placeholder:text-edge-muted focus:outline-none focus:border-edge-red mb-4"
            />
            <input
              type="number"
              value={data.age}
              onChange={(e) => setData({ ...data, age: e.target.value })}
              placeholder="Your age"
              min={30}
              max={80}
              className="w-full bg-edge-surface border border-white/10 rounded-xl px-4 py-4 text-white text-lg font-body placeholder:text-edge-muted focus:outline-none focus:border-edge-red mb-8"
            />
            <button
              onClick={next}
              disabled={!data.full_name}
              className="w-full bg-edge-red text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl disabled:opacity-50 active:scale-95 transition-transform"
            >
              Next
            </button>
          </div>
        )}

        {current === "goal" && (
          <div className="flex-1 flex flex-col">
            <h2 className="font-condensed font-bold text-3xl uppercase tracking-wide mb-2">
              What's the main reason you're here?
            </h2>
            <p className="text-edge-muted text-sm mb-6">Be honest. This shapes everything.</p>
            <div className="space-y-3 flex-1">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setData({ ...data, goal: g.value })}
                  className={`w-full text-left px-5 py-4 rounded-xl border font-body text-base transition-all ${
                    data.goal === g.value
                      ? "border-edge-red bg-edge-red/10 text-white"
                      : "border-white/10 bg-edge-surface text-white/80"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <button
              onClick={next}
              disabled={!data.goal}
              className="w-full bg-edge-red text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl disabled:opacity-50 mt-6 active:scale-95"
            >
              Next
            </button>
          </div>
        )}

        {current === "state" && (
          <div className="flex-1 flex flex-col">
            <h2 className="font-condensed font-bold text-3xl uppercase tracking-wide mb-2">
              How would you describe your training right now?
            </h2>
            <p className="text-edge-muted text-sm mb-6">No judgement. Just honest.</p>
            <div className="space-y-3 flex-1">
              {TRAINING_STATES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setData({ ...data, training_state: s.value })}
                  className={`w-full text-left px-5 py-4 rounded-xl border font-body text-base transition-all ${
                    data.training_state === s.value
                      ? "border-edge-red bg-edge-red/10 text-white"
                      : "border-white/10 bg-edge-surface text-white/80"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <button
              onClick={next}
              disabled={!data.training_state}
              className="w-full bg-edge-red text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl disabled:opacity-50 mt-6 active:scale-95"
            >
              Next
            </button>
          </div>
        )}

        {current === "injuries" && (
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="font-condensed font-bold text-3xl uppercase tracking-wide mb-2">
              Any injuries or limitations I should know about?
            </h2>
            <p className="text-edge-muted text-sm mb-6">Lower back, knee, shoulder — or none.</p>
            <textarea
              value={data.injuries}
              onChange={(e) => setData({ ...data, injuries: e.target.value })}
              placeholder="Lower back issues, old knee injury... or leave blank if none"
              rows={4}
              className="w-full bg-edge-surface border border-white/10 rounded-xl px-4 py-4 text-white font-body placeholder:text-edge-muted focus:outline-none focus:border-edge-red resize-none mb-8"
            />
            <button
              onClick={next}
              className="w-full bg-edge-red text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl active:scale-95"
            >
              {data.injuries ? "Next" : "No injuries, next"}
            </button>
          </div>
        )}

        {current === "availability" && (
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="font-condensed font-bold text-3xl uppercase tracking-wide mb-2">
              How many days per week can you realistically commit?
            </h2>
            <p className="text-edge-muted text-sm mb-8">
              Be realistic — consistency beats perfection.
            </p>
            <div className="flex gap-4 mb-8">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => setData({ ...data, days_per_week: n })}
                  className={`flex-1 py-6 rounded-xl border font-condensed font-black text-3xl transition-all ${
                    data.days_per_week === n
                      ? "border-edge-red bg-edge-red/10 text-white"
                      : "border-white/10 bg-edge-surface text-white/60"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-edge-muted text-xs text-center mb-8">
              {data.days_per_week === 3
                ? "3 days is the standard programme — proven to work."
                : data.days_per_week === 2
                ? "2 days is fine. We build around what you can actually do."
                : "4 days — solid commitment. We'll use that."}
            </p>
            <button
              onClick={next}
              className="w-full bg-edge-red text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl active:scale-95"
            >
              Next
            </button>
          </div>
        )}

        {current === "commitment" && (
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="font-condensed font-bold text-3xl uppercase tracking-wide mb-4 leading-tight">
              Last thing. Edge is not a motivational app.
            </h2>
            <p className="text-white/80 font-body leading-relaxed mb-8">
              Edge will push you. He will notice when you disappear. He will tell you the truth. Are you ready for that?
            </p>
            <div className="space-y-3 mb-8">
              {[
                { value: "yes", label: "Yes — I need that" },
                { value: "unsure", label: "I'm not sure yet" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setData({ ...data, commitment_answer: opt.value })}
                  className={`w-full text-left px-5 py-4 rounded-xl border font-body text-base transition-all ${
                    data.commitment_answer === opt.value
                      ? "border-edge-red bg-edge-red/10 text-white"
                      : "border-white/10 bg-edge-surface text-white/80"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              onClick={next}
              disabled={!data.commitment_answer}
              className="w-full bg-edge-red text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl disabled:opacity-50 active:scale-95"
            >
              Next
            </button>
          </div>
        )}

        {current === "ready" && (
          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-edge-gold mb-6">
                <span className="font-condensed font-black text-xl text-edge-bg">E</span>
              </div>
              <h2 className="font-condensed font-black text-4xl uppercase tracking-wide mb-4 leading-tight">
                {data.commitment_answer === "yes"
                  ? "That's what I needed to hear."
                  : "Uncertainty is fine. The decision to show up isn't."}
              </h2>
              <p className="text-white/80 font-body leading-relaxed">
                Your programme is set up. Nick will review your application and approve your account personally. You'll get an email when you're in.
              </p>
            </div>
            <button
              onClick={handleComplete}
              disabled={loading}
              className="w-full bg-edge-red text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl disabled:opacity-50 active:scale-95"
            >
              {loading ? "Saving..." : "Submit Application"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
