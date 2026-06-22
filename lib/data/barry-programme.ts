import type { Programme } from "@/types";

export const BARRY_PROGRAMME: Programme = {
  id: "barry-strong90-block1",
  title: "Strong90 — Block 1",
  subtitle: "Audit & Foundations",
  owner: "Barry",
  lengthWeeks: 2,
  summary: "Walk into your next cardiology appointment lighter, stronger and with proof that you've done everything in your control. Weeks 1–2 are fasted treadmill every morning and a post-dinner walk every evening. Simple. Consistent. Non-negotiable.",

  considerations: [
    "Heart condition — medical clearance required before any strength work",
    "Strength training unlocked by Nick after Week 2 check-in",
  ],

  rpeNote: "Pace rule: if you can't finish a sentence while walking, you're going too fast. Non-negotiable.",

  weeklySchedule: [
    { day: "Mon", label: "Fasted treadmill", sessionKey: null, type: "cardio" as const },
    { day: "Tue", label: "Fasted treadmill", sessionKey: null, type: "cardio" as const },
    { day: "Wed", label: "Fasted treadmill", sessionKey: null, type: "cardio" as const },
    { day: "Thu", label: "Fasted treadmill", sessionKey: null, type: "cardio" as const },
    { day: "Fri", label: "Fasted treadmill", sessionKey: null, type: "cardio" as const },
    { day: "Sat", label: "Fasted treadmill", sessionKey: null, type: "cardio" as const },
    { day: "Sun", label: "Rest", sessionKey: null, type: "rest" as const },
  ],

  progression: [
    {
      week: 1,
      label: "Build the habit",
      sets: "—",
      rpe: "—",
      change: "30 minutes fasted treadmill every morning Mon–Sat. Post-dinner walk every evening. Bed by 10:30pm. Max 4 pints this week. Just show up — that's the win.",
    },
    {
      week: 2,
      label: "Add 15 minutes",
      sets: "—",
      rpe: "—",
      change: "45 minutes fasted treadmill every morning Mon–Sat. Post-dinner walk every evening. Bed by 10pm from now on, no screens after 9:30pm. Max 3 pints this week.",
    },
  ],

  progressionRule: "If you can finish a sentence while walking, the pace is right. That's your only rule for these two weeks.",

  cardio: {
    inclineWalk: {
      label: "Fasted Treadmill Walk",
      days: "Mon–Sat · every morning",
      setup: "5:30am start · nothing to eat beforehand · conversational pace",
      timingTip: "Drive straight to the gym. Breakfast from your bag on the way home at 6am.",
      byWeek: [
        { week: 1, duration: "30 min" },
        { week: 2, duration: "45 min" },
      ],
    },
    assaultBike: {
      label: "Post-Dinner Walk",
      days: "Every evening — 7 days a week",
      rule: "30 min every night Mon–Sat. 20 min easy on Sunday. This is your wind-down signal — walk, home, shower, bed.",
      byWeek: [
        { week: 1, format: "30 min every evening" },
        { week: 2, format: "30 min every evening" },
      ],
    },
  },

  nutrition: {
    headline: "Protein at the centre of every meal. 200g minimum per day. Hit protein first — everything else follows.",
    targets: [
      "Protein 200g minimum per day",
      "Steps 10,000+ across both sessions",
      "Alcohol: max 4 pints Week 1 · max 3 pints Week 2",
    ],
    tactics: [
      "Prep breakfast the night before — grab from the fridge on the way out",
      "Cook double at dinner every night — pack lunch before bed",
      "Post-dinner walk every evening — your wind-down signal",
      "Bed by 10:30pm Week 1, 10pm from Week 2 onwards",
    ],
    proteinTarget: 200,
    calorieTarget: 2200,
    medicalLabel: "Heart condition — guidance only",
    medicalNote: "All training and nutrition guidance is general. Clear any changes with your cardiology team. Strength training will only be added after medical clearance — Nick will unlock it.",
    recipes: [],
  },

  checkIn: {
    frequency: "Daily — 2 minutes each morning",
    fields: [
      "Morning walk — done Y/N + minutes",
      "Evening walk — done Y/N",
      "Morning weight (post-toilet, before food)",
      "In bed by 10pm last night Y/N",
      "Sleep quality 1–5",
      "Alcohol units today",
      "Energy on waking 1–5",
      "One line — how did today go?",
    ],
    photoNote: "Front / side / back on Day 1 and end of Week 2. Same light, same time of day.",
  },
};
