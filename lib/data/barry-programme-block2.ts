import type { Programme } from "@/types";
import type { SessionData } from "@/types";

export const BARRY_PROGRAMME_BLOCK2: Programme = {
  id: "barry-strong90-block2",
  title: "Strong90 — Block 2",
  subtitle: "Starter Weights Programme",
  owner: "Barry",
  lengthWeeks: 4,
  summary: "Built for you, around you: the knee, the heart, the weight target, all of it. Nothing in here is generic and nothing in here is guesswork. Two sessions a week, 35 minutes door to door. Four movements, done well, getting a little heavier each week.",

  considerations: [
    "Heart condition — cardiologist clearance confirmed before starting this block",
    "Never to failure — every set ends with 3 reps left in the tank",
    "Knee: weeks 1–2 upper body only at full load, legs at bodyweight/feather-light. Week 3 onwards if knee stays green",
    "Any flutter, dizziness, or breathlessness beyond normal effort — stop, sit, message Nick",
    "Breathe out on the effort, in on the way back. Never hold breath under load",
    "2–3 minutes rest between sets — this is not cardio",
    "Knee pain above 3/10 — swap the exercise that session, never push through",
  ],

  rpeNote: "Every set ends with 3 reps in the tank. If you're grinding, the weight is too heavy. When you hit 12 clean reps on every set, go up the smallest jump available next session.",

  weeklySchedule: [
    { day: "Mon", label: "Session A", sessionKey: "session-a", type: "lift" as const },
    { day: "Tue", label: "Walk", sessionKey: null, type: "cardio" as const },
    { day: "Wed", label: "Rest", sessionKey: null, type: "rest" as const },
    { day: "Thu", label: "Session B", sessionKey: "session-b", type: "lift" as const },
    { day: "Fri", label: "Walk", sessionKey: null, type: "cardio" as const },
    { day: "Sat", label: "Walk", sessionKey: null, type: "cardio" as const },
    { day: "Sun", label: "Rest", sessionKey: null, type: "rest" as const },
  ],

  progression: [
    {
      week: 1,
      label: "Listening phase",
      sets: "3",
      rpe: "6",
      change: "Start deliberately light — weights you could do 15 reps with, doing 12. That's not soft, that's smart. You're learning the movements and your joints are getting on board. Legs at bodyweight only while we test the knee. Log every session in Edge: exercise, weight, reps.",
    },
    {
      week: 2,
      label: "Groove the movement",
      sets: "3",
      rpe: "6–7",
      change: "Same weights as Week 1 unless movements feel solid and the knee is happy. Upper body: add weight where 12 reps felt easy last week. Legs stay light — we're still in the listening phase. The habit is the win this week.",
    },
    {
      week: 3,
      label: "Load up (knee permitting)",
      sets: "3",
      rpe: "7",
      change: "If the knee has stayed green through weeks 1–2: sit-to-stand becomes box squat, leg press gets real loading. Upper body climbs wherever you hit 12 clean reps. This is where the programme kicks into gear.",
    },
    {
      week: 4,
      label: "Prove the system",
      sets: "3",
      rpe: "7–8",
      change: "Four weeks in, four exercises stronger. Look at your log from Week 1 and compare. You'll be lifting more — written down, in black and white. That's proof. End-of-block check-in with Nick: how's the knee, how's the heart, what's next.",
    },
  ],

  progressionRule: "Hit 12 clean reps on every set with 3 reps left in the tank? Go up the smallest jump the gym allows next session. Grinding before 12? Stay put. Log it either way.",

  cardio: {
    inclineWalk: {
      label: "Post-session walk",
      days: "Every session — 10 minutes immediately after lifting",
      setup: "Treadmill, car park, round the block — doesn't matter. Not optional.",
      timingTip: "Straight after lifting, your muscles are primed to soak up sugar from your blood. That walk is doing double duty — this is where a chunk of the weight-loss work quietly happens.",
      byWeek: [
        { week: 1, duration: "10 min easy" },
        { week: 2, duration: "10 min easy" },
        { week: 3, duration: "10 min easy" },
        { week: 4, duration: "10 min easy" },
      ],
    },
    assaultBike: {
      label: "Evening walks (non-session days)",
      days: "Tue, Fri, Sat — keep the walking habit from Block 1",
      rule: "30 minutes easy. The lifting is your new stimulus — don't add extra cardio on top of it. Walking stays, intense cardio doesn't.",
      byWeek: [
        { week: 1, format: "30 min easy walk" },
        { week: 2, format: "30 min easy walk" },
        { week: 3, format: "30 min easy walk" },
        { week: 4, format: "30 min easy walk" },
      ],
    },
  },

  nutrition: {
    headline: "Dinner before the gym. Protein first. Walk after. That's the three-step formula for every training day.",
    targets: [
      "Protein 200g minimum per day — unchanged from Block 1",
      "Eat dinner before training — you're fuelled for the session and the food goes to your muscles",
      "Post-session walk — 10 minutes minimum, every session",
    ],
    tactics: [
      "Dinner, lift, walk — that's the rhythm for every session day",
      "The post-dinner training slot means every gym session sends food to your muscles instead of your waistline",
      "No caffeine after mid-afternoon on training days",
      "Give yourself an hour between the post-session walk and bed — sleep is where the repair happens",
      "Log every session in Edge: exercise, weight, reps. Thirty seconds of typing. That log is your confidence.",
    ],
    proteinTarget: 200,
    calorieTarget: 2200,
    medicalLabel: "Heart condition — cardiologist clearance confirmed",
    medicalNote: "All guidance assumes medical clearance for light resistance work. If anything changes — cardioversion date, new meds, anything — tell Nick and we adjust. That's not red tape, that's how we do this properly.",
    recipes: [],
  },

  checkIn: {
    frequency: "After every session — 2 minutes in Edge",
    fields: [
      "Session done — A or B",
      "Each exercise: weight used + reps completed",
      "Knee comfort during session 0–10",
      "Any flutter, dizziness, or breathlessness Y/N",
      "Post-session walk done Y/N",
      "Morning weight (post-toilet, before food)",
      "Energy on waking 1–5",
      "One line — how did the session go",
    ],
    photoNote: "Front / side / back at start of Block 2 and end of Week 4. Same light, same time of day. Compare with Block 1 photos.",
  },
};

