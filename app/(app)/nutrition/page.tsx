"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Recipe } from "@/types";

interface SupabaseLog {
  id: string;
  meal_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  edge_comment: string;
  created_at: string;
}

interface LocalEntry {
  uid: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  meal: string;
  emoji: string;
}

interface SearchResult {
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DayTotals {
  date: string;
  protein: number;
  calories: number;
}

// Fallback only — each client's real meals come from their programme (client_programmes).
const DEFAULT_RECIPES: Recipe[] = [
  { emoji: "🍳", tag: "Breakfast", name: "The Steak & Eggs Standard", kcal: 520, p: 42, time: 12, desc: "Two eggs, lean rump, spinach. The breakfast that does not negotiate. Protein-first, no faff.", steps: ["Get a pan properly hot", "Season rump, sear 2 min each side, rest it", "Fry eggs in the same pan", "Wilt spinach in the fat, plate it all"] },
  { emoji: "🥣", tag: "Breakfast", name: "Big-Bowl Greek Yoghurt", kcal: 410, p: 38, time: 5, desc: "0% Greek yoghurt, whey, berries, handful of nuts. Five minutes, 38g protein.", steps: ["300g 0% Greek yoghurt in a bowl", "Stir through a scoop of whey", "Top with frozen berries and almonds"] },
  { emoji: "🍗", tag: "Lunch", name: "Chicken & Rice, Sorted", kcal: 600, p: 55, time: 20, desc: "The unglamorous workhorse. Thigh for flavour, basmati, broccoli. Batch it Sunday.", steps: ["Season chicken thighs, roast 18 min", "Microwave basmati pouch", "Steam broccoli", "Combine, hit with chilli and lemon"] },
  { emoji: "🥗", tag: "Lunch", name: "Tuna Power Plate", kcal: 450, p: 48, time: 8, desc: "Two tins of tuna, butter beans, red onion, olive oil. No cooking. Desk-friendly.", steps: ["Drain tuna and butter beans", "Mix with diced red onion", "Olive oil, lemon, black pepper", "Done"] },
  { emoji: "🍲", tag: "Dinner", name: "Beef & Bean Chilli", kcal: 580, p: 46, time: 30, desc: "5% mince, kidney beans, proper spice. Makes four portions. Freezes like a dream.", steps: ["Brown the mince hard", "Onion, garlic, cumin, paprika", "Tinned tomatoes + kidney beans", "Simmer 20 min, taste, adjust"] },
  { emoji: "🐟", tag: "Dinner", name: "Salmon Traybake", kcal: 540, p: 44, time: 25, desc: "Salmon fillet, sweet potato, asparagus. One tray, omega-3s, joint-friendly.", steps: ["Cube sweet potato, roast 15 min", "Add salmon + asparagus", "Olive oil, salt, back in 10 min", "Squeeze of lemon"] },
  { emoji: "🥤", tag: "Snack", name: "The Recovery Shake", kcal: 320, p: 40, time: 3, desc: "Whey, banana, oats, milk. Post-session or the 4pm slump-killer.", steps: ["Whey + 250ml milk", "Half a banana, 30g oats", "Blend, drink within the hour"] },
  { emoji: "🥜", tag: "Snack", name: "Cottage Cheese & Crackers", kcal: 260, p: 24, time: 2, desc: "Cottage cheese, oatcakes, black pepper. Casein for a slow evening release.", steps: ["200g cottage cheese", "3–4 oatcakes", "Crack of pepper, maybe chilli flakes"] },
  { emoji: "🍝", tag: "Dinner", name: "High-Protein Pasta", kcal: 610, p: 50, time: 18, desc: "Lentil pasta, turkey mince, tomato. Carbs that earn their place on a training day.", steps: ["Boil lentil pasta", "Brown turkey mince with garlic", "Tomato sauce, simmer", "Toss together, parmesan on top"] },
  { emoji: "🍛", tag: "Lunch", name: "Egg Fried Rice, Built Up", kcal: 490, p: 36, time: 15, desc: "Leftover rice, prawns, three eggs, peas. The fridge-clearout that hits macros.", steps: ["Scramble eggs, set aside", "Fry rice hot with peas", "Add prawns til pink", "Fold eggs back in, soy sauce"] },
];

const SUPPS = [
  { id: "creatine", name: "Creatine Monohydrate", dose: "5g daily", why: "Strength, muscle retention, and increasingly the brain. Non-negotiable after 40." },
  { id: "vitd", name: "Vitamin D3 + K2", dose: "4000iu daily", why: "Most UK men are deficient. Testosterone, mood, bones, immunity." },
  { id: "omega", name: "Omega-3 (EPA/DHA)", dose: "2g daily", why: "Joints, heart, inflammation. Matters more every year for the back." },
  { id: "mag", name: "Magnesium Glycinate", dose: "300mg evening", why: "Sleep quality and recovery. The glycinate form, not the cheap stuff." },
  { id: "protein", name: "Whey Protein", dose: "1–2 scoops", why: "Insurance, not magic. Bridges the gap on days food falls short." },
];

// AI photo/describe logging is disabled until the nutrition_logs table exists.
// Flip to true once that table is created to re-enable the camera + "Describe".
const AI_LOGGING_ENABLED = false;

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const TODAY_KEY = new Date().toISOString().slice(0, 10);
const LOCAL_KEY = "b2s-fuel";
const SUPPS_KEY = "b2s-supps";

function loadLocalEntries(): LocalEntry[] {
  try {
    const data = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
    return data[TODAY_KEY] || [];
  } catch { return []; }
}

function saveLocalEntries(entries: LocalEntry[]) {
  try {
    const data = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
    data[TODAY_KEY] = entries;
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  } catch { /**/ }
}

function loadSupps(): Record<string, boolean> {
  try {
    const data = JSON.parse(localStorage.getItem(SUPPS_KEY) || "{}");
    return data[TODAY_KEY] || {};
  } catch { return {}; }
}

function saveSupps(s: Record<string, boolean>) {
  try {
    const data = JSON.parse(localStorage.getItem(SUPPS_KEY) || "{}");
    data[TODAY_KEY] = s;
    localStorage.setItem(SUPPS_KEY, JSON.stringify(data));
  } catch { /**/ }
}

function MacroRing({ value, target, color, label, display }: { value: number; target: number; color: string; label: string; display: string }) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / Math.max(target, 1), 1);
  const offset = circ * (1 - pct);
  const size = (r + 6) * 2;
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
        </svg>
        <div style={{ position: "absolute" }}>
          <span style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 13, color: "#F2F1ED", fontWeight: 400 }}>{display}</span>
        </div>
      </div>
      <div style={{ marginTop: 6 }}>
        <div style={{ fontSize: 9, color: "#9BA3AF", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "Inter, sans-serif" }}>{label}</div>
        <div style={{ fontSize: 9, color: "#3D434D", fontFamily: "Inter, sans-serif", marginTop: 1 }}>/{target}{label === "kcal" ? "" : "g"}</div>
      </div>
    </div>
  );
}

