import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { SESSIONS } from "@/lib/data/training";

export default async function TrainPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: recentSessions } = await supabase
    .from("training_sessions")
    .select("*")
    .eq("user_id", user!.id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(10);

  const sessionsThisWeek = (recentSessions ?? []).filter((s) => {
    const d = new Date(s.completed_at!);
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    monday.setHours(0, 0, 0, 0);
    return d >= monday;
  });

  const completedTypes = new Set(sessionsThisWeek.map((s) => s.session_type));

  const sessionList = [
    { type: "push", label: "Session 1", name: "Upper Body Push", day: "Mon" },
    { type: "squat", label: "Session 2", name: "Lower Body Squat", day: "Wed" },
    { type: "pull", label: "Session 3", name: "Upper Body Pull", day: "Fri" },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 pt-safe">
      <div className="py-4 mb-2">
        <h1 className="font-condensed font-black text-4xl uppercase tracking-wide">Training</h1>
        <p className="text-edge-muted text-sm mt-1">3 sessions · 45 min each · This week</p>
      </div>

      {/* Week progress */}
      <div className="bg-edge-surface rounded-xl p-4 border border-white/[0.08] mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted">
            Week Progress
          </span>
          <span className="font-condensed font-bold text-sm text-white">
            {sessionsThisWeek.length}<span className="text-edge-muted">/3</span>
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-edge-red rounded-full transition-all"
            style={{ width: `${(sessionsThisWeek.length / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Sessions */}
      <div className="space-y-4 mb-6">
        {sessionList.map(({ type, label, name, day }) => {
          const done = completedTypes.has(type);
          const session = SESSIONS[type];
          return (
            <Link key={type} href={`/train/${type}`}>
              <div className={`bg-edge-surface rounded-xl p-4 border active:bg-white/5 ${done ? "border-green-500/30" : "border-white/[0.08]"}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${done ? "bg-green-500/20" : "bg-edge-red/20"}`}>
                    {done ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6 text-green-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6 text-edge-red">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-edge-muted text-xs font-condensed uppercase tracking-wide">{label} · {day}</span>
                      {done && <span className="text-xs text-green-400 font-condensed uppercase">Done</span>}
                    </div>
                    <h3 className="font-condensed font-bold text-xl uppercase tracking-wide text-white leading-none mb-1">
                      {name}
                    </h3>
                    <p className="text-edge-muted text-xs">
                      {session.exercises.length} exercises · 45 min · 4 main lifts
                    </p>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-edge-muted flex-shrink-0 mt-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent history */}
      {recentSessions && recentSessions.length > 0 && (
        <div className="mb-6">
          <h2 className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted mb-3">
            Recent Sessions
          </h2>
          <div className="space-y-2">
            {recentSessions.slice(0, 5).map((s) => (
              <div key={s.id} className="bg-edge-surface rounded-xl px-4 py-3 border border-white/[0.08] flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-white text-sm font-body capitalize">
                    {s.session_type === "push" ? "Upper Push" : s.session_type === "squat" ? "Lower Squat" : "Upper Pull"}
                  </span>
                </div>
                <span className="text-edge-muted text-xs">
                  {new Date(s.completed_at!).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
