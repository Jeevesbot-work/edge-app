"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types";

const GOAL_LABELS: Record<string, string> = {
  stronger: "Get stronger",
  back: "Fix back and movement",
  energy: "More energy and vitality",
  fat: "Lose body fat",
  identity: "Rebuild identity",
  all: "All of the above",
};

const STATE_LABELS: Record<string, string> = {
  none: "Not training at all",
  occasional: "Training occasionally",
  inconsistent: "Training inconsistently",
  regular: "Training regularly, not progressing",
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);
      setLoading(false);
    }
    load();
  }, [router]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-edge-bg flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-edge-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-edge-bg max-w-lg mx-auto px-4 pt-safe pb-24">
      <div className="flex items-center gap-3 py-4 mb-4">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-edge-surface border border-white/10 flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-condensed font-black text-2xl uppercase tracking-wide">Profile</h1>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center py-6 mb-6">
        <div className="w-20 h-20 rounded-full bg-edge-red flex items-center justify-center mb-3">
          <span className="font-condensed font-black text-3xl text-white">
            {profile?.full_name?.[0]?.toUpperCase() ?? "?"}
          </span>
        </div>
        <h2 className="font-condensed font-bold text-2xl uppercase tracking-wide text-white">
          {profile?.full_name ?? "Unknown"}
        </h2>
        <p className="text-edge-muted text-sm">{profile?.email}</p>
        <span className={`mt-2 text-xs font-condensed uppercase px-3 py-1 rounded-lg ${profile?.approved ? "bg-green-500/20 text-green-400" : "bg-edge-red/20 text-edge-red"}`}>
          {profile?.approved ? "Active member" : "Pending approval"}
        </span>
      </div>

      {/* Details */}
      <div className="bg-edge-surface rounded-xl border border-white/[0.08] divide-y divide-white/[0.06] mb-4">
        {[
          { label: "Age", value: profile?.age ? `${profile.age}` : "—" },
          { label: "Goal", value: profile?.goal ? GOAL_LABELS[profile.goal] ?? profile.goal : "—" },
          { label: "Starting point", value: profile?.training_state ? STATE_LABELS[profile.training_state] ?? profile.training_state : "—" },
          { label: "Days per week", value: profile?.days_per_week ? `${profile.days_per_week} sessions` : "3 sessions" },
          { label: "Injuries", value: profile?.injuries || "None flagged" },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between px-4 py-3">
            <span className="text-edge-muted text-sm font-body">{label}</span>
            <span className="text-white text-sm font-body text-right max-w-[60%]">{value}</span>
          </div>
        ))}
      </div>

      {/* Brand lines */}
      <div className="bg-edge-surface rounded-xl p-4 border border-edge-gold/20 mb-6">
        <p className="text-edge-gold font-condensed font-bold text-sm italic">
          "You're still that man. You're just buried."
        </p>
      </div>

      {/* Sign out */}
      <button
        onClick={signOut}
        className="w-full bg-edge-surface border border-white/10 text-white/60 font-condensed font-bold text-base uppercase tracking-widest py-4 rounded-xl active:bg-white/5"
      >
        Sign Out
      </button>
    </div>
  );
}
