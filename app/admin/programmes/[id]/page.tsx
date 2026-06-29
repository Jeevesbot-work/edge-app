"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// Lee Thomas — Weeks 1 & 2 starter template.
// When new clients come in, swap the content here to match their programme.
// The shape never changes — only the data inside it does.
const LEE_THOMAS_TEMPLATE = {
  programme: {
    id: "lee-strong90-w1-2",
    title: "Strong90 — Weeks 1 & 2",
    subtitle: "Foundation · Recomp",
    owner: "Lee",
    lengthWeeks: 2,
    summary:
      "Pre-audit foundation block. Recomp goal — build muscle, hold fat steady, let composition shift. Three full-body sessions per week. Every session built around T1 diabetes CGM protocol and ADHD med timing.",
    considerations: [
      "T1 diabetes (CGM) — glucose protocol runs every session without exception",
      "ADHD stimulant medication — kills daytime appetite, rebounds in evening. Protein front-loaded at breakfast.",
      "Goal: lean recomp → visible abs by 50th birthday (Sept 2026)",
      "Body comp: ~89kg, estimated 12–13% BF (file says 18% — photo and maths say leaner)",
      "Pre-audit: back/joint history not yet confirmed — all lifts spine-neutral, regressions available",
    ],
    rpeNote:
      "RPE 7 = 3 good reps left in the tank. RPE 8 = 2 reps left. We live at RPE 7–8. Never grinding to failure.",
    weeklySchedule: [
      { day: "Mon", label: "Day A — Push", sessionKey: "day-a", type: "lift" },
      { day: "Tue", label: "Rest", sessionKey: null, type: "rest" },
      { day: "Wed", label: "Day B — Pull", sessionKey: "day-b", type: "lift" },
      { day: "Thu", label: "Rest", sessionKey: null, type: "rest" },
      { day: "Fri", label: "Day C — Legs", sessionKey: "day-c", type: "lift" },
      { day: "Sat", label: "Walk / light", sessionKey: null, type: "cardio" },
      { day: "Sun", label: "Off", sessionKey: null, type: "rest" },
    ],
    progression: [
      {
        week: 1,
        label: "Foundation",
        sets: "2–3",
        rpe: "7",
        change:
          "Learn the lifts, establish the pattern. Weights should feel controlled — leave every set with reps in the tank. Check CGM as part of warm-up every session.",
      },
      {
        week: 2,
        label: "Progressive",
        sets: "3",
        rpe: "7–8",
        change:
          "Same sessions. Add load where you hit the full rep range on all sets at RPE ≤ 7. Small jumps only. Day C: add plank 3×30sec at the end. Split squats: drop the support if balance was solid in Week 1.",
      },
    ],
    progressionRule:
      "Hit the top of the rep range on all sets and it felt RPE 7 or easier? Add a small amount of load next session. Session felt genuinely hard at the same weight? Stay there. Don't add load because it's a new week — add it because you earned it.",
    cardio: {
      inclineWalk: {
        label: "Light Walk",
        days: "Saturday — optional",
        setup: "Easy pace, 20–30 min. Not a workout — active recovery.",
        byWeek: [
          { week: 1, duration: "20 min" },
          { week: 2, duration: "20–30 min" },
        ],
        timingTip:
          "A 15–20 min walk after your biggest meal blunts the glucose spike. Your CGM will show it — use that feedback.",
      },
      assaultBike: {
        label: "N/A — Weeks 1 & 2",
        days: "Not programmed this block",
        byWeek: [],
      },
    },
    nutrition: {
      headline:
        "190g protein per day. 2,400 kcal. Carbs timed around training. Built around your ADHD med window — front-load protein before the med peaks, main meal in the evening appetite rebound.",
      targets: [
        "Protein: 190g / day (non-negotiable for recomp at 49)",
        "Carbs: 250g / day — timed to training sessions",
        "Fat: 70g / day",
        "Calories: ~2,400 kcal (mild 300 kcal deficit)",
      ],
      tactics: [
        "Meal 1 (before or immediately after waking — BEFORE med peaks): 4 eggs + 200g Greek yoghurt + berries → ~50g P",
        "Meal 2 (med peaking — keep easy): Whey shake + banana → ~38g P. Just the shake if appetite gone.",
        "Meal 3 (post-training / lunch): 180g chicken or salmon + 150g rice + veg → ~52g P",
        "Meal 4 (evening — appetite back): 200g steak / salmon / chicken + 200g sweet potato + veg → ~50g P",
        "Meal 5 (top-up if needed): 200g cottage cheese or yoghurt + nuts → ~22g P",
      ],
      proteinTarget: 190,
      calorieTarget: 2400,
      medicalLabel: "T1 Diabetes — guidance only",
      medicalNote:
        "All carb timing and insulin decisions remain with Lee's diabetes team. These are nutritional guidelines only. Nothing in this plan overrides medical advice.",
      recipes: [
        {
          emoji: "🍳",
          tag: "Breakfast",
          name: "Protein Scramble",
          kcal: 520,
          p: 48,
          time: 8,
          desc: "4 whole eggs scrambled with 200g Greek yoghurt and a handful of berries on the side.",
          steps: [
            "Scramble 4 eggs in a non-stick pan with a little butter",
            "Serve alongside 200g full-fat Greek yoghurt",
            "Add a large handful of blueberries or strawberries",
            "Black coffee on the side",
          ],
        },
        {
          emoji: "🥩",
          tag: "Dinner",
          name: "Steak & Sweet Potato",
          kcal: 680,
          p: 52,
          time: 20,
          desc: "Sirloin or rump steak with 200g sweet potato and a big side of veg or salad.",
          steps: [
            "Season steak with salt, pepper, and garlic",
            "Cook in a hot pan to your liking — 3 min each side for medium",
            "Microwave or roast 200g sweet potato",
            "Serve with roasted veg or a big mixed salad",
          ],
        },
        {
          emoji: "🍗",
          tag: "Lunch",
          name: "Chicken & Rice Bowl",
          kcal: 560,
          p: 54,
          time: 15,
          desc: "180g chicken breast with 150g cooked rice, big pile of veg, and olive oil.",
          steps: [
            "Season and pan-fry or bake chicken breast",
            "Cook 150g basmati or jasmine rice",
            "Steam or roast broccoli, peppers, or whatever veg is easy",
            "Drizzle with olive oil and a squeeze of lemon",
          ],
        },
        {
          emoji: "🥛",
          tag: "Snack",
          name: "Evening Protein Top-Up",
          kcal: 220,
          p: 24,
          time: 2,
          desc: "200g cottage cheese or Greek yoghurt with a small handful of mixed nuts.",
          steps: [
            "Scoop 200g cottage cheese or full-fat Greek yoghurt into a bowl",
            "Add a small handful of mixed nuts or a teaspoon of peanut butter",
            "Eat when appetite is back in the evening — catches the remaining protein target",
          ],
        },
      ],
    },
    checkIn: {
      frequency: "Weekly — Sunday, 5 minutes",
      fields: [
        "Bodyweight (kg)",
        "Lifting sessions completed (of 3)",
        "Protein target hit this week? Y/N",
        "Energy 1–10",
        "Sleep 1–10",
        "Glucose patterns noticed (any unusual lows around sessions?)",
        "Win of the week",
      ],
      photoNote:
        "Front / side / back on Day 1 and end of Week 2 for baseline. Same light, same time of day, same underwear.",
    },
  },
  sessions: {
    "day-a": {
      type: "day-a",
      name: "Day A — Monday (Push)",
      warmup: [
        "5 min easy cardio — walk, bike, or row",
        "2 light ramp-up sets of goblet squat",
        "CHECK CGM before starting — non-negotiable",
      ],
      exercises: [
        {
          name: "Goblet squat",
          sets: 3,
          reps: "10",
          rest: "90s",
          notes: "Find a weight that feels controlled. Reset between reps if needed.",
          weight: "Start conservative — we're learning the pattern",
          yt: "https://youtu.be/MxsFDJCitmE",
        },
        {
          name: "DB bench press / floor press",
          sets: 3,
          reps: "10",
          rest: "90s",
          notes: "Floor press if shoulders are at all unhappy — shorter range, shoulder-friendly.",
          yt: "https://youtu.be/VmB1G1K7v94",
        },
        {
          name: "Half-kneeling DB shoulder press",
          sets: 3,
          reps: "12",
          rest: "75s",
          notes: "One knee down, core braced throughout.",
          yt: "https://youtu.be/dH9CKx3lBso",
        },
        {
          name: "Incline DB press",
          sets: 2,
          reps: "12",
          rest: "60s",
          notes: "Optional — drop if time is short. This is the add-on.",
          yt: "https://youtu.be/8iPEnn-ltC8",
        },
        {
          name: "Dead bug",
          sets: 3,
          reps: "8/side",
          rest: "45s",
          notes: "Lower back stays flat on the floor. Slow and deliberate. Not a speed exercise.",
          yt: "https://youtu.be/4XLEnwUr1d8",
        },
      ],
      coachNote:
        "Push day. We're building the habit and finding the weights this week — don't go heavy. Leave every set feeling like you could do two more.",
    },
    "day-b": {
      type: "day-b",
      name: "Day B — Wednesday (Pull)",
      warmup: [
        "5 min easy cardio",
        "2 light ramp-up sets of RDL with minimal load",
        "CHECK CGM before starting",
      ],
      exercises: [
        {
          name: "DB Romanian deadlift",
          sets: 3,
          reps: "10",
          rest: "90s",
          notes: "Hinge from the hips, spine neutral throughout. If your back talks at any point — shorten the range and flag it.",
          weight: "Start light — feel the hamstring load before adding weight",
          yt: "https://youtu.be/JCXUYuzwNrM",
        },
        {
          name: "1-arm DB row",
          sets: 3,
          reps: "10/side",
          rest: "90s",
          notes: "Chest supported on incline bench. Row to your hip, not your shoulder. Pause at the top.",
          yt: "https://youtu.be/roCP6wCXPqo",
        },
        {
          name: "Lat pulldown / assisted pull-up",
          sets: 3,
          reps: "10",
          rest: "90s",
          notes: "Full stretch at the top, pull to your collarbone. Band-assisted or machine assist both fine.",
          yt: "https://youtu.be/SAiVuTPvyli",
        },
        {
          name: "Face pull / band pull-apart",
          sets: 3,
          reps: "15",
          rest: "45s",
          notes: "Light. Feel the rear delts and upper back. Shoulder health — don't skip it.",
          yt: "https://youtu.be/rep-qVOkqgk",
        },
        {
          name: "DB hammer curl",
          sets: 2,
          reps: "12",
          rest: "45s",
          notes: "Controlled on the way down — that's where the work is.",
          yt: "https://youtu.be/zC3nLlEvin4",
        },
      ],
      coachNote:
        "Pull day. The RDL is the most important lift in here for your long-term back health. Treat it with respect — spine neutral, feel the load, no rounding.",
    },
    "day-c": {
      type: "day-c",
      name: "Day C — Friday (Legs + Full Body)",
      warmup: [
        "5 min easy cardio",
        "2 light ramp-up sets of goblet squat",
        "CHECK CGM before starting",
      ],
      exercises: [
        {
          name: "Goblet squat",
          sets: 3,
          reps: "10",
          rest: "90s",
          notes: "Same weight as Monday or a touch more if Monday felt easy at RPE 7 or under.",
          yt: "https://youtu.be/MxsFDJCitmE",
        },
        {
          name: "DB hip thrust / glute bridge",
          sets: 3,
          reps: "12",
          rest: "90s",
          notes: "Drive through heels. Squeeze hard at the top. Glute bridge on the floor if hip thrust setup is tricky.",
          yt: "https://youtu.be/xDmFkJxPzeM",
        },
        {
          name: "Split squat — rear foot down",
          sets: 2,
          reps: "10/leg",
          rest: "90s",
          notes: "Hold a support for balance if needed — completely fine. Once balance is solid, go freestanding (Week 2).",
          yt: "https://youtu.be/2C-uNgKwPLE",
        },
        {
          name: "DB chest press / push-up",
          sets: 2,
          reps: "10",
          rest: "60s",
          notes: "Either works. Push-up hands elevated on bench if full push-up isn't clean yet.",
          yt: "https://youtu.be/VmB1G1K7v94",
        },
        {
          name: "Farmer's carry",
          sets: 3,
          reps: "20m",
          rest: "60s",
          notes: "Heavy. Walk tall — don't let the weight pull you sideways. This is grip, core, and back in one.",
          yt: "https://youtu.be/rt17lmnaLSM",
        },
      ],
      coachNote:
        "Full body finisher session. The farmer's carry at the end is deceptively effective — grip, core, posture all in one. Go heavy on it.",
    },
  },
};

