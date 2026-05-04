import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getGreeting, formatDate } from "@/lib/utils";
import { getLesson } from "@/lib/data/lessons";

export default async function HomePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: programme }, { data: todayCheckin }, { data: recentSessions }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user!.id).single(),
      supabase.from("programme_state").select("*").eq("user_id", user!.id).single(),
      supabase.from("check_ins").select("*").eq("user_id", user!.id).eq("date", new Date().toISOString().split("T")[0]).single(),
      supabase.from("training_sessions").select("*").eq("user_id", user!.id).not("completed_at", "is", null).order("completed_at", { ascending: false }).limit(5),
    ]);

  const firstName = profile?.full_name?.split(" ")[0] ?? "mate";
  const currentDay = programme?.current_day ?? 1;
  const currentWeek = programme?.current_week ?? 1;
  const todayLesson = getLesson(((currentDay - 1) % 30) + 1);

  const sessionsThisWeek = (recentSessions ?? []).filter((s) => {
    const d = new Date(s.completed_at!);
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    monday.setHours(0, 0, 0, 0);
    return d >= monday;
  }).length;

  const nextSessionType = sessionsThisWeek === 0 ? "push" : sessionsThisWeek === 1 ? "squat" : "pull";
  const sessionNames: Record<string, string> = {
    push: "Upper Body Push",
    squat: "Lower Body Squat",
    pull: "Upper Body Pull",
  };

  const phaseNames: Record<string, string> = {
    S: "Self-Confrontation",
    T: "Truth Mapping",
    R: "Reflective Evolution",
    O: "Ownership Routines",
    N: "Non-Negotiables",
    G: "Growth Loops",
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-safe">
      {/* Header */}
      <div className="flex items-center justify-between py-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-edge-red flex items-center justify-center">
            <span className="font-condensed font-black text-xs text-white tracking-wider">B2S</span>
          </div>
        </div>
        <Link href="/profile" className="w-9 h-9 rounded-full bg-edge-surface border border-white/10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-white/60">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </Link>
      </div>

      {/* Greeting */}
      <div className="mb-6">
        <p className="text-edge-muted text-sm font-body">{getGreeting()}, {firstName}</p>
        <h1 className="font-condensed font-black text-4xl uppercase tracking-wide leading-none mt-1">
          {formatDate(new Date())}
        </h1>
        <p className="text-edge-muted text-xs mt-1">
          Week {currentWeek} · Day {currentDay} · {todayLesson ? phaseNames[todayLesson.phaseCode] : "Foundation Phase"}
        </p>
      </div>

      {/* Edge Daily Message */}
      <EdgeDailyMessage userId={user!.id} />

      {/* Today's Actions */}
      <div className="space-y-3 mb-6">
        <h2 className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted">
          Today's Actions
        </h2>

        {/* Train */}
        <Link href={`/train/${nextSessionType}`}>
          <div className="bg-edge-surface rounded-xl p-4 flex items-center gap-4 border border-white/[0.08] active:bg-white/5">
            <div className="w-10 h-10 rounded-lg bg-edge-red/20 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-edge-red">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-condensed font-bold text-sm uppercase tracking-wide text-white">
                Today's Session
              </p>
              <p className="text-edge-muted text-xs mt-0.5 truncate">
                {sessionNames[nextSessionType]} · 45 min · 6 exercises
              </p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-edge-muted flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Mind */}
        {todayLesson && (
          <Link href={`/mind/${((currentDay - 1) % 30) + 1}`}>
            <div className="bg-edge-surface rounded-xl p-4 flex items-center gap-4 border border-white/[0.08] active:bg-white/5">
              <div className="w-10 h-10 rounded-lg bg-edge-gold/20 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-edge-gold">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-condensed font-bold text-sm uppercase tracking-wide text-white">
                  Day {((currentDay - 1) % 30) + 1} Lesson
                </p>
                <p className="text-edge-muted text-xs mt-0.5 truncate">
                  {todayLesson.title} · {todayLesson.phaseCode} Phase
                </p>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-edge-muted flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        )}

        {/* Check-in */}
        <Link href="/checkin">
          <div className={`bg-edge-surface rounded-xl p-4 flex items-center gap-4 border active:bg-white/5 ${todayCheckin ? "border-green-500/30" : "border-white/[0.08]"}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${todayCheckin ? "bg-green-500/20" : "bg-white/10"}`}>
              {todayCheckin ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-green-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-white/60">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-condensed font-bold text-sm uppercase tracking-wide text-white">
                Morning Check-in
              </p>
              <p className="text-edge-muted text-xs mt-0.5">
                {todayCheckin ? "Done today" : "60 seconds · Not done yet"}
              </p>
            </div>
            {!todayCheckin && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-edge-muted flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        </Link>
      </div>

      {/* Week progress */}
      <div className="bg-edge-surface rounded-xl p-4 border border-white/[0.08] mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted">
            This Week
          </p>
          <p className="text-white text-xs font-condensed font-bold">
            {sessionsThisWeek}<span className="text-edge-muted">/3 sessions</span>
          </p>
        </div>
        <div className="flex gap-2">
          {["Mon", "Wed", "Fri"].map((day, i) => (
            <div
              key={day}
              className={`flex-1 rounded-lg py-3 text-center ${
                i < sessionsThisWeek
                  ? "bg-edge-red/20 border border-edge-red/40"
                  : "bg-white/5 border border-white/10"
              }`}
            >
              <span className={`font-condensed font-bold text-xs uppercase ${i < sessionsThisWeek ? "text-edge-red" : "text-edge-muted"}`}>
                {day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Protein target quick card */}
      <div className="bg-edge-surface rounded-xl p-4 border border-white/[0.08] mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted">
            Protein Target
          </p>
          <Link href="/nutrition" className="text-xs text-edge-gold font-body">View</Link>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-condensed font-black text-3xl text-white">160</span>
          <span className="text-edge-muted text-sm">g / day</span>
        </div>
        <p className="text-edge-muted text-xs mt-1">Protein first. Everything else follows.</p>
      </div>
    </div>
  );
}

async function EdgeDailyMessage({ userId }: { userId: string }) {
  const supabase = createClient();
  const { data: messages } = await supabase
    .from("messages")
    .select("content")
    .eq("user_id", userId)
    .eq("role", "assistant")
    .order("created_at", { ascending: false })
    .limit(1);

  const lastMessage = messages?.[0]?.content;

  return (
    <div className="bg-edge-surface rounded-xl p-4 border-l-4 border-edge-gold mb-6 border-t border-r border-b border-white/[0.08]">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-edge-gold flex items-center justify-center flex-shrink-0">
          <span className="font-condensed font-black text-xs text-edge-bg tracking-wider">E</span>
        </div>
        <p className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-gold">
          Edge
        </p>
      </div>
      <p className="text-white/90 font-body text-sm leading-relaxed">
        {lastMessage ?? "Tap Edge below to start your first conversation."}
      </p>
    </div>
  );
}
