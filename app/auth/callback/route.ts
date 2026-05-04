import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check if profile exists and is approved
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("approved, full_name")
          .eq("id", user.id)
          .single();

        if (!profile?.full_name) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
        if (!profile?.approved) {
          return NextResponse.redirect(`${origin}/pending`);
        }
        return NextResponse.redirect(`${origin}/home`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
