import { SessionData } from "@/types";

export const SESSIONS: Record<string, SessionData> = {
  push: {
    type: "push",
    name: "Upper Body Push",
    warmup: [
      "5 min light cardio (walk, bike, or jump rope)",
      "10x arm circles each direction",
      "10x shoulder pass-throughs with band or stick",
      "10x push-up to downward dog",
      "10x chest opener stretch",
    ],
    exercises: [
      {
        name: "Bench Press (Barbell or Dumbbell)",
        sets: 4,
        reps: "8-10",
        weight: "Choose a weight where the last 2 reps are hard but form is solid",
        notes: "Full range of motion. Control the descent — 2 seconds down.",
      },
      {
        name: "Overhead Press (Dumbbell)",
        sets: 3,
        reps: "10-12",
        weight: "Moderate weight — shoulder work, not ego work",
        notes: "Neutral grip. Don't flare elbows. Core tight throughout.",
      },
      {
        name: "Incline Dumbbell Press",
        sets: 3,
        reps: "10-12",
        notes: "30-45 degree incline. Hit the upper chest. Slow negative.",
      },
      {
        name: "Lateral Raises (Dumbbell)",
        sets: 3,
        reps: "12-15",
        weight: "Lighter than you think — shoulders are easy to overload",
        notes: "Slight bend in elbow. Lead with elbows, not wrists.",
      },
      {
        name: "Tricep Dips (Bench or Parallel Bars)",
        sets: 3,
        reps: "10-12",
        notes: "Lean slightly forward for chest engagement. Don't lock out at top.",
      },
      {
        name: "Cable or Band Face Pulls",
        sets: 3,
        reps: "15",
        notes: "Essential for shoulder health. Pull to face height, elbows high.",
      },
    ],
    finisher: "30-second plank hold x 3. Rest 30 seconds between sets. Total: 3 minutes. Core is not optional.",
    coachNote: "Push sessions build the chest, shoulders, and triceps. The face pulls at the end are non-negotiable — they protect your shoulder joints. Don't skip them just because they're at the end.",
  },
  squat: {
    type: "squat",
    name: "Lower Body Squat Focus",
    warmup: [
      "5 min walk or light bike",
      "10x glute bridges",
      "10x bodyweight squats (focus on depth)",
      "10x lateral band walks each direction",
      "10x hip circles each leg",
      "5x deep squat hold (30 seconds total)",
    ],
    exercises: [
      {
        name: "Barbell Back Squat (or Goblet Squat)",
        sets: 4,
        reps: "6-8",
        weight: "Heavy but controlled — if form breaks, the weight is too heavy",
        notes: "Feet shoulder width, toes slightly out. Break at hips and knees simultaneously. Chest tall.",
      },
      {
        name: "Romanian Deadlift (RDL)",
        sets: 3,
        reps: "10",
        notes: "Hinge at hip, soft bend in knee. Feel the hamstring load. Not a squat. Not a deadlift. A hinge.",
      },
      {
        name: "Bulgarian Split Squat",
        sets: 3,
        reps: "8 each leg",
        notes: "Rear foot elevated. Front foot far enough forward that your shin stays vertical. Brutal but essential.",
      },
      {
        name: "Leg Press",
        sets: 3,
        reps: "12",
        notes: "Feet mid-platform. Full range of motion. Don't lock out knees at top.",
      },
      {
        name: "Nordic Hamstring Curl or Leg Curl",
        sets: 3,
        reps: "10",
        notes: "Hamstring health is crucial for back health. Don't skip this one.",
      },
      {
        name: "Calf Raises (Standing)",
        sets: 4,
        reps: "15",
        notes: "Full range. Pause at top. These are more important than they look.",
      },
    ],
    finisher: "Glute bridge hold: 60 seconds. 3 rounds. Squeeze hard at top. Rest 30 seconds. Great for lower back relief.",
    coachNote: "Lower body work is the most important training you'll do. More muscle mass below the waist than above. Better testosterone response. Better metabolic impact. Men avoid leg day because it's hard. Do it because it's hard.",
  },
  pull: {
    type: "pull",
    name: "Upper Body Pull",
    warmup: [
      "5 min light cardio",
      "10x band pull-aparts",
      "10x scapular push-ups",
      "10x cat-cow",
      "Dead hang from bar — 30 seconds",
    ],
    exercises: [
      {
        name: "Pull-Ups or Lat Pulldown",
        sets: 4,
        reps: "6-8 (pull-ups) or 10-12 (lat pulldown)",
        notes: "Full hang at bottom. Pull elbows to ribs. Squeeze at top. If pull-ups are too hard, use assisted machine or band.",
      },
      {
        name: "Barbell or Dumbbell Row",
        sets: 4,
        reps: "8-10",
        weight: "Heavy. Rows are where men get strong.",
        notes: "Brace core. Row to hip, not to chest. Squeeze shoulder blade at top.",
      },
      {
        name: "Seated Cable Row (Close Grip)",
        sets: 3,
        reps: "10-12",
        notes: "Sit tall. Row to sternum. Control the return — don't let it yank you forward.",
      },
      {
        name: "Single Arm Dumbbell Row",
        sets: 3,
        reps: "10 each side",
        notes: "Brace against bench. Long pull. Eliminate rotation.",
      },
      {
        name: "Reverse Fly (Bent Over)",
        sets: 3,
        reps: "15",
        weight: "Light weight — this is a finesse exercise not a strength one",
        notes: "Bent at 45 degrees. Arms out wide. Rear delt work is crucial for posture.",
      },
      {
        name: "Bicep Curl (Dumbbell)",
        sets: 3,
        reps: "12",
        notes: "Full range. Don't swing. Supinate (twist) at top for full contraction.",
      },
    ],
    finisher: "Dead hang: 3 x 30 seconds. Best thing you can do for shoulder health and decompression. Essential for men who sit at desks.",
    coachNote: "Pull sessions build your back, biceps, and rear delts — the muscles that fix posture, prevent injury, and make men look powerful. Most men overdo push and underdo pull. Equal volume in this programme for a reason.",
  },
};

export const WEEK_SCHEDULE = [
  { day: "Monday", session: "push" },
  { day: "Wednesday", session: "squat" },
  { day: "Friday", session: "pull" },
];

export function getSessionByType(type: string): SessionData | undefined {
  return SESSIONS[type];
}
