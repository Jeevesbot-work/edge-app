import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("approved, full_name")
    .eq("id", user.id)
    .single();

  if (!profile?.full_name) {
    redirect("/onboarding");
  }

  if (!profile?.approved) {
    redirect("/pending");
  }

  return (
    <div className="min-h-screen bg-edge-bg pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