export default function ProgrammePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params.id;

  const [json, setJson] = useState(JSON.stringify(LEE_THOMAS_TEMPLATE, null, 2));
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [hasExisting, setHasExisting] = useState<boolean | null>(null);
  const [clientName, setClientName] = useState("");

  // Check if a programme is already loaded for this client
  useEffect(() => {
    fetch(`/api/admin/programme-status?userId=${userId}`)
      .then((r) => r.json())
      .then((d) => {
        setHasExisting(d.hasProgramme);
        setClientName(d.name ?? "");
        if (d.current) {
          setJson(JSON.stringify(d.current, null, 2));
        }
      })
      .catch(() => setHasExisting(false));
  }, [userId]);

  async function handleLoad() {
    setLoading(true);
    setStatus("idle");
    setErrorMsg("");

    let parsed: { programme: unknown; sessions: unknown };
    try {
      parsed = JSON.parse(json);
    } catch {
      setErrorMsg("Invalid JSON — check the editor for syntax errors.");
      setStatus("error");
      setLoading(false);
      return;
    }

    if (!parsed.programme || !parsed.sessions) {
      setErrorMsg("JSON must have both a 'programme' and a 'sessions' key at the top level.");
      setStatus("error");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/admin/load-programme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, programme: parsed.programme, sessions: parsed.sessions }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErrorMsg(data.error ?? "Something went wrong");
      setStatus("error");
    } else {
      setStatus("ok");
      setHasExisting(true);
    }
  }

  return (
    <div className="min-h-screen bg-edge-bg max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push(`/admin/users/${userId}`)}
          className="w-9 h-9 rounded-xl bg-edge-surface border border-white/10 flex items-center justify-center flex-shrink-0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="font-condensed font-black text-2xl uppercase tracking-wide">
            Load Programme
          </h1>
          <p className="text-edge-muted text-xs">
            {clientName ? `For ${clientName}` : `Client ID: ${userId}`}
          </p>
        </div>
      </div>

      {/* Status banner */}
      {hasExisting === true && status !== "ok" && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4 flex items-start gap-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth={2} className="w-5 h-5 flex-shrink-0 mt-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <div>
            <p className="text-amber-400 font-condensed font-bold text-sm uppercase tracking-wide">Programme already loaded</p>
            <p className="text-amber-300/70 text-xs mt-1">Submitting will overwrite the existing programme. The JSON below shows the current version.</p>
          </div>
        </div>
      )}

      {status === "ok" && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4 flex items-center gap-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth={2.5} className="w-5 h-5 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-green-400 font-condensed font-bold text-sm uppercase tracking-wide">
            Programme loaded successfully. {clientName ? `${clientName} can` : "Client can"} now see their sessions in the app.
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
          <p className="text-red-400 font-condensed font-bold text-sm uppercase tracking-wide mb-1">Error</p>
          <p className="text-red-300/80 text-xs">{errorMsg}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-edge-surface rounded-xl border border-white/[0.08] p-4 mb-4">
        <p className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-bronze mb-2">How this works</p>
        <ul className="space-y-1.5 text-edge-muted text-xs font-body">
          <li>— The JSON below is pre-loaded with Lee's Weeks 1 & 2 programme</li>
          <li>— For new clients: replace the content inside <span className="text-white/60">&quot;programme&quot;</span> and <span className="text-white/60">&quot;sessions&quot;</span> to match their plan</li>
          <li>— The outer shape (<span className="text-white/60">programme</span> + <span className="text-white/60">sessions</span> keys) never changes — only the data inside</li>
          <li>— Submitting upserts to Supabase — zero risk of crossing into another client&apos;s data</li>
        </ul>
      </div>

      {/* JSON editor */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted">Programme JSON</p>
          <button
            onClick={() => setJson(JSON.stringify(LEE_THOMAS_TEMPLATE, null, 2))}
            className="text-edge-bronze text-xs font-condensed uppercase tracking-wide hover:text-white transition-colors"
          >
            Reset to Lee template
          </button>
        </div>
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          className="w-full bg-edge-bg border border-white/10 rounded-xl px-4 py-3 text-white/80 font-mono text-xs resize-y focus:outline-none focus:border-edge-bronze"
          rows={28}
          spellCheck={false}
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleLoad}
        disabled={loading}
        className="w-full bg-edge-bronze text-edge-bg font-condensed font-bold text-lg uppercase tracking-widest py-4 rounded-xl disabled:opacity-40 active:scale-95 transition-transform mb-2"
      >
        {loading
          ? "Loading..."
          : hasExisting
          ? "Update Programme"
          : "Load Programme"}
      </button>

      <p className="text-edge-muted text-xs text-center">
        Changes take effect immediately — client sees updated sessions on next app load.
      </p>
    </div>
  );
}
