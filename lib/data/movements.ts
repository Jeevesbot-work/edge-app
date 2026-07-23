// Movement library — the "training drop". Nick sees an exercise, drops the
// frames in, and it becomes a coached card here, ready to slot into a
// programme. First entry built from screenshots of @dickersonross.

export type Movement = {
  slug: string;
  name: string;
  subtitle: string;
  trains: string[];        // muscle tags
  equipment: string;
  images: { src: string; caption: string }[];
  why: string;
  steps: string[];
  cues: string[];
  setsReps: string;
  watchOuts: string[];
  sourceCredit?: string;
  addedOn: string;         // ISO date
};

export const MOVEMENTS: Movement[] = [
  {
    slug: "rotating-dumbbell-bench-press",
    name: "Rotating Dumbbell Bench Press",
    subtitle: "Shoulder-friendly chest press",
    trains: ["Chest", "Front delts", "Triceps"],
    equipment: "Dumbbells · flat bench",
    images: [
      { src: "/moves/rotating-db-press-1.jpg", caption: "Bottom — palms in, elbows tucked" },
      { src: "/moves/rotating-db-press-2.jpg", caption: "Press & rotate" },
      { src: "/moves/rotating-db-press-3.jpg", caption: "Top — palms forward, squeeze" },
    ],
    why:
      "The bottom position is the money. You start with the dumbbells turned in — palms facing each other, elbows tucked to your ribs — which is far kinder to the shoulder than a barbell bench where the elbows flare. As you press up you rotate the palms to face forward and squeeze the chest at the top. Full chest work, happy shoulders. One of the best pressing options for anyone with a cranky shoulder.",
    steps: [
      "Lie flat, dumbbells at the bottom of your chest, palms facing each other, elbows tucked close to your ribs.",
      "Press up and rotate — as the dumbbells rise, turn your palms to face your feet.",
      "At the top, squeeze the chest hard for a beat. Stop a couple of inches short of clashing the dumbbells.",
      "Reverse on the way down — rotate back to palms-in as the elbows return to your sides. 2–3 seconds down, controlled.",
    ],
    cues: [
      "Turn as you press.",
      "Elbows to your ribs at the bottom, not out wide.",
      "Squeeze at the top like you're crushing something between the dumbbells.",
    ],
    setsReps: "3 × 8–12 · leave 2–3 reps in the tank",
    watchOuts: [
      "Don't clash the dumbbells at the top — stop a couple of inches apart.",
      "Keep the rotation smooth through the whole press, not a wrist-flick at the end.",
    ],
    sourceCredit: "Saved from @dickersonross",
    addedOn: "2026-07-23",
  },
];

export function getMovement(slug: string): Movement | undefined {
  return MOVEMENTS.find((m) => m.slug === slug);
}
