
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { RECIPES, type Recipe } from "@/lib/recipes";

interface NutritionLog {
  id: string;
  meal_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  edge_comment: string;
  created_at: string;
}

const PROTEIN_TARGET = 160;
const CALORIE_TARGET = 2200;

export default function NutritionPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"today" | "cookbook" | "road">("today");
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [analysing, setAnalysing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [latest, setLatest] = useState<NutritionLog | null>(null);
  const [error, setError] = useState("");
  const [openRecipe, setOpenRecipe] = useState<Recipe | null>(null);

  useEffect(() => { loadTodaysLogs(); }, []);

  async function loadTodaysLogs() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("nutrition_logs").select("*").eq("user_id", user.id).eq("date", today)
      .order("created_at", { ascending: false });
    if (data) setLogs(data);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(""); setLatest(null);
    const reader = new FileReader();
    reader.onload = () => { const dataUrl = reader.result as string; setPreview(dataUrl); analyseImage(file, dataUrl); };
    reader.readAsDataURL(file);
  }

  async function analyseImage(file: File, dataUrl: string) {
    setAnalysing(true);
    try {
      const base64 = await resizeImage(dataUrl, 1024);
      const mimeType = file.type || "image/jpeg";
      const res = await fetch("/api/nutrition/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: base64, mimeType }) });
      if (!res.ok) { const err = await res.json(); setError(err.error || "Analysis failed. Try a clearer photo."); return; }
      const log: NutritionLog = await res.json();
      setLatest(log); setLogs((prev) => [log, ...prev]);
    } catch { setError("Something went wrong. Check your connection and try again."); }
    finally { setAnalysing(false); setPreview(null); if (fileRef.current) fileRef.current.value = ""; }
  }

  async function deleteLog(id: string) {
    const supabase = createClient();
    await supabase.from("nutrition_logs").delete().eq("id", id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
    if (latest?.id === id) setLatest(null);
  }

  const totalProtein = logs.reduce((s, l) => s + l.protein_g, 0);
  const totalCalories = logs.reduce((s, l) => s + l.calories, 0);
  const totalCarbs = logs.reduce((s, l) => s + l.carbs_g, 0);
  const totalFat = logs.reduce((s, l) => s + l.fat_g, 0);
  const proteinPct = Math.min((totalProtein / PROTEIN_TARGET) * 100, 100);
  const caloriePct = Math.min((totalCalories / CALORIE_TARGET) * 100, 100);
  const breakfasts = RECIPES.filter((r) => r.section === "breakfast");
  const mains = RECIPES.filter((r) => r.section === "main");

  if (openRecipe) return <RecipeDetail recipe={openRecipe} onBack={() => setOpenRecipe(null)} />;

  return (
    <div className="min-h-screen bg-edge-bg max-w-lg mx-auto px-4 pt-safe pb-24">
      <div className="flex items-center gap-3 py-4 mb-4">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-edge-surface border border-white/10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h1 className="font-display text-3xl leading-none">Fuel</h1>
          <p className="text-edge-muted text-xs">Track & cook</p>
        </div>
      </div>

      <div className="flex bg-edge-surface rounded-xl p-1 mb-6 border border-white/[0.08]">
        <button onClick={() => setTab("today")} className={`flex-1 py-2 rounded-lg font-condensed font-bold text-xs uppercase tracking-widest transition-all ${tab === "today" ? "bg-edge-gold text-white" : "text-edge-muted"}`}>Today</button>
        <button onClick={() => setTab("cookbook")} className={`flex-1 py-2 rounded-lg font-condensed font-bold text-xs uppercase tracking-widest transition-all ${tab === "cookbook" ? "bg-edge-gold text-white" : "text-edge-muted"}`}>Cookbook</button>
        <button onClick={() => setTab("road")} className={`flex-1 py-2 rounded-lg font-condensed font-bold text-xs uppercase tracking-widest transition-all ${tab === "road" ? "bg-edge-gold text-white" : "text-edge-muted"}`}>On The Road</button>
      </div>

      {tab === "today" && (
        <>
          <button onClick={() => fileRef.current?.click()} disabled={analysing} className="w-full bg-edge-gold rounded-2xl p-5 flex items-center gap-4 mb-6 active:scale-[0.98] transition-transform disabled:opacity-60">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              {analysing ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>
            <div className="text-left">
              <p className="font-condensed font-bold text-xl uppercase tracking-wide text-white leading-none">{analysing ? "Analysing..." : "Snap Your Meal"}</p>
              <p className="text-white/70 text-sm mt-0.5">{analysing ? "Edge is reading your plate" : "AI reads the plate — you get the macros"}</p>
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />

          {preview && analysing && (
            <div className="mb-6 rounded-2xl overflow-hidden border border-white/10 relative">
              <img src={preview} alt="Meal preview" className="w-full object-cover max-h-48" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-edge-gold border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-white text-sm font-condensed font-bold uppercase tracking-wide">Reading your plate...</p>
                </div>
              </div>
            </div>
          )}

          {error && <div className="mb-6 bg-edge-gold/10 border border-edge-gold/30 rounded-xl p-4"><p className="text-edge-gold text-sm">{error}</p></div>}

          {latest && !analysing && (
            <div className="mb-6 bg-edge-surface rounded-2xl border border-edge-gold/30 overflow-hidden">
              <div className="bg-edge-gold/10 px-4 py-3 flex items-center gap-2 border-b border-edge-gold/20">
                <div className="w-6 h-6 rounded-full bg-edge-gold flex items-center justify-center flex-shrink-0"><span className="font-condensed font-black text-xs text-edge-bg">E</span></div>
                <p className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-gold">Edge says</p>
              </div>
              <div className="p-4">
                <p className="font-condensed font-bold text-lg text-white mb-1">{latest.meal_name}</p>
                <p className="text-white/70 text-sm leading-relaxed mb-4">{latest.edge_comment}</p>
                <div className="grid grid-cols-4 gap-2">
                  <MacroCell label="Cal" value={latest.calories} unit="" highlight />
                  <MacroCell label="Protein" value={latest.protein_g} unit="g" />
                  <MacroCell label="Carbs" value={latest.carbs_g} unit="g" />
                  <MacroCell label="Fat" value={latest.fat_g} unit="g" />
                </div>
              </div>
            </div>
          )}

          {logs.length > 0 && (
            <div className="bg-edge-surface rounded-xl p-4 border border-white/[0.08] mb-6">
              <p className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted mb-4">Today's Totals</p>
              <div className="mb-4">
                <div className="flex justify-between mb-1"><span className="text-white text-sm font-condensed font-bold">Protein</span><span className="text-edge-muted text-xs">{Math.round(totalProtein)}g / {PROTEIN_TARGET}g</span></div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${proteinPct}%`, backgroundColor: totalProtein >= PROTEIN_TARGET ? "#10B981" : "#F5A623" }} /></div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between mb-1"><span className="text-white text-sm font-condensed font-bold">Calories</span><span className="text-edge-muted text-xs">{Math.round(totalCalories)} / {CALORIE_TARGET}</span></div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-edge-gold rounded-full transition-all" style={{ width: `${caloriePct}%` }} /></div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
                <div className="text-center"><p className="font-condensed font-bold text-lg text-white">{Math.round(totalProtein)}g</p><p className="text-edge-muted text-xs">Protein</p></div>
                <div className="text-center"><p className="font-condensed font-bold text-lg text-white">{Math.round(totalCarbs)}g</p><p className="text-edge-muted text-xs">Carbs</p></div>
                <div className="text-center"><p className="font-condensed font-bold text-lg text-white">{Math.round(totalFat)}g</p><p className="text-edge-muted text-xs">Fat</p></div>
              </div>
            </div>
          )}

          {logs.length > 0 && (
            <div className="mb-6">
              <p className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted mb-3">Today's Meals</p>
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="bg-edge-surface rounded-xl p-4 border border-white/[0.08]">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-condensed font-bold text-sm uppercase tracking-wide text-white">{log.meal_name}</p>
                      <button onClick={() => deleteLog(log.id)} className="text-edge-muted active:text-white flex-shrink-0 mt-0.5">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-edge-muted text-xs">{log.calories} cal</span>
                      <span className="text-edge-gold text-xs">{log.protein_g}g protein</span>
                      <span className="text-edge-muted text-xs">{log.carbs_g}g carbs</span>
                      <span className="text-edge-muted text-xs">{log.fat_g}g fat</span>
                    </div>
                    <p className="text-white/50 text-xs mt-1 leading-relaxed">{log.edge_comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {logs.length === 0 && !analysing && <div className="text-center py-8 mb-6"><p className="text-edge-muted text-sm">No meals logged today. Snap your first one.</p></div>}

          <Link href="/edge">
            <div className="bg-edge-surface rounded-xl p-4 border border-edge-gold/30 flex items-center gap-4 mb-6 active:bg-white/5">
              <div className="w-10 h-10 rounded-full bg-edge-gold flex items-center justify-center flex-shrink-0"><span className="font-condensed font-black text-sm text-edge-bg">E</span></div>
              <div className="flex-1"><p className="font-condensed font-bold text-sm uppercase tracking-wide">Ask Edge</p><p className="text-edge-muted text-xs">Pre-workout meals, travel food, what to eat on rest days...</p></div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-edge-muted flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </div>
          </Link>
        </>
      )}

      {tab === "cookbook" && (
        <div>
          <p className="text-edge-muted text-xs leading-relaxed mb-6">13 high-protein meals built for men who train. Protein first — that is the number that matters.</p>
          <RecipeSection title="Breakfast" recipes={breakfasts} onOpen={setOpenRecipe} />
          <RecipeSection title="Mains" recipes={mains} onOpen={setOpenRecipe} />
        </div>
      )}

      {tab === "road" && <FuelOnTheRoad />}
    </div>
  );
}

function RecipeSection({ title, recipes, onOpen }: { title: string; recipes: Recipe[]; onOpen: (r: Recipe) => void }) {
  return (
    <div className="mb-8">
      <p className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted mb-3">{title}</p>
      <div className="space-y-2">
        {recipes.map((recipe) => (
          <button key={recipe.id} onClick={() => onOpen(recipe)} className="w-full bg-edge-surface rounded-xl p-4 border border-white/[0.08] flex items-center gap-4 active:bg-white/5 text-left">
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-base text-white leading-snug">{recipe.title}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-condensed font-black text-base text-edge-gold">{recipe.macros_per_serving.protein_g}g</span>
                <span className="text-edge-muted text-xs">protein</span>
                <span className="text-white/30 text-xs">·</span>
                <span className="text-edge-muted text-xs">{recipe.macros_per_serving.calories} kcal</span>
                <span className="text-white/30 text-xs">·</span>
                <span className="text-edge-muted text-xs">serves {recipe.serves}</span>
              </div>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-edge-muted flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        ))}
      </div>
    </div>
  );
}

function RecipeDetail({ recipe, onBack }: { recipe: Recipe; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-edge-bg max-w-lg mx-auto px-4 pt-safe pb-24">
      <div className="flex items-center gap-3 py-4 mb-6">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-edge-surface border border-white/10 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <p className="text-edge-muted text-xs font-condensed uppercase tracking-widest">{recipe.section === "breakfast" ? "Breakfast" : "Mains"}</p>
      </div>
      <h1 className="font-display font-semibold text-4xl leading-tight text-white mb-6">{recipe.title}</h1>
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="col-span-1 bg-edge-gold/10 border border-edge-gold/30 rounded-xl p-3 text-center">
          <p className="font-condensed font-black text-2xl text-edge-gold leading-none">{recipe.macros_per_serving.protein_g}g</p>
          <p className="text-edge-gold/70 text-xs mt-1">protein</p>
        </div>
        <div className="bg-edge-surface border border-white/[0.08] rounded-xl p-3 text-center"><p className="font-condensed font-bold text-lg text-white leading-none">{recipe.macros_per_serving.calories}</p><p className="text-edge-muted text-xs mt-1">kcal</p></div>
        <div className="bg-edge-surface border border-white/[0.08] rounded-xl p-3 text-center"><p className="font-condensed font-bold text-lg text-white leading-none">{recipe.macros_per_serving.carbs_g}g</p><p className="text-edge-muted text-xs mt-1">carbs</p></div>
        <div className="bg-edge-surface border border-white/[0.08] rounded-xl p-3 text-center"><p className="font-condensed font-bold text-lg text-white leading-none">{recipe.macros_per_serving.fat_g}g</p><p className="text-edge-muted text-xs mt-1">fat</p></div>
      </div>
      <p className="text-edge-muted text-xs mb-8">Per serving · estimated · serves {recipe.serves}</p>
      <div className="mb-8">
        <p className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted mb-4">Ingredients</p>
        <div className="space-y-5">
          {recipe.ingredient_groups.map((group, gi) => (
            <div key={gi}>
              {group.heading && <p className="font-condensed font-bold text-xs uppercase tracking-widest text-white/60 mb-2">{group.heading}</p>}
              <ul className="space-y-2">
                {group.items.map((item, ii) => (
                  <li key={ii} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-edge-gold flex-shrink-0 mt-2" />
                    <span className="text-white/80 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-8">
        <p className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted mb-4">Method</p>
        <ol className="space-y-4">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-4">
              <span className="font-condensed font-black text-base text-edge-gold flex-shrink-0 w-5 text-right leading-relaxed">{i + 1}</span>
              <span className="text-white/80 text-sm leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </div>
      {recipe.note && (
        <div className="bg-edge-surface border-l-2 border-edge-gold/60 rounded-r-xl px-4 py-3 mb-8">
          <p className="text-white/70 text-xs leading-relaxed"><span className="font-bold text-edge-gold">Note — </span>{recipe.note}</p>
        </div>
      )}
    </div>
  );
}

function FuelOnTheRoad() {
  const green = [
    { name: "King prawns — 100g pot", note: "The leanest grab going. Zero carbs", protein: "~20g", kcal: "~90 kcal" },
    { name: "Tuna or mackerel in spring water", note: "Mackerel brings omega-3 with it", protein: "~25g", kcal: "~110 kcal" },
    { name: "Cooked chicken breast / slices", note: "Best all-rounder", protein: "~28g", kcal: "~165 kcal" },
    { name: "Plain high-protein yoghurt / skyr", note: "Go natural — flavoured pots hide ~13g sugar", protein: "~18g", kcal: "~100 kcal" },
    { name: "Turkey or lean ham slices", note: "Skip the honey-glazed ones", protein: "~20g", kcal: "~110 kcal" },
    { name: "Lean biltong — 35g bag", note: "Clean and chewy — one bag, not three", protein: "~17g", kcal: "~110 kcal" },
    { name: "Boiled eggs × 2", note: "Two is plenty — fat lives in the yolk", protein: "12g", kcal: "~155 kcal" },
  ];
  const amber = [
    { name: "Cheese / Babybel", note: "73% fat calories. One or two max", protein: "~5g ea", kcal: "~70 kcal ea" },
    { name: "Whole-milk Greek yoghurt", note: "Plain skyr gives more protein for fewer calories", protein: "~15g", kcal: "~180 kcal" },
    { name: "Protein bar (Grenade Carb Killa)", note: "Controlled treat, not a staple", protein: "~20g", kcal: "~220 kcal" },
    { name: "Flavoured protein yoghurt", note: "~13g sugar sneaks in", protein: "~20g", kcal: "~150 kcal" },
    { name: "Flavoured protein shake / milk", note: "Read the bottle — some hit 22g sugar", protein: "~20g", kcal: "150–225 kcal" },
  ];
  const venues = [
    { place: "Petrol Station", go: "Biltong · boiled eggs · chicken pieces · plain skyr · prawn pot", dodge: "Pastries · sweet jerky · nut bags · protein cookies", best: "Biltong + 2 eggs = ~30g protein / ~230 kcal" },
    { place: "Coffee Shop", go: "Pret egg/chicken protein pot · egg bites · plain yoghurt · flat white", dodge: "Muffins · paninis · frappes · sweet lattes", best: "Protein pot + flat white = ~22g protein / ~250 kcal" },
    { place: "Café / Greasy Spoon", go: "Poached eggs + grilled bacon + mushrooms + tomato · or 3-egg omelette", dodge: "Sausage · fried bread · hash brown · toast · beans", best: "Omelette + grilled bacon = ~28g protein / ~350 kcal" },
    { place: "Supermarket / M&S / Tesco", go: "Roast chicken pieces · prawn pot · plain skyr · edamame", dodge: "Meal-deal combo · big sweet shakes · mass-gainer bars", best: "Chicken pieces + plain skyr = ~45g protein / ~270 kcal" },
  ];

  return (
    <div>
      <p className="text-edge-muted text-xs leading-relaxed mb-6">Protein when you're out and about. Quick, clean grabs that fill you up without blowing the day's calories. Chase high protein, low calories — that's the game.</p>

      <div className="bg-edge-surface rounded-xl p-4 border border-edge-gold/30 mb-6">
        <p className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-gold mb-1">The Dream Grab</p>
        <p className="text-white font-display text-lg leading-snug">Prawns + plain skyr</p>
        <p className="text-edge-muted text-xs mt-1">~40g protein · under 220 kcal · nothing on the road beats it</p>
      </div>

      <p className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted mb-3">Green — eat these first</p>
      <div className="space-y-2 mb-6">
        {green.map((item, i) => (
          <div key={i} className="bg-edge-surface rounded-xl p-4 border border-white/[0.08] flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-condensed font-bold">{item.name}</p>
              <p className="text-edge-muted text-xs mt-0.5">{item.note}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-emerald-400 font-condensed font-black text-sm">{item.protein}</p>
              <p className="text-edge-muted text-xs">{item.kcal}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted mb-3">Amber — good protein, watch calories</p>
      <div className="space-y-2 mb-6">
        {amber.map((item, i) => (
          <div key={i} className="bg-edge-surface rounded-xl p-4 border border-white/[0.08] flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-edge-gold flex-shrink-0 mt-1.5" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-condensed font-bold">{item.name}</p>
              <p className="text-edge-muted text-xs mt-0.5">{item.note}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-edge-gold font-condensed font-black text-sm">{item.protein}</p>
              <p className="text-edge-muted text-xs">{item.kcal}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-edge-surface rounded-xl p-4 border border-white/[0.08] mb-6">
        <p className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted mb-3">Red — avoid</p>
        {["Nuts by the handful — fat bomb, not protein", "Peperami / salami / chorizo — 79% fat calories", "Sweet / teriyaki jerky — reach for plain biltong", "Recovery shakes — 22g+ sugar", "Pastries, flapjacks, protein cookies", "The meal-deal autopilot — sandwich + crisps + fizzy = ~800 kcal"].map((item, i) => (
          <div key={i} className="flex items-start gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0 mt-1.5" />
            <p className="text-white/60 text-sm">{item}</p>
          </div>
        ))}
      </div>

      <p className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted mb-3">By Venue</p>
      <div className="space-y-3">
        {venues.map((v, i) => (
          <div key={i} className="bg-edge-surface rounded-xl p-4 border border-white/[0.08]">
            <p className="font-display text-base text-white mb-3">{v.place}</p>
            <div className="space-y-2">
              <div><span className="text-emerald-400 text-xs font-condensed font-bold uppercase tracking-wide">Go </span><span className="text-white/70 text-xs">{v.go}</span></div>
              <div><span className="text-red-400 text-xs font-condensed font-bold uppercase tracking-wide">Dodge </span><span className="text-white/70 text-xs">{v.dodge}</span></div>
              <div className="mt-2 bg-edge-gold/10 rounded-lg px-3 py-2 border border-edge-gold/20"><p className="text-edge-gold text-xs font-condensed font-bold">{v.best}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MacroCell({ label, value, unit, highlight }: { label: string; value: number; unit: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-2 text-center ${highlight ? "bg-edge-gold/10 border border-edge-gold/20" : "bg-white/5"}`}>
      <p className={`font-condensed font-bold text-lg leading-none ${highlight ? "text-edge-gold" : "text-white"}`}>{Math.round(value)}{unit}</p>
      <p className="text-edge-muted text-xs mt-0.5">{label}</p>
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
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82).split(",")[1]);
    };
    img.src = dataUrl;
  });
}
