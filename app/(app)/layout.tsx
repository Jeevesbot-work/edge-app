import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import BottomNav from "@/components/BottomNav";
import ExitPreviewButton from "@/components/ExitPreviewButton";

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

  const ADMIN_EMAILS = ["n.adams3@icloud.com", "nicosmada3@googlemail.com", "nick@back2strong.online"];
  const isAdmin = ADMIN_EMAILS.includes(user.email ?? "");

  if (!isAdmin) {
    if (!profile?.full_name) redirect("/onboarding");
    if (!profile?.approved) redirect("/pending");
  }

  const cookieStore = cookies();
  const previewId = cookieStore.get("preview_user_id")?.value;
  let previewName: string | null = null;
  if (isAdmin && previewId) {
    const admin = createAdminClient();
    const { data: previewProfile } = await admin.from("profiles").select("full_name").eq("id", previewId).single();
    previewName = previewProfile?.full_name ?? "Client";
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: "#0E1014" }}>
      {isAdmin && previewId ? (
        <div style={{ background: "#C8965A", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, color: "#0A0A0A", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Previewing: {previewName}
          </p>
          <ExitPreviewButton />
        </div>
      ) : isAdmin ? (
        <a href="/admin" style={{
          display: "block", background: "#C8965A", textAlign: "center",
          padding: "8px 16px", fontFamily: "Inter, sans-serif", fontSize: 11,
          fontWeight: 700, color: "#0E1014", textTransform: "uppercase", letterSpacing: "0.15em",
        }}>
          ← Admin Panel
        </a>
      ) : null}
      {children}
      <BottomNav />
    </div>
  );
}
