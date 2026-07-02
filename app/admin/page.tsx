import { createAdminClient, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CommandCentre from "./CommandCentre";

const ADMIN_EMAILS = ["n.adams3@icloud.com", "nicosmada3@googlemail.com", "nick@back2strong.online"];

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) redirect("/login");

  const admin = createAdminClient();

  // Overnight cutoff — last 10 hours
  const cutoff = new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString();

  const [
    { data: profiles },
    { data: recentCheckIns },
    { data: recentMessages },
    { data: recentMealLogs },
    { data: tasks },
    { data: contentItems },
    { data: coachNotes },
    { data: lastCheckIns },
  ] = await Promise.all([
    admin.from("profiles").select("id, full_name, email, approved, created_at").order("created_at", { ascending: false }),
    admin.from("check_ins").select("*, profiles(full_name)").gte("created_at", cutoff).order("created_at", { ascending: false }),
    admin.from("messages").select("*, profiles(full_name)").eq("role", "user").gte("created_at", cutoff).order("created_at", { ascending: false }).limit(20),
    admin.from("nutrition_logs").select("*, profiles(full_name)").gte("created_at", cutoff).order("created_at", { ascending: false }).limit(20),
    admin.from("admin_tasks").select("*").order("position", { ascending: true }),
    admin.from("content_calendar").select("*").gte("date", new Date().toISOString().split("T")[0]).order("date", { ascending: true }).limit(14),
    admin.from("coach_notes").select("*").order("created_at", { ascending: false }).limit(10),
    admin.from("check_ins").select("user_id, date, profiles(full_name)").order("date", { ascending: false }).limit(200),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pending = (profiles ?? []).filter((p: any) => !p.approved);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const active = (profiles ?? []).filter((p: any) => p.approved);

  // Build last-check-in map per user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastCheckInMap: Record<string, string> = {};
  for (const c of (lastCheckIns ?? [])) {
    if (!lastCheckInMap[c.user_id]) lastCheckInMap[c.user_id] = c.date;
  }

  // Attach last check-in date to active profiles
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeWithActivity = active.map((p: any) => ({
    ...p,
    last_check_in: lastCheckInMap[p.id] ?? null,
  }));

  return (
    <CommandCentre
      active={activeWithActivity}
      pending={pending}
      recentCheckIns={recentCheckIns ?? []}
      recentMessages={recentMessages ?? []}
      recentMealLogs={Array.isArray(recentMealLogs) ? recentMealLogs : []}
      tasks={Array.isArray(tasks) ? tasks : []}
      contentItems={Array.isArray(contentItems) ? contentItems : []}
      coachNotes={Array.isArray(coachNotes) ? coachNotes.filter((n) => !String((n as { tag?: string }).tag ?? "").startsWith("audit:")) : []}
    />
  );
}
