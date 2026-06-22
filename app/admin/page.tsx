import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect("/login");
  }

  const admin = createAdminClient();

  const { data: profiles } = await admin
    .from("profiles")
    .select("*, programme_state(*), check_ins(count), training_sessions(count), messages(count)")
    .order("created_at", { ascending: false });

  const pending = (profiles ?? []).filter((p) => !p.approved);
  const active = (profiles ?? []).filter((p) => p.approved);

  return (
    <div className="min-h-screen bg-edge-bg max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-condensed font-black text-4xl uppercase tracking-wide">Admin</h1>
          <p className="text-edge-muted text-sm mt-1">Back2Strong · Edge App</p>
        </div>
        <div className="text-right">
          <p className="font-condensed font-bold text-2xl text-white">{active.length}</p>
          <p className="text-edge-muted text-xs">Active members</p>
        </div>
      </div>

      <Link href="/admin/add-client">
        <div className="bg-edge-bronze/10 border border-edge-bronze/30 rounded-xl p-4 flex items-center gap-4 mb-8 active:bg-edge-bronze/20 transition-colors">
          <div className="w-10 h-10 rounded-full bg-edge-bronze/20 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="#C8965A" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <p className="font-condensed font-bold text-sm text-white uppercase tracking-wide">Add New Client</p>
            <p className="text-edge-muted text-xs">Create profile, set programme, send access link</p>
          </div>
        </div>
      </Link>

      {/* Pending approval */}
      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-red mb-3">
            Pending Approval ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map((p) => (
              <Link key={p.id} href={`/admin/users/${p.id}`}>
                <div className="bg-edge-surface rounded-xl p-4 border border-edge-red/30 flex items-center gap-4 active:bg-white/5">
                  <div className="w-10 h-10 rounded-full bg-edge-red/20 flex items-center justify-center flex-shrink-0">
                    <span className="font-condensed font-bold text-sm text-edge-red">
                      {(p.full_name ?? p.email)[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-sm text-white">{p.full_name ?? "Unnamed"}</p>
                    <p className="text-edge-muted text-xs truncate">{p.email}</p>
                    <p className="text-edge-muted text-xs mt-0.5">
                      Goal: {p.goal ?? "—"} · Age: {p.age ?? "—"}
                    </p>
                  </div>
                  <span className="bg-edge-red/20 text-edge-red font-condensed text-xs uppercase px-2 py-1 rounded-lg flex-shrink-0">
                    Pending
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Active members */}
      <div>
        <h2 className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted mb-3">
          Active Members ({active.length})
        </h2>
        <div className="space-y-2">
          {active.map((p) => {
            const prog = Array.isArray(p.programme_state) ? p.programme_state[0] : p.programme_state;
            const checkInCount = Array.isArray(p.check_ins) ? p.check_ins[0]?.count ?? 0 : 0;
            const sessionCount = Array.isArray(p.training_sessions) ? p.training_sessions[0]?.count ?? 0 : 0;
            return (
              <Link key={p.id} href={`/admin/users/${p.id}`}>
                <div className="bg-edge-surface rounded-xl p-4 border border-white/[0.08] flex items-center gap-4 active:bg-white/5">
                  <div className="w-10 h-10 rounded-full bg-edge-gold/20 flex items-center justify-center flex-shrink-0">
                    <span className="font-condensed font-bold text-sm text-edge-gold">
                      {(p.full_name ?? p.email)[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-sm text-white">{p.full_name ?? "Unnamed"}</p>
                    <p className="text-edge-muted text-xs truncate">{p.email}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-edge-muted text-xs">Day {prog?.current_day ?? 1}</span>
                      <span className="text-edge-muted text-xs">{sessionCount} sessions</span>
                      <span className="text-edge-muted text-xs">{checkInCount} check-ins</span>
                    </div>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-edge-muted flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
