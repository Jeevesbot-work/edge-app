import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ApproveButton from "./ApproveButton";
import AddNoteForm from "./AddNoteForm";
import ResendLinkButton from "./ResendLinkButton";
import AssignProgrammeButton from "./AssignProgrammeButton";

export default async function AdminUserPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect("/login");

  const admin = createAdminClient();
  const userId = params.id;

  const [
    { data: profile },
    { data: programme },
    { data: checkIns },
    { data: messages },
    { data: adminNotes },
  ] = await Promise.all([
    admin.from("profiles").select("*").eq("id", userId).single(),
    admin.from("programme_state").select("*").eq("user_id", userId).single(),
    admin.from("check_ins").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(14),
    admin.from("messages").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
    admin.from("admin_notes").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
  ]);

  const avgEnergy = checkIns?.length
    ? (checkIns.reduce((s, c) => s + c.morning_energy, 0) / checkIns.length).toFixed(1)
    : "—";

  return (
    <div className="min-h-screen bg-edge-bg max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="w-9 h-9 rounded-xl bg-edge-surface border border-white/10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="font-condensed font-black text-2xl uppercase tracking-wide">{profile?.full_name ?? "Unknown"}</h1>
          <p className="text-edge-muted text-xs">{profile?.email}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!profile?.approved && <ApproveButton userId={userId} />}
          {profile?.approved && (
            <span className="bg-green-500/20 text-green-400 font-condensed text-xs uppercase px-3 py-1.5 rounded-lg">Active</span>
          )}
          {profile?.email && <ResendLinkButton email={profile.email} />}
        </div>
      </div>

      {/* Profile summary */}
      <div className="bg-edge-surface rounded-xl p-4 border border-white/[0.08] mb-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Age", value: profile?.age ?? "—" },
            { label: "Goal", value: profile?.goal ?? "—" },
            { label: "Training", value: profile?.training_state ?? "—" },
            { label: "Days/week", value: profile?.days_per_week ?? 3 },
            { label: "Programme day", value: programme?.current_day ?? 1 },
            { label: "Avg energy", value: `${avgEnergy}/5` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-edge-muted text-xs uppercase tracking-widest font-condensed">{label}</p>
              <p className="text-white font-body text-sm mt-0.5 capitalize">{String(value)}</p>
            </div>
          ))}
        </div>
        {profile?.injuries && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-edge-muted text-xs uppercase tracking-widest mb-1">Injuries</p>
            <p className="text-white/80 text-sm font-body">{profile.injuries}</p>
          </div>
        )}
      </div>

      {/* Assign programme */}
      <div className="mb-4">
        <h2 className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted mb-3">
          Assign Programme
        </h2>
        <AssignProgrammeButton userId={userId} />
      </div>

      {/* Admin notes */}
      <div className="mb-4">
        <h2 className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted mb-3">
          Notes (visible to Edge)
        </h2>
        {adminNotes && adminNotes.length > 0 && (
          <div className="space-y-2 mb-3">
            {adminNotes.map((n) => (
              <div key={n.id} className="bg-edge-surface rounded-xl p-3 border border-edge-gold/20">
                <p className="text-white/80 font-body text-sm">{n.note}</p>
                <p className="text-edge-muted text-xs mt-1">
                  {new Date(n.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        )}
        <AddNoteForm userId={userId} />
      </div>

      {/* Check-ins */}
      <div className="mb-4">
        <h2 className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted mb-3">
          Recent Check-ins
        </h2>
        <div className="space-y-2">
          {checkIns?.slice(0, 7).map((c) => (
            <div key={c.id} className="bg-edge-surface rounded-xl p-3 border border-white/[0.08]">
              <div className="flex justify-between mb-1">
                <span className="text-white text-xs font-body">{c.date}</span>
                <span className="text-edge-gold text-xs font-condensed">E:{c.morning_energy} S:{c.sleep_quality} St:{c.stress_level}</span>
              </div>
              {c.notes && <p className="text-edge-muted text-xs italic">"{c.notes}"</p>}
              {c.edge_response && <p className="text-white/60 text-xs mt-1 border-t border-white/10 pt-1">{c.edge_response}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Recent messages */}
      <div className="mb-4">
        <h2 className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted mb-3">
          Recent Edge Conversations
        </h2>
        <div className="space-y-2">
          {messages?.slice(0, 10).reverse().map((m) => (
            <div key={m.id} className={`rounded-xl p-3 text-sm font-body ${m.role === "user" ? "bg-edge-gold/10 border border-edge-gold/20 text-white/80" : "bg-edge-surface border border-edge-gold/20 text-white/70"}`}>
              <span className="text-xs uppercase font-condensed mr-2" style={{ color: m.role === "user" ? "#F5A623" : "#F5A623" }}>
                {m.role === "user" ? "Member" : "Edge"}
              </span>
              {m.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
