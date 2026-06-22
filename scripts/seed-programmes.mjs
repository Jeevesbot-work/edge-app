// Seed per-client programmes into Supabase.
// Usage: node scripts/seed-programmes.mjs
// Requires client_programmes table to exist (migration 0002) and SUPABASE_SERVICE_ROLE_KEY.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8")
  .split("\n").reduce((a, l) => { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) a[m[1]] = m[2]; return a; }, {});

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── LEE — existing 4-Week Re-Entry Block (verbatim, so he doesn't regress) ───
const LEE_USER_ID = "1da5de99-31be-4ced-a335-347489e98d7e";
const leeProgramme = {
  id: "b2s-block1-reentry", title: "4-Week Re-Entry Block", subtitle: "Strength & Definition",
  owner: "Lee", lengthWeeks: 4,
  summary: "On-ramp block: rebuild the training habit, lay down muscle, sharpen up. Easy start, finish strong.",
  considerations: ["Diabetic (type TBC)", "ADHD meds suppress daytime appetite — nutrition is the lever"],
  rpeNote: "RPE = how hard a set felt /10. RPE 6 = ~4 reps left in the tank. RPE 8 = ~2 reps left. No grinding reps this block.",
  weeklySchedule: [
    { day: "Mon", label: "Lower A", sessionKey: "lower-a", type: "lift" },
    { day: "Tue", label: "Upper A", sessionKey: "upper-a", type: "lift" },
    { day: "Wed", label: "Incline walk + core", sessionKey: null, type: "cardio" },
    { day: "Thu", label: "Lower B", sessionKey: "lower-b", type: "lift" },
    { day: "Fri", label: "Upper B + assault bike", sessionKey: "upper-b", type: "lift" },
    { day: "Sat", label: "Walk or assault bike (pick)", sessionKey: null, type: "cardio" },
    { day: "Sun", label: "Off", sessionKey: null, type: "rest" },
  ],
  progression: [
    { week: 1, label: "Groove", sets: "2", rpe: "6", change: "Learn the moves. Weights should feel too light. Leave every set fresh." },
    { week: 2, label: "Build", sets: "3", rpe: "7", change: "Add the 3rd set. Nudge weights up where week 1 felt easy." },
    { week: 3, label: "Push", sets: "3", rpe: "7–8", change: "Hardest week. Add load or 1–2 reps on main lifts." },
    { week: 4, label: "Sharpen", sets: "2–3", rpe: "7", change: "Pull volume back slightly, keep the weight. Finish strong." },
  ],
  progressionRule: "Hit the top of the rep range on every set with a rep or two left in the tank? Go up next session (smallest jump available). Form breaks down before you hit reps? Stay put.",
  cardio: {
    inclineWalk: { label: "Incline Walk", days: "Wed + Sat (2–3× per week)", setup: "10–15% incline · 4–5 km/h · conversational but working",
      byWeek: [{ week: 1, duration: "20 min" }, { week: 2, duration: "22 min" }, { week: 3, duration: "25 min" }, { week: 4, duration: "25–30 min" }],
      timingTip: "A 15–20 min walk after your biggest meal blunts the glucose spike. Your CGM will show it — use that feedback." },
    assaultBike: { label: "Assault Bike", days: "Fri (after lifting) or Sat", rule: "Never before a Lower day — save the legs.",
      byWeek: [{ week: 1, format: "6 rounds — 15s hard / 45s easy" }, { week: 2, format: "8 rounds — 15s hard / 45s easy" }, { week: 3, format: "8 rounds — 20s hard / 40s easy" }, { week: 4, format: "10 rounds — 20s hard / 40s easy" }] },
  },
  nutrition: {
    headline: "Nutrition is the lever. ADHD meds suppress daytime appetite — the risk is under-eating protein and total calories without realising it.",
    targets: ["Protein ~170g/day (floor: 150g)", "Don't under-eat total food — suppressed appetite isn't low need", "Eat early and on a schedule"],
    tactics: ["Front-load a big protein breakfast before or with the meds", "Drink calories midday when food is unappealing: whey + milk + oats + nut butter + banana", "Set eating alarms — don't rely on hunger signals", "Bigger solid meal in the evening, not right before bed"],
    proteinTarget: 170, calorieTarget: 2200,
    medicalLabel: "Diabetes — guidance only",
    medicalNote: "General guidance only — clear any changes to training, fuelling, or supplementation with your GP or diabetes team. Pair carbs with protein, fat, and fibre. Use your CGM as a coaching tool, not a stress trigger.",
    recipes: [
      { emoji: "🍳", tag: "Breakfast", name: "The Steak & Eggs Standard", kcal: 520, p: 42, time: 12, desc: "Two eggs, lean rump, spinach. The breakfast that does not negotiate. Protein-first, no faff.", steps: ["Get a pan properly hot", "Season rump, sear 2 min each side, rest it", "Fry eggs in the same pan", "Wilt spinach in the fat, plate it all"] },
      { emoji: "🥣", tag: "Breakfast", name: "Big-Bowl Greek Yoghurt", kcal: 410, p: 38, time: 5, desc: "0% Greek yoghurt, whey, berries, handful of nuts. Five minutes, 38g protein.", steps: ["300g 0% Greek yoghurt in a bowl", "Stir through a scoop of whey", "Top with frozen berries and almonds"] },
      { emoji: "🍗", tag: "Lunch", name: "Chicken & Rice, Sorted", kcal: 600, p: 55, time: 20, desc: "The unglamorous workhorse. Thigh for flavour, basmati, broccoli. Batch it Sunday.", steps: ["Season chicken thighs, roast 18 min", "Microwave basmati pouch", "Steam broccoli", "Combine, hit with chilli and lemon"] },
      { emoji: "🥗", tag: "Lunch", name: "Tuna Power Plate", kcal: 450, p: 48, time: 8, desc: "Two tins of tuna, butter beans, red onion, olive oil. No cooking. Desk-friendly.", steps: ["Drain tuna and butter beans", "Mix with diced red onion", "Olive oil, lemon, black pepper", "Done"] },
      { emoji: "🍲", tag: "Dinner", name: "Beef & Bean Chilli", kcal: 580, p: 46, time: 30, desc: "5% mince, kidney beans, proper spice. Makes four portions. Freezes like a dream.", steps: ["Brown the mince hard", "Onion, garlic, cumin, paprika", "Tinned tomatoes + kidney beans", "Simmer 20 min, taste, adjust"] },
      { emoji: "🥤", tag: "Snack", name: "The Recovery Shake", kcal: 320, p: 40, time: 3, desc: "Whey, banana, oats, milk. Post-session or the 4pm slump-killer.", steps: ["Whey + 250ml milk", "Half a banana, 30g oats", "Blend, drink within the hour"] },
    ],
  },
  checkIn: { frequency: "Weekly — Sunday, 5 minutes",
    fields: ["Bodyweight", "Lifting sessions completed (of 4)", "Cardio sessions done", "Protein hit this week? Y/N", "Energy 1–10", "Sleep 1–10", "Glucose patterns noticed", "Win of the week"],
    photoNote: "Front / side / back on Day 1 and at the end of Week 4. Same light, same time of day." },
};
const leeSessions = {
  "lower-a": { type: "lower-a", name: "Lower A — Quad Focus", exercises: [
    { name: "Goblet squat", sets: 2, reps: "10–12", rest: "90s", notes: "Chest up, sit between hips" },
    { name: "Leg press", sets: 2, reps: "12–15", rest: "90s", notes: "Controlled, don't lock knees" },
    { name: "DB Romanian deadlift", sets: 2, reps: "10–12", rest: "90s", notes: "Hinge at hips, feel hamstrings" },
    { name: "Seated leg curl", sets: 2, reps: "12–15", rest: "60s", notes: "Squeeze, slow lower" },
    { name: "Standing calf raise", sets: 2, reps: "15", rest: "45s", notes: "Full stretch at bottom" },
    { name: "Dead bug", sets: 2, reps: "8/side", rest: "45s", notes: "Slow, ribs down" }] },
  "upper-a": { type: "upper-a", name: "Upper A — Push Focus", exercises: [
    { name: "Machine chest press", sets: 2, reps: "10–12", rest: "90s", notes: "Or flat DB press" },
    { name: "Incline DB press", sets: 2, reps: "10–12", rest: "90s", notes: "Upper chest" },
    { name: "DB shoulder press", sets: 2, reps: "10–12", rest: "75s", notes: "Don't flare elbows" },
    { name: "Lateral raise", sets: 2, reps: "12–15", rest: "45s", notes: "Light — lead with elbows" },
    { name: "Triceps rope pushdown", sets: 2, reps: "12–15", rest: "45s", notes: "Full lockout" },
    { name: "Face pull", sets: 2, reps: "15", rest: "45s", notes: "Shoulder health — don't skip" }] },
  "lower-b": { type: "lower-b", name: "Lower B — Hinge Focus", exercises: [
    { name: "Hip thrust", sets: 2, reps: "10–12", rest: "90s", notes: "Drive through heels, squeeze glutes" },
    { name: "Hack squat / leg press", sets: 2, reps: "12–15", rest: "90s", notes: "Higher foot placement for hams/glutes" },
    { name: "Walking lunges", sets: 2, reps: "10/leg", rest: "75s", notes: "Bodyweight or light DBs to start" },
    { name: "Leg extension", sets: 2, reps: "12–15", rest: "60s", notes: "Pause at top" },
    { name: "Seated calf raise", sets: 2, reps: "15", rest: "45s", notes: "Slow tempo" },
    { name: "Pallof press", sets: 2, reps: "10/side", rest: "45s", notes: "Resist the twist" }] },
  "upper-b": { type: "upper-b", name: "Upper B — Pull Focus", exercises: [
    { name: "Lat pulldown", sets: 2, reps: "10–12", rest: "90s", notes: "Or assisted pull-up" },
    { name: "Chest-supported row", sets: 2, reps: "10–12", rest: "90s", notes: "Pull to ribs, squeeze back" },
    { name: "Seated cable row", sets: 2, reps: "12–15", rest: "75s", notes: "Tall chest" },
    { name: "DB curl", sets: 2, reps: "10–12", rest: "45s", notes: "No swinging" },
    { name: "Hammer curl", sets: 2, reps: "12", rest: "45s", notes: "Forearm + bicep" },
    { name: "Rear delt fly", sets: 2, reps: "15", rest: "45s", notes: "Light, controlled" }] },
};

// ── BARRY — Strong90 Block 1: Audit & Foundations ────────────────────────────
const STRENGTH_CLEARANCE_NOTE = "Weeks 3–4 only, and ONLY once your cardiologist has cleared you for resistance work. Until cleared: do a 45-min treadmill walk + 10-min standing mobility instead. Conversational pace throughout — if your heart races or you feel off, stop.";
const barryProgramme = {
  id: "b2s-barry-block1", title: "Strong90 Block 1: Audit & Foundations", subtitle: "Foundations",
  owner: "Barry", lengthWeeks: 2,
  summary: "On-ramp: build the daily habit and get the weight moving for your Cardioversion. Two walks a day — treadmill in the morning, a walk after dinner.",
  considerations: [
    "AFib — all training stays at conversational pace, cleared with your cardiology team",
    "Cardioversion pending — losing weight to qualify for the procedure is the whole mission",
  ],
  rpeNote: "Pace check, not effort score: if you can't speak a full sentence, you're going too fast. Conversational pace, always — that's what keeps this safe for your heart.",
  weeklySchedule: [
    { day: "Mon", label: "Treadmill", sessionKey: null, type: "cardio" },
    { day: "Tue", label: "Treadmill", sessionKey: null, type: "cardio" },
    { day: "Wed", label: "Treadmill", sessionKey: null, type: "cardio" },
    { day: "Thu", label: "Treadmill", sessionKey: null, type: "cardio" },
    { day: "Fri", label: "Treadmill", sessionKey: null, type: "cardio" },
    { day: "Sat", label: "Treadmill", sessionKey: null, type: "cardio" },
    { day: "Sun", label: "Evening walk only", sessionKey: null, type: "rest" },
  ],
  progression: [
    { week: 1, label: "Establish", sets: "—", rpe: "—", change: "Win every day. AM treadmill 30 min, PM walk 30 min, every day. Bed by 10:30, phone out of the bedroom. Max 4 pints this week." },
    { week: 2, label: "Extend", sets: "—", rpe: "—", change: "Treadmill up to 45 min, evening walk 30 min. Bed by 10pm, no screens after 9:30. Log your morning weight daily. Max 3 pints." },
  ],
  progressionRule: "Don't chase intensity — consistency is the win. Bad day? Tell me, we adjust. The streak matters more than any single session.",
  cardio: {
    inclineWalk: { label: "Morning Treadmill (fasted)", days: "Every morning · 5:30am", setup: "Conversational pace. Straight from the car to the treadmill — no decisions. Fasted; eat after.",
      byWeek: [{ week: 1, duration: "30 min" }, { week: 2, duration: "45 min" }],
      timingTip: "Same time, same place, every day. The habit is the win — speed doesn't matter yet." },
    assaultBike: { label: "Evening Walk", days: "Every night · after dinner", rule: "Non-negotiable. Straight after dinner — walk, home, shower, bed. It's your wind-down signal.",
      byWeek: [{ week: 1, format: "30 min easy" }, { week: 2, format: "30 min easy" }] },
  },
  nutrition: {
    headline: "Keep it simple — the two daily walks, the swaps, and protein first. Losing weight for your Cardioversion is the mission.",
    targets: ["Protein 200g/day", "Calories ~2,000–2,100/day", "Alcohol: max 4 pints Week 1, max 3 pints Week 2"],
    tactics: ["Cook double at dinner — tomorrow's lunch is already done", "Protein-first breakfast after your fasted walk — see your meal ideas in the Fuel tab", "No eating after 9pm — from Day 1", "Remove crisps, biscuits, chocolate and fizzy drinks from the house"],
    proteinTarget: 200, calorieTarget: 2050,
    medicalLabel: "Heart — guidance only",
    medicalNote: "Everything here sits alongside your cardiology care, never instead of it. Clear any change in activity with your medical team. Medical questions — procedures, medication — go to them, every time.",
    recipes: [
      { emoji: "🥣", tag: "Breakfast", name: "0% Fage, Berries & Nuts", kcal: 300, p: 23, time: 5, desc: "Prep the night before, grab on your way out, eat after your walk. Add half a scoop of whey to push it to ~45g protein.", steps: ["200g 0% Fage Greek yoghurt in a jar", "Handful of mixed berries + small handful of mixed nuts", "1 tsp honey, lid on, fridge overnight", "Grab and go — eat in the car or at the first site"] },
      { emoji: "🥛", tag: "Breakfast", name: "Overnight Oats", kcal: 440, p: 40, time: 2, desc: "One jar, two minutes the night before. Eat cold from the jar after training.", steps: ["60g oats + 200ml semi-skimmed milk", "1 scoop whey protein, stir", "Lid on, fridge overnight", "Eat cold from the jar"] },
      { emoji: "🥚", tag: "Breakfast", name: "Pre-Boiled Eggs & Banana", kcal: 330, p: 20, time: 1, desc: "Boil a batch on Sunday. Zero morning effort all week.", steps: ["Boil 6 eggs on Sunday, keep in the fridge", "Each morning grab 3 eggs + a banana", "Done"] },
      { emoji: "🥤", tag: "Breakfast", name: "Protein Shake (backup)", kcal: 360, p: 60, time: 1, desc: "For any morning nothing else is prepped. Shake and go.", steps: ["2 scoops whey + 300ml semi-skimmed milk in a shaker", "Fridge overnight", "Shake and go"] },
      { emoji: "🍱", tag: "Lunch", name: "Cook-Double Leftovers", kcal: 600, p: 45, time: 2, desc: "Cook double at dinner, box it up before bed. Lunch sorted 4–5 days a week with zero extra effort.", steps: ["Box up tonight's dinner before bed", "Eat cold on site or microwave", "Backup: wholegrain wrap + chicken + cheddar + lettuce, or good soup + 3 boiled eggs"] },
      { emoji: "🍽️", tag: "Dinner", name: "Protein-First Plate", kcal: 650, p: 55, time: 25, desc: "Protein at the centre, generous veg, carbs on the plate but not the main event. Cook extra for tomorrow's lunch. No fish.", steps: ["Palm-sized+ portion of meat (chicken, beef, pork, lamb, eggs)", "Generous veg on the side", "A modest portion of carbs", "Cook extra — that's tomorrow's lunch"] },
    ],
  },
  checkIn: { frequency: "Daily — 60 seconds",
    fields: ["Morning walk done? (+ minutes)", "Evening walk done?", "Morning weight (kg)", "In bed by 10pm?", "Sleep quality 1–5", "Alcohol units yesterday", "Energy on waking 1–5", "One win today"],
    photoNote: "Front / side / back photo on Day 1 and at the end of Week 4. Same light, same time of day." },
};
// Strength removed from Barry's plan for now (Weeks 1–2 are walking only).
// Strength sessions + Weeks 3–4 will be added back once his cardiologist clears resistance work.
const barrySessions = {};

const BARRY_MEDICAL_NOTE = "MEDICAL — Cardioversion pending; weight loss is the clinical goal to qualify. AFib context: all training at conversational pace, cleared with cardiology. Medical questions go to his team. Current block is WALKING ONLY (Weeks 1–2); strength to be added later, only once cleared for resistance work. Baseline (audit 14 Jun 2026): 124kg, waist 54in, resting HR 60, sleep 6h, ~7 pints/week, 0 training days. Barriers: energy, injury, motivation, family demands, medical. Joint pain (knees). KPIs: weight ↓ to specialist-cleared target; bed by 10pm; daily walks 7/7.";

async function upsertProgramme(userId, programme, sessions) {
  const { error } = await admin.from("client_programmes").upsert({ user_id: userId, programme, sessions }, { onConflict: "user_id" });
  if (error) throw new Error(`client_programmes upsert (${userId}): ${error.message}`);
}

async function main() {
  // 1. Lee — seed his existing plan so he doesn't regress to the awaiting state.
  await upsertProgramme(LEE_USER_ID, leeProgramme, leeSessions);
  console.log("✓ Lee programme seeded");

  // 2. Barry — create auth user + profile + programme_state (no email sent), then programme.
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink", email: "barrywkavanagh@gmail.com",
    options: { redirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback` },
  });
  if (linkErr) throw new Error(`generateLink: ${linkErr.message}`);
  const barryId = linkData.user.id;
  console.log("✓ Barry auth user:", barryId);
  console.log("  magic link (give to Barry when ready):", linkData.properties?.action_link);

  const { error: profErr } = await admin.from("profiles").upsert({
    id: barryId, email: "barrywkavanagh@gmail.com", full_name: "Barry Kavanagh",
    age: 59, goal: "fat", training_state: "none",
    injuries: "AFib / Cardioversion pending — conversational pace only until cardiology clearance. Joint pain (knees).",
    days_per_week: 2, approved: true,
  }, { onConflict: "id" });
  if (profErr) throw new Error(`profiles upsert: ${profErr.message}`);

  await admin.from("programme_state").upsert(
    { user_id: barryId, current_day: 1, current_week: 1, start_date: "2026-06-15" },
    { onConflict: "user_id" });

  await upsertProgramme(barryId, barryProgramme, barrySessions);
  console.log("✓ Barry programme seeded");

  // Medical note (idempotent: only insert if not already present)
  await admin.from("admin_notes").delete().eq("user_id", barryId).ilike("note", "MEDICAL —%");
  await admin.from("admin_notes").insert({ user_id: barryId, note: BARRY_MEDICAL_NOTE, created_by: "Nick" });
  console.log("✓ Barry medical note refreshed");

  console.log("\nDone.");
}

main().catch((e) => { console.error("SEED FAILED:", e.message); process.exit(1); });