export const BARRY_BLOCK2_SESSIONS: Record<string, SessionData> = {
  "session-a": {
    type: "session-a",
    name: "Session A",
    warmup: [
      "5 minutes easy walking",
      "10 slow sit-to-stands from a chair or bench — controlled, no rush",
    ],
    exercises: [
      {
        name: "Sit-to-Stand (high bench or chair)",
        sets: 3,
        reps: "10–12",
        weight: "Weeks 1–2: bodyweight only. Week 3+: add load if knee is comfortable",
        notes: "Sit back under control, pause at the bottom, stand tall. Arms out front for balance. This is us testing the knee, not training it. If it stays comfortable through week 2, the box squat comes in from week 3.",
        rest: "2–3 minutes",
      },
      {
        name: "Seated Chest Press (machine)",
        sets: 3,
        reps: "10–12",
        notes: "Smooth out, smooth back. Breathe out on the push, in on the return. Never hold your breath.",
        rest: "2–3 minutes",
      },
      {
        name: "Seated Row (machine)",
        sets: 3,
        reps: "10–12",
        notes: "Chest up, pull to your ribs, squeeze at the end. Control it back — don't let it yank you forward.",
        rest: "2–3 minutes",
      },
      {
        name: "Glute Bridge (shoulders on a bench, feet flat)",
        sets: 3,
        reps: "10–12",
        notes: "Drive through the heels, hips up, squeeze at the top. This builds the muscle that protects your knee and your back. Bodyweight to start — add a plate on your hips when 12 reps feels easy.",
        rest: "2–3 minutes",
      },
    ],
    finisher: "Optional: Farmer's Carry — pick up a pair of dumbbells and walk 20 metres, rest, repeat 3 times. Only if you're feeling good. Real-world strength.",
    coachNote: "Every session ends with a 10-minute easy walk — not optional. Straight after lifting your muscles are primed to soak up sugar. Dinner, lift, walk. That's the rhythm.",
  },
  "session-b": {
    type: "session-b",
    name: "Session B",
    warmup: [
      "5 minutes easy walking",
      "10 slow sit-to-stands from a chair or bench — same as Session A",
    ],
    exercises: [
      {
        name: "Leg Press (machine)",
        sets: 3,
        reps: "10–12",
        weight: "Weeks 1–2: lightest setting — learning the movement. Week 3+: real loading if knee is happy",
        notes: "Feet high on the plate — this spares the knee. Only as deep as stays comfortable. Control the descent. Real loading starts week 3 if the knee's stayed green.",
        rest: "2–3 minutes",
      },
      {
        name: "Seated Shoulder Press (machine or dumbbells)",
        sets: 3,
        reps: "10–12",
        notes: "Back supported. Press smooth — no slamming at the top. Breathe out on the press.",
        rest: "2–3 minutes",
      },
      {
        name: "Lat Pulldown",
        sets: 3,
        reps: "10–12",
        notes: "Pull to the top of your chest, control it back up. Lean back slightly. Don't swing.",
        rest: "2–3 minutes",
      },
      {
        name: "Dumbbell Romanian Deadlift",
        sets: 3,
        reps: "10–12",
        weight: "Start light — we'll groove this one together first",
        notes: "Soft knees, push the hips back, feel the hamstrings load, stand tall. This is the best knee-friendly leg exercise there is. Nick will walk you through it first session before you do it alone.",
        rest: "2–3 minutes",
      },
    ],
    finisher: "Optional: Farmer's Carry — pick up a pair of dumbbells and walk 20 metres, rest, repeat 3 times. Only if you're feeling good.",
    coachNote: "10-minute easy walk straight after — same as Session A. Non-negotiable. Then wind down: no caffeine, give yourself an hour before bed. Sleep is where the repair happens.",
  },
};
