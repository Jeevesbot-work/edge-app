export const PROGRAMME = {
  id: "b2s-block1-reentry",
  title: "4-Week Re-Entry Block",
  subtitle: "Strength & Definition",
  owner: "Lee",
  lengthWeeks: 4,
  summary: "On-ramp block: rebuild the training habit, lay down muscle, sharpen up. Easy start, finish strong.",

  considerations: [
    "Diabetic (type TBC)",
    "ADHD meds suppress daytime appetite — nutrition is the lever",
  ],

  rpeNote:
    "RPE = how hard a set felt /10. RPE 6 = ~4 reps left in the tank. RPE 8 = ~2 reps left. No grinding reps this block.",

  weeklySchedule: [
    { day: "Mon", label: "Lower A",                     sessionKey: "lower-a", type: "lift"   as const },
    { day: "Tue", label: "Upper A",                     sessionKey: "upper-a", type: "lift"   as const },
    { day: "Wed", label: "Incline walk + core",          sessionKey: null,      type: "cardio" as const },
    { day: "Thu", label: "Lower B",                     sessionKey: "lower-b", type: "lift"   as const },
    { day: "Fri", label: "Upper B + assault bike",       sessionKey: "upper-b", type: "lift"   as const },
    { day: "Sat", label: "Walk or assault bike (pick)",  sessionKey: null,      type: "cardio" as const },
    { day: "Sun", label: "Off",                          sessionKey: null,      type: "rest"   as const },
  ],

  progression: [
    { week: 1, label: "Groove",  sets: "2",   rpe: "6",   change: "Learn the moves. Weights should feel too light. Leave every set fresh." },
    { week: 2, label: "Build",   sets: "3",   rpe: "7",   change: "Add the 3rd set. Nudge weights up where week 1 felt easy." },
    { week: 3, label: "Push",    sets: "3",   rpe: "7–8", change: "Hardest week. Add load or 1–2 reps on main lifts." },
    { week: 4, label: "Sharpen", sets: "2–3", rpe: "7",   change: "Pull volume back slightly, keep the weight. Finish strong." },
  ],

  progressionRule:
    "Hit the top of the rep range on every set with a rep or two left in the tank? Go up next session (smallest jump available). Form breaks down before you hit reps? Stay put.",

  cardio: {
    inclineWalk: {
      label: "Incline Walk",
      days: "Wed + Sat (2–3× per week)",
      setup: "10–15% incline · 4–5 km/h · conversational but working",
      byWeek: [
        { week: 1, duration: "20 min" },
        { week: 2, duration: "22 min" },
        { week: 3, duration: "25 min" },
        { week: 4, duration: "25–30 min" },
      ],
      timingTip:
        "A 15–20 min walk after your biggest meal blunts the glucose spike. Your CGM will show it — use that feedback.",
    },
    assaultBike: {
      label: "Assault Bike",
      days: "Fri (after lifting) or Sat",
      rule: "Never before a Lower day — save the legs.",
      byWeek: [
        { week: 1, format: "6 rounds — 15s hard / 45s easy" },
        { week: 2, format: "8 rounds — 15s hard / 45s easy" },
        { week: 3, format: "8 rounds — 20s hard / 40s easy" },
        { week: 4, format: "10 rounds — 20s hard / 40s easy" },
      ],
    },
  },

  nutrition: {
    headline:
      "Nutrition is the lever. ADHD meds suppress daytime appetite — the risk is under-eating protein and total calories without realising it.",
    targets: [
      "Protein ~170g/day (floor: 150g)",
      "Don't under-eat total food — suppressed appetite isn't low need",
      "Eat early and on a schedule",
    ],
    tactics: [
      "Front-load a big protein breakfast before or with the meds",
      "Drink calories midday when food is unappealing: whey + milk + oats + nut butter + banana",
      "Set eating alarms — don't rely on hunger signals",
      "Bigger solid meal in the evening, not right before bed",
    ],
    diabetesNote:
      "General guidance only — clear any changes to training, fuelling, or supplementation with your GP or diabetes team. Pair carbs with protein, fat, and fibre. Use your CGM as a coaching tool, not a stress trigger.",
  },

  checkIn: {
    frequency: "Weekly — Sunday, 5 minutes",
    fields: [
      "Bodyweight",
      "Lifting sessions completed (of 4)",
      "Cardio sessions done",
      "Protein hit this week? Y/N",
      "Energy 1–10",
      "Sleep 1–10",
      "Glucose patterns noticed",
      "Win of the week",
    ],
    photoNote:
      "Front / side / back on Day 1 and at the end of Week 4. Same light, same time of day.",
  },
} as const;

export type ProgrammeWeek = (typeof PROGRAMME.progression)[number];

export function getProgrammeWeek(currentWeek: number): ProgrammeWeek {
  const idx = Math.max(0, Math.min(currentWeek - 1, PROGRAMME.lengthWeeks - 1));
  return PROGRAMME.progression[idx];
}

// Week 1 = 2 sets. Weeks 2–4 = 3 sets.
export function getEffectiveSets(currentWeek: number): number {
  return currentWeek <= 1 ? 2 : 3;
}

export const BLOCK_SESSION_KEYS = new Set(["lower-a", "upper-a", "lower-b", "upper-b"]);
