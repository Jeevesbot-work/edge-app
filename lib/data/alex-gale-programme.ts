import type { Programme } from "@/types";

export const ALEX_GALE_PROGRAMME: Programme = {
  id: "alex-gale-strong90-block1",
  title: "Strong90 — Block 1",
  subtitle: "Fuel & Foundation",
  owner: "Alex",
  lengthWeeks: 4,
  summary: "You're not weak — you're over-fuelled and under-recovered. The lever is food volume and beer, not more training. Get your protein right, walk every day, and cut the sessions to two nights a week. Four weeks of this and you'll see the shift. The rugby stays — we build around it.",

  considerations: [
    "Heart strain risk at 150–160kg — GP sign-off required before any additional conditioning work",
    "Full rugby season ongoing — programme built around it, not against it",
    "Harvest schedule: walking targets flex to workload, protein targets never flex",
    "Two young kids — keep the plan simple enough to execute on 6 hours sleep",
  ],

  rpeNote: "If rugby is your hardest session, everything else should feel easy. That's intentional.",

  weeklySchedule: [
    { day: "Mon", label: "Morning walk + protein focus", sessionKey: null, type: "cardio" as const },
    { day: "Tue", label: "Morning walk + protein focus", sessionKey: null, type: "cardio" as const },
    { day: "Wed", label: "Morning walk", sessionKey: null, type: "cardio" as const },
    { day: "Thu", label: "Morning walk + protein focus", sessionKey: null, type: "cardio" as const },
    { day: "Fri", label: "Morning walk", sessionKey: null, type: "cardio" as const },
    { day: "Sat", label: "Rugby match day", sessionKey: null, type: "cardio" as const },
    { day: "Sun", label: "Rest — long walk if legs allow", sessionKey: null, type: "rest" as const },
  ],

  progression: [
    {
      week: 1,
      label: "Audit your intake",
      sets: "—",
      rpe: "—",
      change: "This week is about seeing what's actually going in. Log food honestly — not to judge, to understand. Hit 200g protein. 8,000 steps minimum every day. Max 6 pints across the whole week. No extra training — just walk, eat right, sleep.",
    },
    {
      week: 2,
      label: "Tighten the intake",
      sets: "—",
      rpe: "—",
      change: "Protein first at every meal — eat it before anything else on the plate. 10,000 steps per day. Max 4 pints across the week. Replace two of those drinking occasions with something else — doesn't matter what. Start tracking weight every morning, post-toilet, before food.",
    },
    {
      week: 3,
      label: "Lock in the habits",
      sets: "—",
      rpe: "—",
      change: "Hero meals locked in — the same two or three meals you can make on autopilot that hit protein. 10,000 steps every day. Alcohol: match day beers only, nothing else. Sleep before midnight every night, no exceptions.",
    },
    {
      week: 4,
      label: "Stress-test it",
      sets: "—",
      rpe: "—",
      change: "Harvest is hard — stick to it anyway. That's the test. Protein hit every day. Steps hit every day. One week of zero alcohol. End-of-block check-in Friday — send Nick your weight, average steps, and one honest line on how the week went.",
    },
  ],

  progressionRule: "If protein is hit and steps are hit, the weight will move. Those are the only two numbers that matter in Block 1.",

  cardio: {
    inclineWalk: {
      label: "Daily Walk",
      days: "Every day — farm steps count",
      setup: "8,000 steps minimum Week 1 · 10,000 from Week 2 · farm work counts toward the total",
      timingTip: "Morning walk before the farm kicks off is ideal — 20 minutes, easy pace, sets the day right.",
      byWeek: [
        { week: 1, duration: "8,000 steps/day minimum" },
        { week: 2, duration: "10,000 steps/day" },
        { week: 3, duration: "10,000 steps/day" },
        { week: 4, duration: "10,000 steps/day" },
      ],
    },
    assaultBike: {
      label: "Rugby (keep it)",
      days: "Saturday match day — non-negotiable, keep playing",
      rule: "Rugby is your hardest weekly session. Do not add conditioning on top of it. The rest of the week should feel easy by comparison.",
      byWeek: [
        { week: 1, format: "80 min match — don't train harder on any other day" },
        { week: 2, format: "80 min match — don't train harder on any other day" },
        { week: 3, format: "80 min match — don't train harder on any other day" },
        { week: 4, format: "80 min match — don't train harder on any other day" },
      ],
    },
  },

  nutrition: {
    headline: "You're already strong. The only levers are food volume and alcohol. Get protein right and cut the beer — the weight moves without you doing anything else.",
    targets: [
      "Protein 200g minimum per day",
      "Steps 10,000 per day (farm work counts)",
      "Alcohol: 6 pints max Week 1 · 4 pints max Week 2 · match day only Week 3 · zero Week 4",
    ],
    tactics: [
      "Protein first — eat protein before anything else on the plate at every meal",
      "Hero meals: pick 2–3 high-protein meals you can make without thinking and rotate them",
      "Match day fuel: big protein meal 3 hours before, not a bun and crisps at the club",
      "Post-match: protein shake or chicken before the beers — not after",
      "Batch cook Sunday: prep 4 days of lunch in one go (mince, rice, veg — done)",
      "Drinking occasions: each pint is ~200 kcal of nothing. That's your deficit right there.",
    ],
    proteinTarget: 200,
    calorieTarget: 2800,
    medicalLabel: "High bodyweight — seek GP check before additional conditioning",
    medicalNote: "At 150–160kg there is strain on the cardiovascular system. All guidance here is general. Get a GP check before adding any conditioning beyond walking. Nick will review after Block 1 before programming anything harder.",
    recipes: [],
  },

  checkIn: {
    frequency: "Daily — 2 minutes each morning",
    fields: [
      "Morning weight (post-toilet, before food)",
      "Steps yesterday",
      "Protein yesterday — hit 200g? Y/N",
      "Alcohol yesterday — units",
      "Sleep quality 1–5",
      "Energy on waking 1–5",
      "One line — anything worth noting",
    ],
    photoNote: "Front / side / back on Day 1 and end of Week 4. Same light, same time of day.",
  },
};
