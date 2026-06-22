import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ProgressPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: programme },
    { data: checkIns },
    { data: sessions },
    { data: lessonCompletions },
    { data: sleepLogs },
    { data: exerciseLogs },
  ] = await Promise.all([
    supabase.from("programme_state").select("*").eq("user_id", user!.id).single(),
    supabase.from("check_ins").select("*").eq("user_id", user!.id).gte("created_at", thirtyDaysAgo).order("date", { ascending: true }),
    supabase.from("training_sessions").select("*").eq("user_id", user!.id).not("completed_at", "is", null).order("completed_at", { ascending: false }),
    supabase.from("lesson_completions").select("*").eq("user_id", user!.id),
    supabase.from("sleep_logs").select("*").eq("user_id", user!.id).order("date", { ascending: false }).limit(14),
    supabase.from("exercise_logs").select("exercise_name, weight_kg, reps, created_at").eq("user_id", user!.id).not("weight_kg", "is", null).gt("weight_kg", 0).order("created_at", { ascending: true }).limit(500),
  ]);

  const totalSessions = (sessions ?? []).length;
  const currentDay = programme?.current_day ?? 1;
  const currentWeek = programme?.current_week ?? 1;

  const last4Weeks = (sessions ?? []).filter((s) => {
    const d = new Date(s.completed_at!);
    return d > new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
  }).length;
  const consistencyPct = Math.round((last4Weeks / 12) * 100);

  const avgEnergy = checkIns && checkIns.length
    ? (checkIns.reduce((s, c) => s + c.morning_energy, 0) / checkIns.length).toFixed(1)
    : "—";
  const avgSleep = sleepLogs && sleepLogs.length
    ? (sleepLogs.reduce((s, l) => s + (l.quality ?? 0), 0) / sleepLogs.length).toFixed(1)
    : "—";

  const checkInStreak = (() => {
    if (!checkIns || checkIns.length === 0) return 0;
    let streak = 0;
    const sorted = [...checkIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const today = new Date().toISOString().split("T")[0];
    let expect = today;
    for (const c of sorted) {
      if (c.date === expect) {
        streak++;
        const d = new Date(expect);
        d.setDate(d.getDate() - 1);
        expect = d.toISOString().split("T")[0];
      } else break;
    }
    return streak;
  })();

  const energyPoints = (checkIns ?? []).slice(-14).map((c) => c.morning_energy);
  const maxEnergy = Math.max(...energyPoints, 1);

  // Weight trend (logged at daily check-in)
  const weightSeries = (checkIns ?? [])
    .filter((c) => c.weight_kg != null)
    .map((c) => ({ date: c.date, kg: Number(c.weight_kg) }));
  const latestWeight = weightSeries.length ? weightSeries[weightSeries.length - 1].kg : null;
  const firstWeight = weightSeries.length ? weightSeries[0].kg : null;
  const weightDelta = latestWeight != null && firstWeight != null ? +(latestWeight - firstWeight).toFixed(1) : null;
  const maxW2 = weightSeries.length ? Math.max(...weightSeries.map((w) => w.kg)) : 0;
  const minW2 = weightSeries.length ? Math.min(...weightSeries.map((w) => w.kg)) : 0;

  const lessonsCompleted = (lessonCompletions ?? []).length;
  const totalLessonsInCycle = 30;
  const lessonPct = Math.round((lessonsCompleted / totalLessonsInCycle) * 100);

  // Strength progress: group by exercise, get max weight per date
  const strengthMap = new Map<string, Array<{ date: string; weight: number; reps: number | null }>>();
  for (const log of exerciseLogs ?? []) {
    if (!log.weight_kg) continue;
    const date = log.created_at.split("T")[0];
    if (!strengthMap.has(log.exercise_name)) strengthMap.set(log.exercise_name, []);
    const arr = strengthMap.get(log.exercise_name)!;
    const existing = arr.find((e) => e.date === date);
    if (existing) {
      if (log.weight_kg > existing.weight) { existing.weight = log.weight_kg; existing.reps = log.reps; }
    } else {
      arr.push({ date, weight: log.weight_kg, reps: log.reps });
    }
  }
  type ExPoint = { date: string; weight: number; reps: number | null };
  // Sort each exercise's data by date and pick top exercises by data points
  const topExercises = Array.from(strengthMap.entries())
    .map(([name, data]) => ({ name, data: (data as ExPoint[]).sort((a, b) => a.date.localeCompare(b.date)) }))
    .filter((e) => e.data.length >= 1)
    .sort((a, b) => b.data.length - a.data.length)
    .slice(0, 8);

  return (
    <div className="max-w-lg mx-auto px-4 pt-safe pb-6">
      <div className="py-4 mb-2">
        <h1 className="font-condensed font-black text-4xl uppercase tracking-wide">Progress</h1>
        <p className="text-edge-muted text-sm mt-1">Week {currentWeek} · Day {currentDay} of 90</p>
      </div>

      {/* Key stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-edge-surface rounded-xl p-4 border border-white/[0.08]">
          <p className="text-edge-muted text-xs uppercase tracking-widest font-condensed mb-2">Sessions</p>
          <p className="font-condensed font-black text-4xl text-white">{totalSessions}</p>
          <p className="text-edge-muted text-xs mt-1">Total completed</p>
        </div>
        <div className="bg-edge-surface rounded-xl p-4 border border-white/[0.08]">
          <p className="text-edge-muted text-xs uppercase tracking-widest font-condensed mb-2">Consistency</p>
          <p className="font-condensed font-black text-4xl" style={{ color: consistencyPct >= 80 ? "#10B981" : consistencyPct >= 60 ? "#F5A623" : "#E8291C" }}>
            {consistencyPct}%
          </p>
          <p className="text-edge-muted text-xs mt-1">Last 4 weeks</p>
        </div>
        <div className="bg-edge-surface rounded-xl p-4 border border-white/[0.08]">
          <p className="text-edge-muted text-xs uppercase tracking-widest font-condensed mb-2">Avg Energy</p>
          <p className="font-condensed font-black text-4xl text-edge-gold">{avgEnergy}</p>
          <p className="text-edge-muted text-xs mt-1">Out of 5 · 30 days</p>
        </div>
        <div className="bg-edge-surface rounded-xl p-4 border border-white/[0.08]">
          <p className="text-edge-muted text-xs uppercase tracking-widest font-condensed mb-2">Streak</p>
          <p className="font-condensed font-black text-4xl text-edge-bronze">{checkInStreak}</p>
          <p className="text-edge-muted text-xs mt-1">Days check-in</p>
        </div>
      </div>

      {/* Weight trend */}
      {latestWeight != null && (
        <div className="bg-edge-surface rounded-xl p-4 border border-white/[0.08] mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted">Weight</p>
            {weightDelta != null && weightSeries.length > 1 && (
              <span className="text-xs font-condensed" style={{ color: weightDelta < 0 ? "#10B981" : weightDelta > 0 ? "#E8291C" : "#9BA3AF" }}>
                {weightDelta > 0 ? "+" : ""}{weightDelta} kg since start
              </span>
            )}
          </div>
          <p className="font-condensed font-black text-4xl text-white">
            {latestWeight}<span className="text-lg text-edge-muted"> kg</span>
          </p>
          {weightSeries.length > 1 && (
            <div className="flex items-end gap-1 h-16 mt-3">
              {weightSeries.slice(-14).map((w, i) => {
                const range = (maxW2 - minW2) || 1;
                const h = 20 + ((w.kg - minW2) / range) * 80;
                return <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, backgroundColor: "#C8965A", opacity: 0.8 }} />;
              })}
            </div>
          )}
          <p className="text-edge-muted text-xs mt-2">Logged at your daily check-in</p>
        </div>
      )}

      {/* Energy trend chart */}
      {energyPoints.length > 1 && (
        <div className="bg-edge-surface rounded-xl p-4 border border-white/[0.08] mb-6">
          <p className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted mb-3">
            Energy Trend (14 days)
          </p>
          <div className="flex items-end gap-1 h-16">
            {energyPoints.map((e, i) => (
              <div key={i} className="flex-1 rounded-sm transition-all" style={{
                height: `${(e / maxEnergy) * 100}%`,
                backgroundColor: e >= 4 ? "#10B981" : e >= 3 ? "#F5A623" : "#E8291C",
                opacity: 0.8,
              }} />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-edge-muted text-xs">14 days ago</span>
            <span className="text-edge-muted text-xs">Today</span>
          </div>
        </div>
      )}

      {/* Strength Progress */}
      {topExercises.length > 0 && (
        <div className="mb-6">
          <p className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted mb-3">Strength Progress</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topExercises.map(({ name, data }: { name: string; data: ExPoint[] }) => {
              const latest = data[data.length - 1];
              const first = data[0];
              const maxW = Math.max(...data.map((d: ExPoint) => d.weight));
              const minW = Math.min(...data.map((d: ExPoint) => d.weight));
              const range = maxW - minW || 1;
              const gain = latest.weight - first.weight;
              const shortName = name.replace(/\s*\([^)]*\)/g, "").trim();
              return (
                <div key={name} style={{ background: "#171B21", borderRadius: 16, border: "1px solid #252A32", padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                      <p style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 15, color: "#F2F1ED", fontWeight: 400, lineHeight: 1.2 }}>{shortName}</p>
                      {latest.reps && (
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#9BA3AF", marginTop: 2 }}>Last: {latest.reps} reps</p>
                      )}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 22, fontWeight: 700, color: "#F2F1ED", lineHeight: 1 }}>{latest.weight}<span style={{ fontSize: 12, fontWeight: 400, color: "#9BA3AF" }}> kg</span></p>
                      {gain !== 0 && (
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: gain > 0 ? "#34D399" : "#E8291C", marginTop: 2 }}>
                          {gain > 0 ? "+" : ""}{gain}kg
                        </p>
                      )}
                    </div>
                  </div>
                  {data.length > 1 && (
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 36 }}>
                      {data.map((d: ExPoint, i: number) => (
                        <div
                          key={i}
                          title={`${d.date}: ${d.weight}kg`}
                          style={{
                            flex: 1,
                            borderRadius: 3,
                            minHeight: 4,
                            height: `${Math.max(15, ((d.weight - minW) / range) * 100)}%`,
                            background: i === data.length - 1 ? "#C8965A" : "rgba(200,150,90,0.3)",
                            transition: "height 0.2s",
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {data.length === 1 && (
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#3D434D" }}>Log more sessions to see your trend</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Programme progress */}
      <div className="bg-edge-surface rounded-xl p-4 border border-white/[0.08] mb-6">
        <div className="flex justify-between items-center mb-3">
          <p className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted">Programme</p>
          <p className="text-white text-xs font-condensed">Day {currentDay}/90</p>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-edge-bronze rounded-full" style={{ width: `${(currentDay / 90) * 100}%` }} />
        </div>
        <p className="text-edge-muted text-xs">{Math.round((currentDay / 90) * 100)}% complete</p>
      </div>

      {/* STRONG System progress */}
      <div className="bg-edge-surface rounded-xl p-4 border border-white/[0.08] mb-6">
        <div className="flex justify-between items-center mb-3">
          <p className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted">STRONG System</p>
          <p className="text-white text-xs font-condensed">{lessonsCompleted}/{totalLessonsInCycle}</p>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-edge-gold rounded-full" style={{ width: `${lessonPct}%` }} />
        </div>
        <p className="text-edge-muted text-xs">{lessonPct}% of Cycle 1 complete</p>
      </div>

      {/* Sleep */}
      <div className="bg-edge-surface rounded-xl p-4 border border-white/[0.08] mb-6">
        <div className="flex justify-between items-center mb-3">
          <p className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted">Sleep Quality</p>
          <Link href="/sleep" className="text-xs text-edge-gold font-body">Log sleep</Link>
        </div>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="font-condensed font-black text-3xl text-white">{avgSleep}</span>
          <span className="text-edge-muted text-sm">/10 avg</span>
        </div>
        {sleepLogs && sleepLogs.length > 0 && (
          <div className="flex items-end gap-1 h-8">
            {sleepLogs.slice(0, 14).reverse().map((s, i) => (
              <div key={i} className="flex-1 rounded-sm bg-edge-gold/50" style={{ height: `${((s.quality ?? 5) / 10) * 100}%` }} />
            ))}
          </div>
        )}
      </div>

      {/* Weekly review */}
      <Link href="/weekly-review">
        <div className="bg-edge-surface rounded-xl p-4 border border-edge-gold/30 flex items-center gap-4 active:bg-white/5">
          <div className="w-10 h-10 rounded-lg bg-edge-gold/20 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-edge-gold">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-condensed font-bold text-sm uppercase tracking-wide text-white">Weekly Review</p>
            <p className="text-edge-muted text-xs">5 minutes. Be honest.</p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-edge-muted flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </div>
  );
}
