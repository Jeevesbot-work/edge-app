import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { ClientProgramme, Programme, ProgrammeWeek } from "@/types";

const ADMIN_EMAILS = ["n.adams3@icloud.com", "nicosmada3@googlemail.com", "nick@back2strong.online"];

/**
 * Load the signed-in client's bespoke programme document from the database.
 * If an admin has set a preview_user_id cookie, load that user's programme instead.
 * Returns null when the client has no programme assigned yet.
 */
export async function getClientProgramme(userId: string): Promise<ClientProgramme | null> {
  const cookieStore = cookies();
  const previewId = cookieStore.get("preview_user_id")?.value;

  // Admin preview mode — load another client's programme
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = ADMIN_EMAILS.includes(user?.email ?? "");
  const effectiveId = (isAdmin && previewId) ? previewId : userId;

  const client = (isAdmin && previewId) ? createAdminClient() : createClient();
  const { data } = await client
    .from("client_programmes")
    .select("programme, sessions")
    .eq("user_id", effectiveId)
    .maybeSingle();

  if (!data?.programme) return null;
  return {
    programme: data.programme as Programme,
    sessions: (data.sessions ?? {}) as ClientProgramme["sessions"],
  };
}

/** Clamp a week number to the programme's length and return that week's progression row. */
export function getProgrammeWeek(programme: Programme, currentWeek: number): ProgrammeWeek {
  const idx = Math.max(0, Math.min(currentWeek - 1, programme.lengthWeeks - 1));
  return programme.progression[idx];
}

/**
 * Effective number of working sets for a given week, taken from the programme's
 * progression (first integer in the "sets" string, e.g. "2-3" → 2). Returns null
 * if it can't be derived, in which case callers fall back to the exercise's own sets.
 */
export function getEffectiveSets(programme: Programme, currentWeek: number): number | null {
  const week = getProgrammeWeek(programme, currentWeek);
  const n = parseInt(week?.sets ?? "", 10);
  return Number.isNaN(n) ? null : n;
}

/**
 * Session keys that count as "block"/lifting sessions active in the given week.
 * Days with a `fromWeek` greater than currentWeek are not yet active (e.g. Barry's
 * strength only starts in Week 3), so they're excluded.
 */
export function blockSessionKeys(programme: Programme, currentWeek = 99): Set<string> {
  return new Set(
    programme.weeklySchedule
      .filter((d) => d.type === "lift" && d.sessionKey && (d.fromWeek ?? 1) <= currentWeek)
      .map((d) => d.sessionKey as string),
  );
}