export default function NutritionPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [tab, setTab] = useState<"today" | "food" | "recipes" | "stack">("today");

  // Supabase data
  const [supaLogs, setSupaLogs] = useState<SupabaseLog[]>([]);
  const [weekData, setWeekData] = useState<DayTotals[]>([]);
  const [streak, setStreak] = useState(0);
  const [proteinTarget, setProteinTarget] = useState(160);
  const [calorieTarget, setCalorieTarget] = useState(2200);

  // Local data
  const [localEntries, setLocalEntries] = useState<LocalEntry[]>([]);
  const [supps, setSupps] = useState<Record<string, boolean>>({});
  const [waterGlasses, setWaterGlasses] = useState(0);

  // Camera/text analysis
  const [analysing, setAnalysing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [latest, setLatest] = useState<SupabaseLog | null>(null);
  const [error, setError] = useState("");
  const [textMode, setTextMode] = useState(false);
  const [mealText, setMealText] = useState("");

  // Food search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Modals
  const [portionItem, setPortionItem] = useState<SearchResult | null>(null);
  const [portionGrams, setPortionGrams] = useState(100);
  const [portionMeal, setPortionMeal] = useState("Breakfast");
  const [recipeModal, setRecipeModal] = useState<Recipe | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>(DEFAULT_RECIPES);

  // Toast
  const [toastMsg, setToastMsg] = useState("");

  const today = TODAY_KEY;

  useEffect(() => {
    loadData();
    setLocalEntries(loadLocalEntries());
    setSupps(loadSupps());
    const stored = localStorage.getItem(`water_${today}`);
    if (stored) setWaterGlasses(parseInt(stored, 10));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 1800);
  }

  async function loadData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const since = new Date();
    since.setDate(since.getDate() - 13);
    const sinceStr = since.toISOString().split("T")[0];

    const [{ data: logsData }, { data: profile }, { data: historyData }, { data: cp }] = await Promise.all([
      supabase.from("nutrition_logs").select("*").eq("user_id", user.id).eq("date", today).order("created_at", { ascending: false }),
      supabase.from("profiles").select("protein_target, calorie_target").eq("id", user.id).single(),
      supabase.from("nutrition_logs").select("date, protein_g, calories").eq("user_id", user.id).gte("date", sinceStr),
      supabase.from("client_programmes").select("programme").eq("user_id", user.id).maybeSingle(),
    ]);

    if (logsData) setSupaLogs(logsData);

    // Targets and meals come from the client's bespoke programme; fall back to profile/defaults.
    const nutrition = cp?.programme?.nutrition;
    if (Array.isArray(nutrition?.recipes) && nutrition.recipes.length) setRecipes(nutrition.recipes);
    const pt = nutrition?.proteinTarget ?? profile?.protein_target ?? 160;
    const ct = nutrition?.calorieTarget ?? profile?.calorie_target ?? 2200;
    setProteinTarget(pt);
    setCalorieTarget(ct);

    if (historyData) {
      const byDate: Record<string, DayTotals> = {};
      historyData.forEach((row) => {
        if (!byDate[row.date]) byDate[row.date] = { date: row.date, protein: 0, calories: 0 };
        byDate[row.date].protein += row.protein_g;
        byDate[row.date].calories += row.calories;
      });
      const days: DayTotals[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0];
        days.push(byDate[key] ?? { date: key, protein: 0, calories: 0 });
      }
      setWeekData(days);
      let s = 0;
      for (const d of Object.keys(byDate).sort().reverse()) {
        if (d > today) continue;
        if (byDate[d].protein >= pt) s++; else break;
      }
      setStreak(s);
    }
  }

  // Merged totals
  const totalKcal = supaLogs.reduce((s, l) => s + l.calories, 0) + localEntries.reduce((s, l) => s + l.kcal, 0);
  const totalProtein = supaLogs.reduce((s, l) => s + l.protein_g, 0) + localEntries.reduce((s, l) => s + l.protein, 0);
  const totalCarbs = supaLogs.reduce((s, l) => s + l.carbs_g, 0) + localEntries.reduce((s, l) => s + l.carbs, 0);
  const totalFat = supaLogs.reduce((s, l) => s + l.fat_g, 0) + localEntries.reduce((s, l) => s + l.fat, 0);
  const fatTarget = Math.round((calorieTarget * 0.28) / 9);
  const carbsTarget = Math.max(0, Math.round((calorieTarget - proteinTarget * 4 - fatTarget * 9) / 4));

  const hour = new Date().getHours();

  function coachLine(): string {
    if (totalKcal === 0) return "Nothing logged yet. Don't overthink it — get the first meal in and the day builds itself.";
    const pPct = totalProtein / proteinTarget;
    if (pPct >= 0.9) return "Protein's nailed. That's the one that actually moves the needle. Good man.";
    if (totalKcal > calorieTarget * 0.6 && pPct < 0.5) return "Plenty of calories in, protein lagging. Next meal: lead with the protein, fill the gaps after.";
    const rem = Math.max(0, proteinTarget - Math.round(totalProtein));
    if (hour >= 16 && rem > 0) {
      if (rem >= 50) return `${rem}g protein left — aim for 2 palm-sized portions of lean meat or fish at dinner.`;
      if (rem >= 25) return `${rem}g left — a chicken breast or Greek yoghurt will get you there.`;
      return `${rem}g left — a protein shake or cottage cheese will finish the job.`;
    }
    return "On track. Consistency beats intensity every single time at our age. Keep stacking the days.";
  }

  function toggleWater(idx: number) {
    const n = waterGlasses === idx + 1 ? idx : idx + 1;
    setWaterGlasses(n);
    localStorage.setItem(`water_${today}`, String(n));
  }

  // Camera
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(""); setLatest(null);
    const reader = new FileReader();
    reader.onload = () => { const d = reader.result as string; setPreview(d); analyseImage(file, d); };
    reader.readAsDataURL(file);
  }

  async function analyseImage(file: File, dataUrl: string) {
    setAnalysing(true);
    try {
      const base64 = await resizeImage(dataUrl, 1024);
      const res = await fetch("/api/nutrition/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: base64, mimeType: file.type || "image/jpeg" }) });
      if (!res.ok) { const err = await res.json(); setError(err.error || "Analysis failed."); return; }
      const log: SupabaseLog = await res.json();
      setLatest(log); setSupaLogs((p) => [log, ...p]);
    } catch { setError("Something went wrong. Check your connection."); }
    finally { setAnalysing(false); setPreview(null); if (fileRef.current) fileRef.current.value = ""; }
  }

  async function analyseText() {
    if (!mealText.trim()) return;
    setAnalysing(true); setError(""); setLatest(null);
    try {
      const res = await fetch("/api/nutrition/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: mealText.trim() }) });
      if (!res.ok) { const err = await res.json(); setError(err.error || "Analysis failed."); return; }
      const log: SupabaseLog = await res.json();
      setLatest(log); setSupaLogs((p) => [log, ...p]); setMealText(""); setTextMode(false);
    } catch { setError("Something went wrong. Check your connection."); }
    finally { setAnalysing(false); }
  }

  async function deleteSupaLog(id: string) {
    const supabase = createClient();
    await supabase.from("nutrition_logs").delete().eq("id", id);
    setSupaLogs((p) => p.filter((l) => l.id !== id));
    if (latest?.id === id) setLatest(null);
  }

  function deleteLocalEntry(uid: string) {
    const updated = localEntries.filter((e) => e.uid !== uid);
    setLocalEntries(updated); saveLocalEntries(updated);
  }

  // OFFs search
  async function searchFood(q: string) {
    setSearchLoading(true);
    try {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=12&fields=product_name,brands,nutriments,quantity`;
      const data = await (await fetch(url)).json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items: SearchResult[] = (data.products || []).filter((p: any) => p.product_name && p.nutriments?.["energy-kcal_100g"]).slice(0, 8).map((p: any) => ({
        name: p.product_name.slice(0, 42) + (p.brands ? ` · ${p.brands.split(",")[0]}` : ""),
        kcal: Math.round(p.nutriments["energy-kcal_100g"] || 0),
        protein: Math.round(p.nutriments.proteins_100g || 0),
        carbs: Math.round(p.nutriments.carbohydrates_100g || 0),
        fat: Math.round(p.nutriments.fat_100g || 0),
      }));
      setSearchResults(items);
    } catch { setSearchResults([]); }
    finally { setSearchLoading(false); }
  }

  function handleSearchInput(q: string) {
    setSearchQuery(q);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (q.length < 2) { setSearchResults([]); return; }
    searchTimerRef.current = setTimeout(() => searchFood(q), 450);
  }

  function openPortion(item: SearchResult) {
    setPortionItem(item);
    setPortionGrams(100);
    setPortionMeal(hour < 11 ? "Breakfast" : hour < 15 ? "Lunch" : hour < 20 ? "Dinner" : "Snack");
  }

  function addPortion() {
    if (!portionItem) return;
    const f = portionGrams / 100;
    const entry: LocalEntry = {
      uid: Date.now() + Math.random().toString(36).slice(2, 6),
      name: portionItem.name.split(" · ")[0],
      kcal: Math.round(portionItem.kcal * f),
      protein: Math.round(portionItem.protein * f),
      carbs: Math.round(portionItem.carbs * f),
      fat: Math.round(portionItem.fat * f),
      meal: portionMeal,
      emoji: "🍴",
    };
    const updated = [...localEntries, entry];
    setLocalEntries(updated); saveLocalEntries(updated);
    setPortionItem(null); setSearchQuery(""); setSearchResults([]);
    showToast(`Added to ${portionMeal}`);
  }

  function logRecipe(r: Recipe) {
    const entry: LocalEntry = {
      uid: Date.now() + "",
      name: r.name,
      kcal: r.kcal,
      protein: r.p,
      carbs: Math.round(r.kcal * 0.4 / 4),
      fat: Math.round(r.kcal * 0.25 / 9),
      meal: r.tag === "Snack" ? "Snack" : r.tag,
      emoji: r.emoji,
    };
    const updated = [...localEntries, entry];
    setLocalEntries(updated); saveLocalEntries(updated);
    setRecipeModal(null); showToast("Logged"); setTab("today");
  }

  function toggleSupp(id: string) {
    const updated = { ...supps, [id]: !supps[id] };
    setSupps(updated); saveSupps(updated);
  }

  // Build meal groups
  type MealGroup = { supaItems: SupabaseLog[]; localItems: LocalEntry[]; totalKcal: number };
  const byMeal: Record<string, MealGroup> = {};
  MEAL_TYPES.forEach((m) => { byMeal[m] = { supaItems: [], localItems: [], totalKcal: 0 }; });
  supaLogs.forEach((l) => {
    const m = new Date(l.created_at).getHours() < 11 ? "Breakfast" : new Date(l.created_at).getHours() < 15 ? "Lunch" : new Date(l.created_at).getHours() < 20 ? "Dinner" : "Snack";
    byMeal[m].supaItems.push(l); byMeal[m].totalKcal += l.calories;
  });
  localEntries.forEach((l) => {
    const m = MEAL_TYPES.includes(l.meal) ? l.meal : "Snack";
    byMeal[m].localItems.push(l); byMeal[m].totalKcal += l.kcal;
  });

  const hasLog = supaLogs.length > 0 || localEntries.length > 0;
  const dayLabels = weekData.map((d) => new Date(d.date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short" }).slice(0, 1));

  const CARD: React.CSSProperties = { background: "#171B21", borderRadius: 20, border: "1px solid #252A32", padding: "18px 20px", marginBottom: 14 };
  const EYEBROW: React.CSSProperties = { fontSize: 9, color: "#9BA3AF", textTransform: "uppercase", letterSpacing: "0.15em", fontFamily: "Inter, sans-serif" };
  const SERIF = (sz: number, col = "#F2F1ED"): React.CSSProperties => ({ fontFamily: "Fraunces, Georgia, serif", fontSize: sz, color: col, fontWeight: 400 });

  return (
    <div className="max-w-lg mx-auto" style={{ background: "#0E1014", minHeight: "100svh" }}>

      {/* Header */}
      <div className="px-5" style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 16px)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", paddingTop: 8, paddingBottom: 12 }}>
          <div>
            <p style={{ ...EYEBROW, marginBottom: 4 }}>Fuel</p>
            <h1 style={{ ...SERIF(34), lineHeight: 1 }}>Nutrition.</h1>
          </div>
          {streak >= 2 && (
            <div style={{ background: "rgba(200,150,90,0.08)", border: "1px solid rgba(200,150,90,0.2)", borderRadius: 14, padding: "8px 14px", textAlign: "center", marginTop: 8 }}>
              <p style={{ ...SERIF(20, "#C8965A"), lineHeight: 1 }}>{streak}</p>
              <p style={{ fontSize: 8, color: "#9BA3AF", fontFamily: "Inter, sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>streak</p>
            </div>
          )}
        </div>

        {/* In-page tab bar */}
        <div style={{ display: "flex", background: "#171B21", borderRadius: 14, padding: 4, marginBottom: 16 }}>
          {(["today", "food", "recipes", "stack"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "8px 4px", borderRadius: 10, border: "none", cursor: "pointer",
              background: tab === t ? "#0E1014" : "transparent",
              color: tab === t ? "#F2F1ED" : "#9BA3AF",
              fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: tab === t ? 600 : 400,
              textTransform: "uppercase", letterSpacing: "0.08em", transition: "all 0.15s",
            }}>
              {t === "today" ? "Today" : t === "food" ? "Food" : t === "recipes" ? "Recipes" : "Stack"}
            </button>
          ))}
        </div>
      </div>

      {/* ── TODAY ── */}
      {tab === "today" && (
        <div className="px-5 pb-28 anim-0">

          {/* Macro rings */}
          <div style={CARD}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={EYEBROW}>Today&apos;s fuel</span>
              <span style={{ fontSize: 11, color: "#9BA3AF", fontFamily: "Inter, sans-serif" }}>{Math.round(totalKcal)} / {calorieTarget} kcal</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <MacroRing value={totalKcal} target={calorieTarget} color="#C8965A" label="kcal" display={`${Math.round(Math.min(totalKcal / Math.max(calorieTarget, 1), 1) * 100)}%`} />
              <MacroRing value={totalProtein} target={proteinTarget} color="#E8291C" label="protein" display={`${Math.round(totalProtein)}g`} />
              <MacroRing value={totalCarbs} target={carbsTarget} color="#F5A623" label="carbs" display={`${Math.round(totalCarbs)}g`} />
              <MacroRing value={totalFat} target={fatTarget} color="#34D399" label="fat" display={`${Math.round(totalFat)}g`} />
            </div>
          </div>

          {/* Coach line */}
          <div style={{ ...CARD, background: "#13161A" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(200,150,90,0.12)", border: "1px solid rgba(200,150,90,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ ...SERIF(10, "#C8965A") }}>N</span>
              </div>
              <span style={{ ...EYEBROW, color: "#C8965A" }}>Edge</span>
            </div>
            <p style={{ ...SERIF(15, "rgba(242,241,237,0.85)"), fontStyle: "italic", lineHeight: 1.55 }}>&ldquo;{coachLine()}&rdquo;</p>
          </div>

          {/* 7-day protein chart */}
          {weekData.length === 7 && (
            <div style={CARD}>
              <p style={{ ...EYEBROW, marginBottom: 12 }}>7-day protein</p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 5 }}>
                {weekData.map((day, i) => {
                  const pct = Math.min((day.protein / proteinTarget) * 100, 100);
                  const isToday = day.date === today;
                  const barColor = pct >= 100 ? "#34D399" : pct >= 70 ? "#C8965A" : pct > 0 ? "#3D434D" : "#252A32";
                  const barH = pct > 0 ? Math.max(4, (pct / 100) * 44) : 3;
                  return (
                    <div key={day.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                      <div style={{ width: "100%", height: 44, display: "flex", alignItems: "flex-end" }}>
                        <div style={{ width: "100%", height: barH, borderRadius: 3, background: barColor, opacity: isToday ? 1 : 0.65 }} />
                      </div>
                      <p style={{ fontSize: 9, color: isToday ? "#C8965A" : "#3D434D", fontFamily: "Inter, sans-serif", fontWeight: isToday ? 600 : 400 }}>{dayLabels[i]}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Today's meals by type */}
          {hasLog && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ ...EYEBROW, marginBottom: 10 }}>Logged today</p>
              {MEAL_TYPES.map((m) => {
                const g = byMeal[m];
                if (!g.supaItems.length && !g.localItems.length) return null;
                return (
                  <div key={m} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={SERIF(14)}>{m}</span>
                      <span style={{ fontSize: 11, color: "#9BA3AF", fontFamily: "Inter, sans-serif" }}>{g.totalKcal} kcal</span>
                    </div>
                    {g.supaItems.map((l) => (
                      <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#171B21", borderRadius: 12, border: "1px solid #252A32", marginBottom: 6 }}>
                        <span style={{ fontSize: 18 }}>🍴</span>
                        <div style={{ flex: 1 }}><div style={SERIF(13)}>{l.meal_name}</div><div style={{ fontSize: 11, color: "#C8965A", fontFamily: "Inter, sans-serif" }}>{l.protein_g}g protein</div></div>
                        <span style={{ ...SERIF(13, "#9BA3AF") }}>{l.calories}</span>
                      </div>
                    ))}
                    {g.localItems.map((l) => (
                      <div key={l.uid} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#171B21", borderRadius: 12, border: "1px solid #252A32", marginBottom: 6 }}>
                        <span style={{ fontSize: 18 }}>{l.emoji}</span>
                        <div style={{ flex: 1 }}><div style={SERIF(13)}>{l.name}</div><div style={{ fontSize: 11, color: "#C8965A", fontFamily: "Inter, sans-serif" }}>{l.protein}g protein</div></div>
                        <span style={{ ...SERIF(13, "#9BA3AF") }}>{l.kcal}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick log CTA */}
          <button className="pressable" onClick={() => setTab("food")}
            style={{ width: "100%", background: "#171B21", borderRadius: 18, border: "1px solid #252A32", padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
            <span style={{ fontSize: 24 }}>🍽️</span>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 14, color: "#F2F1ED" }}>Log a meal</div>
              <div style={{ fontSize: 12, color: "#9BA3AF", fontFamily: "Inter, sans-serif", marginTop: 2 }}>Search the food database to log a meal</div>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ width: 16, height: 16, color: "#C8965A" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      )}

      {/* ── FOOD ── */}
      {tab === "food" && (
        <div className="pb-28 anim-0">
          <div className="px-5">
            {/* Search bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#171B21", border: "1px solid #252A32", borderRadius: 14, padding: "13px 16px", marginBottom: 12 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ width: 18, height: 18, color: "#9BA3AF", flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input value={searchQuery} onChange={(e) => handleSearchInput(e.target.value)} placeholder="Search foods…" autoComplete="off"
                style={{ flex: 1, border: "none", background: "none", fontFamily: "Inter, sans-serif", fontSize: 15, color: "#F2F1ED", outline: "none" }} />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setSearchResults([]); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9BA3AF", fontSize: 16, lineHeight: 1 }}>✕</button>
              )}
            </div>

            {/* Snap + Describe (hidden while searching) */}
            {AI_LOGGING_ENABLED && !searchQuery && (
              <div style={{ display: "flex", gap: 10, marginBottom: textMode ? 10 : 14 }}>
                <button onClick={() => { setTextMode(false); fileRef.current?.click(); }} disabled={analysing}
                  style={{ flex: 1, background: analysing && !textMode ? "#171B21" : "#C8965A", borderRadius: 16, padding: "14px 10px", border: analysing && !textMode ? "1px solid #252A32" : "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 7, cursor: "pointer" }}>
                  {analysing && !textMode
                    ? <div style={{ width: 20, height: 20, border: "2px solid #C8965A", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    : <svg viewBox="0 0 24 24" fill="none" stroke={analysing ? "#C8965A" : "#0E1014"} strokeWidth={2} style={{ width: 20, height: 20 }}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: analysing && !textMode ? "#9BA3AF" : "#0E1014", fontWeight: 500 }}>{analysing && !textMode ? "Analysing..." : "Snap Meal"}</p>
                </button>
                <button onClick={() => setTextMode(!textMode)}
                  style={{ flex: 1, background: textMode ? "rgba(200,150,90,0.08)" : "#171B21", borderRadius: 16, padding: "14px 10px", border: `1px solid ${textMode ? "rgba(200,150,90,0.25)" : "#252A32"}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 7, cursor: "pointer" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke={textMode ? "#C8965A" : "#9BA3AF"} strokeWidth={1.5} style={{ width: 20, height: 20 }}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: textMode ? "#C8965A" : "#9BA3AF", fontWeight: 500 }}>Describe</p>
                </button>
              </div>
            )}

            {AI_LOGGING_ENABLED && textMode && !searchQuery && (
              <div style={{ background: "#171B21", borderRadius: 14, border: "1px solid rgba(200,150,90,0.2)", padding: 16, marginBottom: 14 }}>
                <textarea value={mealText} onChange={(e) => setMealText(e.target.value)} placeholder="e.g. 200g chicken breast, 150g rice, mixed veg..." rows={3}
                  style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#F2F1ED", fontFamily: "Inter, sans-serif", resize: "none", lineHeight: 1.5 }} />
                <button onClick={analyseText} disabled={analysing || !mealText.trim()}
                  style={{ marginTop: 10, width: "100%", background: mealText.trim() && !analysing ? "#C8965A" : "#252A32", borderRadius: 12, padding: "12px", border: "none", cursor: mealText.trim() && !analysing ? "pointer" : "default", fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 500, color: mealText.trim() && !analysing ? "#0E1014" : "#3D434D" }}>
                  {analysing ? "Analysing..." : "Get Macros"}
                </button>
              </div>
            )}
          </div>

          {AI_LOGGING_ENABLED && <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />}

          {/* Search spinner */}
          {searchLoading && <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}><div style={{ width: 20, height: 20, border: "2px solid #252A32", borderTopColor: "#C8965A", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /></div>}

          {/* Search results */}
          {!searchLoading && searchResults.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              {searchResults.map((item, idx) => (
                <button key={idx} onClick={() => openPortion(item)} className="pressable"
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "13px 20px", background: "none", border: "none", borderBottom: "1px solid #252A32", cursor: "pointer", textAlign: "left" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "#171B21", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🍴</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 14, color: "#F2F1ED", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: "#9BA3AF", fontFamily: "Inter, sans-serif", marginTop: 2 }}>{item.kcal} kcal · {item.protein}g protein / 100g</div>
                  </div>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "#C8965A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#0E1014", fontSize: 20, fontWeight: 700 }}>+</div>
                </button>
              ))}
            </div>
          )}

          {!searchLoading && searchQuery.length >= 2 && !searchResults.length && (
            <div style={{ textAlign: "center", padding: "20px", color: "#9BA3AF", fontSize: 13, fontFamily: "Inter, sans-serif" }}>No matches. Try a simpler term.</div>
          )}

          {/* Camera preview */}
          {AI_LOGGING_ENABLED && preview && analysing && (
            <div style={{ margin: "0 20px 14px", borderRadius: 16, overflow: "hidden", border: "1px solid #252A32", position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="" style={{ width: "100%", objectFit: "cover", maxHeight: 160, display: "block" }} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(14,16,20,0.65)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={SERIF(15)}>Reading your plate...</p>
              </div>
            </div>
          )}

          {AI_LOGGING_ENABLED && error && <div style={{ margin: "0 20px 14px", background: "rgba(232,41,28,0.08)", border: "1px solid rgba(232,41,28,0.2)", borderRadius: 14, padding: "12px 16px" }}><p style={{ fontSize: 13, color: "#E8291C", fontFamily: "Inter, sans-serif" }}>{error}</p></div>}

          {/* Latest Claude result */}
          {AI_LOGGING_ENABLED && latest && !analysing && (
            <div style={{ margin: "0 20px 14px", background: "#171B21", borderRadius: 18, border: "1px solid rgba(200,150,90,0.2)" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(200,150,90,0.12)" }}>
                <span style={{ fontSize: 9, color: "#C8965A", fontFamily: "Inter, sans-serif", textTransform: "uppercase", letterSpacing: "0.15em" }}>Edge analysed</span>
              </div>
              <div style={{ padding: 16 }}>
                <p style={{ ...SERIF(17), marginBottom: 6 }}>{latest.meal_name}</p>
                <p style={{ fontSize: 12, color: "rgba(242,241,237,0.55)", fontFamily: "Inter, sans-serif", lineHeight: 1.5, marginBottom: 12 }}>{latest.edge_comment}</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {[{ l: "Cal", v: latest.calories, u: "" }, { l: "Protein", v: latest.protein_g, u: "g" }, { l: "Carbs", v: latest.carbs_g, u: "g" }, { l: "Fat", v: latest.fat_g, u: "g" }].map(({ l, v, u }) => (
                    <div key={l} style={{ background: "#252A32", borderRadius: 10, padding: "10px 6px", textAlign: "center" }}>
                      <p style={{ ...SERIF(17), lineHeight: 1 }}>{Math.round(v)}{u}</p>
                      <p style={{ fontSize: 9, color: "#9BA3AF", fontFamily: "Inter, sans-serif", marginTop: 3 }}>{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Water + meal log (hidden while searching) */}
          {!searchQuery && (
            <div className="px-5">
              <div style={{ ...CARD, padding: "14px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <p style={EYEBROW}>Hydration</p>
                  <p style={{ fontSize: 11, color: waterGlasses >= 8 ? "#34D399" : "#9BA3AF", fontFamily: "Inter, sans-serif" }}>{waterGlasses}/8</p>
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <button key={i} onClick={() => toggleWater(i)}
                      style={{ flex: 1, height: 32, borderRadius: 7, background: i < waterGlasses ? "rgba(96,165,250,0.15)" : "#252A32", border: `1px solid ${i < waterGlasses ? "rgba(96,165,250,0.35)" : "#3D434D"}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg viewBox="0 0 24 24" fill={i < waterGlasses ? "#60A5FA" : "none"} stroke={i < waterGlasses ? "#60A5FA" : "#3D434D"} strokeWidth={1.5} style={{ width: 10, height: 10 }}>
                        <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0L12 2.69z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {hasLog && (
                <>
                  <p style={{ ...EYEBROW, marginBottom: 12 }}>Today&apos;s meals</p>
                  {MEAL_TYPES.map((m) => {
                    const g = byMeal[m];
                    if (!g.supaItems.length && !g.localItems.length) return null;
                    return (
                      <div key={m} style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={SERIF(15)}>{m}</span>
                          <span style={{ fontSize: 11, color: "#9BA3AF", fontFamily: "Inter, sans-serif" }}>{g.totalKcal} kcal</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                          {g.supaItems.map((l) => (
                            <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#171B21", borderRadius: 12, border: "1px solid #252A32" }}>
                              <span style={{ fontSize: 17 }}>🍴</span>
                              <div style={{ flex: 1 }}>
                                <div style={SERIF(14)}>{l.meal_name}</div>
                                <div style={{ fontSize: 11, color: "#9BA3AF", fontFamily: "Inter, sans-serif", marginTop: 2 }}>{l.calories} kcal · {l.protein_g}g P · {l.carbs_g}g C · {l.fat_g}g F</div>
                              </div>
                              <button onClick={() => deleteSupaLog(l.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#3D434D" strokeWidth={2} style={{ width: 13, height: 13 }}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          ))}
                          {g.localItems.map((l) => (
                            <div key={l.uid} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#171B21", borderRadius: 12, border: "1px solid #252A32" }}>
                              <span style={{ fontSize: 17 }}>{l.emoji}</span>
                              <div style={{ flex: 1 }}>
                                <div style={SERIF(14)}>{l.name}</div>
                                <div style={{ fontSize: 11, color: "#9BA3AF", fontFamily: "Inter, sans-serif", marginTop: 2 }}>{l.kcal} kcal · {l.protein}g P · {l.carbs}g C · {l.fat}g F</div>
                              </div>
                              <button onClick={() => deleteLocalEntry(l.uid)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#3D434D" strokeWidth={2} style={{ width: 13, height: 13 }}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {!hasLog && !analysing && (
                <div style={{ textAlign: "center", padding: "30px 0", color: "#3D434D", fontSize: 13, fontFamily: "Inter, sans-serif" }}>
                  Nothing logged today. Search a food or snap your first meal.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── RECIPES ── */}
      {tab === "recipes" && (
        <div className="px-5 pb-28 anim-0">
          <p style={{ fontSize: 13, color: "#9BA3AF", fontFamily: "Inter, sans-serif", marginBottom: 16 }}>Protein-first. No faff.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recipes.map((r, i) => (
              <button key={i} onClick={() => setRecipeModal(r)} className="pressable"
                style={{ width: "100%", textAlign: "left", background: "#171B21", borderRadius: 18, border: "1px solid #252A32", overflow: "hidden", cursor: "pointer" }}>
                <div style={{ background: "linear-gradient(135deg,#13161A,#171B21)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 32 }}>{r.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, color: "#C8965A", textTransform: "uppercase", letterSpacing: "0.14em", fontFamily: "Inter, sans-serif", marginBottom: 3 }}>{r.tag}</div>
                    <div style={SERIF(17)}>{r.name}</div>
                  </div>
                </div>
                <div style={{ padding: "10px 16px", borderTop: "1px solid #252A32", display: "flex", gap: 16 }}>
                  <span style={{ fontSize: 12, color: "#9BA3AF", fontFamily: "Inter, sans-serif" }}><span style={{ color: "#F2F1ED", fontWeight: 600 }}>{r.kcal}</span> kcal</span>
                  <span style={{ fontSize: 12, color: "#9BA3AF", fontFamily: "Inter, sans-serif" }}><span style={{ color: "#C8965A", fontWeight: 600 }}>{r.p}g</span> protein</span>
                  <span style={{ fontSize: 12, color: "#9BA3AF", fontFamily: "Inter, sans-serif" }}>{r.time} min</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STACK ── */}
      {tab === "stack" && (
        <div className="px-5 pb-28 anim-0">
          <div style={{ ...CARD, background: "#13161A" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(200,150,90,0.12)", border: "1px solid rgba(200,150,90,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={SERIF(10, "#C8965A")}>N</span>
              </div>
              <span style={{ ...EYEBROW, color: "#C8965A" }}>Edge</span>
            </div>
            <p style={{ ...SERIF(15, "rgba(242,241,237,0.85)"), fontStyle: "italic", lineHeight: 1.55 }}>
              &ldquo;Supplements are the last 5%. Food, sleep and training are the 95%. But the right 5% at our age is worth getting right.&rdquo;
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SUPPS.map((s) => (
              <button key={s.id} onClick={() => toggleSupp(s.id)} className="pressable"
                style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 18px", background: "#171B21", border: `1px solid ${supps[s.id] ? "rgba(52,211,153,0.2)" : "#252A32"}`, borderRadius: 16, cursor: "pointer", transition: "border-color 0.15s" }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, border: `2px solid ${supps[s.id] ? "#34D399" : "#3D434D"}`, background: supps[s.id] ? "#34D399" : "transparent", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                  {supps[s.id] && <svg viewBox="0 0 24 24" fill="none" stroke="#0E1014" strokeWidth={3} style={{ width: 13, height: 13 }}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 14, color: "#F2F1ED", marginBottom: 2 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: "#9BA3AF", fontFamily: "Inter, sans-serif", marginBottom: 5 }}>{s.dose}</div>
                  <div style={{ fontSize: 12, color: "#C8965A", fontFamily: "Inter, sans-serif", lineHeight: 1.4 }}>{s.why}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── PORTION MODAL ── */}
      {portionItem && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setPortionItem(null); }}
          style={{ position: "fixed", inset: 0, background: "rgba(14,16,20,0.75)", zIndex: 50, display: "flex", alignItems: "flex-end" }}>
          <div style={{ background: "#13161A", width: "100%", maxWidth: 480, margin: "0 auto", borderRadius: "24px 24px 0 0", padding: "28px 24px 44px", maxHeight: "80vh", overflowY: "auto" }}>
            <p style={{ ...EYEBROW, color: "#C8965A", marginBottom: 6 }}>Add to log</p>
            <h2 style={{ ...SERIF(22), marginBottom: 4 }}>{portionItem.name.split(" · ")[0]}</h2>
            <p style={{ fontSize: 12, color: "#9BA3AF", fontFamily: "Inter, sans-serif", marginBottom: 20 }}>{portionItem.kcal} kcal · {portionItem.protein}g protein per 100g</p>

            <div style={{ display: "flex", alignItems: "center", gap: 20, justifyContent: "center", marginBottom: 12 }}>
              <button onClick={() => setPortionGrams(Math.max(10, portionGrams - 10))}
                style={{ width: 44, height: 44, borderRadius: "50%", border: "1.5px solid #252A32", background: "#171B21", fontSize: 22, cursor: "pointer", color: "#F2F1ED", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
              <div style={{ textAlign: "center", minWidth: 80 }}>
                <span style={{ ...SERIF(36) }}>{portionGrams}</span>
                <span style={{ fontSize: 14, color: "#9BA3AF", marginLeft: 4 }}>g</span>
              </div>
              <button onClick={() => setPortionGrams(portionGrams + 10)}
                style={{ width: 44, height: 44, borderRadius: "50%", border: "1.5px solid #252A32", background: "#171B21", fontSize: 22, cursor: "pointer", color: "#F2F1ED", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            </div>

            <div style={{ textAlign: "center", fontSize: 13, color: "#9BA3AF", fontFamily: "Inter, sans-serif", marginBottom: 20 }}>
              {Math.round(portionItem.kcal * portionGrams / 100)} kcal · {Math.round(portionItem.protein * portionGrams / 100)}g P · {Math.round(portionItem.carbs * portionGrams / 100)}g C · {Math.round(portionItem.fat * portionGrams / 100)}g F
            </div>

            <div style={{ display: "flex", border: "1px solid #252A32", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
              {["Breakfast", "Lunch", "Dinner", "Snack"].map((m) => (
                <button key={m} onClick={() => setPortionMeal(m)}
                  style={{ flex: 1, padding: "11px 4px", background: portionMeal === m ? "#F2F1ED" : "#171B21", border: "none", fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 10, color: portionMeal === m ? "#0E1014" : "#9BA3AF", cursor: "pointer", transition: "all 0.15s" }}>
                  {m}
                </button>
              ))}
            </div>

            <button onClick={addPortion}
              style={{ width: "100%", background: "#C8965A", borderRadius: 14, padding: "16px", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: 15, fontWeight: 600, color: "#0E1014", marginBottom: 10 }}>
              Add to {portionMeal}
            </button>
            <button onClick={() => setPortionItem(null)}
              style={{ width: "100%", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#9BA3AF", fontFamily: "Inter, sans-serif", padding: "8px 0" }}>
              cancel
            </button>
          </div>
        </div>
      )}

      {/* ── RECIPE MODAL ── */}
      {recipeModal && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setRecipeModal(null); }}
          style={{ position: "fixed", inset: 0, background: "rgba(14,16,20,0.75)", zIndex: 50, display: "flex", alignItems: "flex-end" }}>
          <div style={{ background: "#13161A", width: "100%", maxWidth: 480, margin: "0 auto", borderRadius: "24px 24px 0 0", padding: "28px 24px 44px", maxHeight: "88vh", overflowY: "auto" }}>
            <div style={{ textAlign: "center", marginBottom: 6 }}><span style={{ fontSize: 48 }}>{recipeModal.emoji}</span></div>
            <p style={{ ...EYEBROW, color: "#C8965A", textAlign: "center", marginBottom: 6 }}>{recipeModal.tag}</p>
            <h2 style={{ ...SERIF(24), textAlign: "center", marginBottom: 8 }}>{recipeModal.name}</h2>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, fontSize: 12, color: "#9BA3AF", fontFamily: "Inter, sans-serif", marginBottom: 18 }}>
              <span><span style={{ color: "#F2F1ED", fontWeight: 600 }}>{recipeModal.kcal}</span> kcal</span>
              <span><span style={{ color: "#C8965A", fontWeight: 600 }}>{recipeModal.p}g</span> protein</span>
              <span>{recipeModal.time} min</span>
            </div>
            <p style={{ ...SERIF(15, "rgba(242,241,237,0.7)"), fontStyle: "italic", lineHeight: 1.55, marginBottom: 20 }}>{recipeModal.desc}</p>
            <p style={{ ...EYEBROW, marginBottom: 14 }}>Method</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {recipeModal.steps.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 12 }}>
                  <span style={{ ...SERIF(14, "#C8965A"), flexShrink: 0, width: 16, fontWeight: 600 }}>{i + 1}</span>
                  <span style={{ fontSize: 14, color: "rgba(242,241,237,0.8)", fontFamily: "Inter, sans-serif", lineHeight: 1.5 }}>{s}</span>
                </div>
              ))}
            </div>
            <button onClick={() => logRecipe(recipeModal)}
              style={{ width: "100%", background: "#C8965A", borderRadius: 14, padding: "16px", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: 15, fontWeight: 600, color: "#0E1014", marginBottom: 10 }}>
              Log this meal
            </button>
            <button onClick={() => setRecipeModal(null)}
              style={{ width: "100%", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#9BA3AF", fontFamily: "Inter, sans-serif", padding: "8px 0" }}>
              close
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div style={{ position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)", background: "#F2F1ED", color: "#0E1014", padding: "12px 22px", borderRadius: 30, fontSize: 13, fontWeight: 600, fontFamily: "Inter, sans-serif", zIndex: 99, boxShadow: "0 8px 30px rgba(0,0,0,0.4)", whiteSpace: "nowrap" }}>
          {toastMsg}
        </div>
      )}
    </div>
  );
}

async function resizeImage(dataUrl: string, maxPx: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82).split(",")[1]);
    };
    img.src = dataUrl;
  });
}
