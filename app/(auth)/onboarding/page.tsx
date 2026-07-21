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
    body_weight_kg: "",
    protein_target: 0,
    calorie_target: 0,
  });

  const steps = [
    "intro",
    "name",
    "goal",
    "state",
    "injuries",
    "nutrition",
    "availability",
    "commitment",
    "ready",
  ];

  // Auto-calculate targets when weight changes — calorie multiplier adjusts to goal
  function setWeight(kg: string) {
    const w = parseFloat(kg);
    if (!isNaN(w) && w > 0) {
      const calorieMultiplier = data.goal === "fat" ? 28 : data.goal === "stronger" ? 36 : 33;
      setData((d) => ({
        ...d,
        body_weight_kg: kg,
        protein_target: Math.round(w * 2),
        calorie_target: Math.round(w * calorieMultiplier),
      }));
    } else {
      setData((d) => ({ ...d, body_weight_kg: kg, protein_target: 0, calorie_target: 0 }));
    }
  }

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

    await supabase.from("programme_state").upsert({
      user_id: user.id,
      current_day: 1,
      current_week: 1,
    }, { onConflict: "user_id" });

    router.push("/home");
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
            className="h-full bg-edge-bronze transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col px-6 py-10">
        {current === "intro" && (
          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-edge-bronze mb-6">
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
              className="w-full bg-edge-bronze text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl active:scale-95 transition-transform"
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
              className="w-full bg-edge-surface border border-white/10 rounded-xl px-4 py-4 text-white text-lg font-body placeholder:text-edge-muted focus:outline-none focus:border-edge-bronze mb-4"
            />
            <input
              type="number"
              value={data.age}
              onChange={(e) => setData({ ...data, age: e.target.value })}
              placeholder="Your age"
              min={30}
              max={80}
              className="w-full bg-edge-surface border border-white/10 rounded-xl px-4 py-4 text-white text-lg font-body placeholder:text-edge-muted focus:outline-none focus:border-edge-bronze mb-8"
            />
            <button
              onClick={next}
              disabled={!data.full_name}
              className="w-full bg-edge-bronze text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl disabled:opacity-50 active:scale-95 transition-transform"
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
                      ? "border-edge-bronze bg-edge-bronze/10 text-white"
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
              className="w-full bg-edge-bronze text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl disabled:opacity-50 mt-6 active:scale-95"
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
                      ? "border-edge-bronze bg-edge-bronze/10 text-white"
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
              className="w-full bg-edge-bronze text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl disabled:opacity-50 mt-6 active:scale-95"
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
              className="w-full bg-edge-surface border border-white/10 rounded-xl px-4 py-4 text-white font-body placeholder:text-edge-muted focus:outline-none focus:border-edge-bronze resize-none mb-8"
            />
            <button
              onClick={next}
              className="w-full bg-edge-bronze text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl active:scale-95"
            >
              {data.injuries ? "Next" : "No injuries, next"}
            </button>
          </div>
        )}

        {current === "nutrition" && (
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="font-condensed font-bold text-3xl uppercase tracking-wide mb-2">
              What&apos;s your current body weight?
            </h2>
            <p className="text-edge-muted text-sm mb-2">
              We use this to calculate your protein and calorie targets.
            </p>
            <p className="text-white/50 text-xs font-body mb-8 leading-relaxed">
              At 40+ protein is non-negotiable — muscle doesn&apos;t hold itself. 2g per kg keeps you building, not breaking down.
            </p>
            <div className="flex items-center gap-3 mb-6">
              <input
                type="number"
                value={data.body_weight_kg}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 85"
                min={50}
                max={200}
                className="flex-1 bg-edge-surface border border-white/10 rounded-xl px-4 py-4 text-white text-2xl font-condensed placeholder:text-edge-muted focus:outline-none focus:border-edge-bronze"
              />
              <span className="text-white/40 text-lg font-body">kg</span>
            </div>
            {data.protein_target > 0 && (
              <div className="bg-edge-surface rounded-xl border border-edge-bronze/20 p-5 mb-8">
                <p className="text-edge-bronze text-xs uppercase tracking-widest font-condensed font-bold mb-4">Your targets</p>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-white/50 text-xs font-body uppercase tracking-widest mb-1">Protein</p>
                    <p style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 32, color: "#F2F1ED", fontWeight: 400, lineHeight: 1 }}>
                      {data.protein_target}<span style={{ fontSize: 16, color: "#9BA3AF", marginLeft: 4 }}>g/day</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/50 text-xs font-body uppercase tracking-widest mb-1">
                      {data.goal === "fat" ? "Deficit" : data.goal === "stronger" ? "Surplus" : "Maintenance"}
                    </p>
                    <p style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 32, color: "#F2F1ED", fontWeight: 400, lineHeight: 1 }}>
                      {data.calorie_target}<span style={{ fontSize: 16, color: "#9BA3AF", marginLeft: 4 }}>kcal</span>
                    </p>
                  </div>
                </div>
                <p className="text-edge-muted text-xs font-body pt-3 border-t border-white/10">
                  Based on {data.body_weight_kg}kg.{data.goal === "fat" ? " Calorie target is set slightly below maintenance for fat loss." : data.goal === "stronger" ? " Calorie target includes a small surplus for muscle building." : ""} Adjust anytime in your profile.
                </p>
              </div>
            )}
            <button
              onClick={next}
              disabled={!data.body_weight_kg}
              className="w-full bg-edge-bronze text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl disabled:opacity-50 active:scale-95"
            >
              {data.body_weight_kg ? "Set my targets" : "Enter your weight"}
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
                      ? "border-edge-bronze bg-edge-bronze/10 text-white"
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
              className="w-full bg-edge-bronze text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl active:scale-95"
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
                      ? "border-edge-bronze bg-edge-bronze/10 text-white"
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
              className="w-full bg-edge-bronze text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl disabled:opacity-50 active:scale-95"
            >
              Next
            </button>
          </div>
        )}

        {current === "ready" && (
          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-edge-bronze mb-6">
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
              className="w-full bg-edge-bronze text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl disabled:opacity-50 active:scale-95"
            >
              {loading ? "Saving..." : "Submit Application"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
