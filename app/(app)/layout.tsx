import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import BottomNav from "@/components/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let user = null;
  let profile = null;

  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;

    if (user) {
      const admin = createAdminClient();
      const { data: profileData } = await admin
        .from("profiles")
        .select("approved, full_name")
        .eq("id", user.id)
        .single();
      profile = profileData;
    }
  } catch {
    // Supabase unavailable — fall through to redirect
  }

  if (!user) redirect("/login");

  // Admin bypasses profile/approval checks
  const isAdmin = user.email === process.env.ADMIN_EMAIL;
  if (!isAdmin) {
    if (!profile?.full_name) redirect("/onboarding");
    if (!profile?.approved) redirect("/pending");
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: "#0E1014" }}>
      {children}
      <BottomNav />
    </div>
  );
}
