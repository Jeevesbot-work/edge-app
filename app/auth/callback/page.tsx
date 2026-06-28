"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Signing you in...");

  useEffect(() => {
    async function handleCallback() {
      const supabase = createClient();

      // --- Implicit flow: access_token in hash ---
      const hash = window.location.hash.slice(1);
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (error) {
          setStatus("setSession error: " + error.message);
          return;
        }
      } else {
        // --- PKCE flow: code in query params ---
        const code = new URLSearchParams(window.location.search).get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setStatus("Link expired. Sending you back...");
            setTimeout(() => router.replace("/login?error=expired"), 1500);
            return;
          }
        } else {
          // --- token_hash in query params (email OTP) ---
          const token_hash = new URLSearchParams(window.location.search).get("token_hash");
          const type = new URLSearchParams(window.location.search).get("type") as "email" | "signup" | "magiclink" | null;
          if (token_hash && type) {
            const { error } = await supabase.auth.verifyOtp({ token_hash, type });
            if (error) {
              setStatus("Error: " + error.message);
              return;
            }
          } else {
            // No token found at all — check if session already exists
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
              setStatus("Link expired. Sending you back...");
              setTimeout(() => router.replace("/login?error=expired"), 1500);
              return;
            }
          }
        }
      }

      // Authenticated — check profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("approved, full_name")
        .eq("id", user.id)
        .single();

      if (!profile?.full_name) {
        router.replace("/onboarding");
      } else if (!profile?.approved) {
        router.replace("/pending");
      } else {
        router.replace("/home");
      }
    }

    handleCallback();
  }, [router]);

  return (
    <div style={{ minHeight: "100svh", background: "#0E1014", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
      <div style={{ width: 36, height: 36, border: "2px solid #C8965A", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 18, color: "#F2F1ED" }}>{status}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
