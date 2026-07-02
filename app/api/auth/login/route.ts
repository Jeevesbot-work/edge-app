import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: `${APP_URL}/auth/callback` },
  });

  if (error || !data?.properties?.action_link) {
    return NextResponse.json({ error: error?.message ?? "Failed to generate link" }, { status: 500 });
  }

  // Build a token_hash verification link (PKCE-independent). Server-generated
  // links have no browser code-verifier, so the default action_link's code-exchange
  // always fails ("link expired"). The callback's verifyOtp path handles this cleanly.
  const tokenHash = data.properties.hashed_token;
  const verificationType = data.properties.verification_type ?? "magiclink";
  const magicLink = `${APP_URL}/auth/callback?token_hash=${tokenHash}&type=${verificationType}`;

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Nick Adams · Back2Strong <nick@back2strong.online>",
      to: email,
      subject: "Your sign-in link for Edge",
      html: `
        <div style="background:#0E1014;padding:48px 32px;font-family:Arial,sans-serif;max-width:480px;margin:0 auto;border-radius:16px;">
          <p style="color:#9BA3AF;font-size:11px;text-transform:uppercase;letter-spacing:0.2em;margin:0 0 24px;">Back2Strong · Edge</p>
          <p style="color:#F2F1ED;font-size:28px;font-family:Georgia,serif;font-weight:400;margin:0 0 16px;line-height:1.2;">Your sign-in link.</p>
          <p style="color:rgba(242,241,237,0.55);font-size:14px;margin:0 0 32px;line-height:1.6;">Click the button below to sign in. This link expires in 2 hours and can only be used once.</p>
          <a href="${magicLink}" style="display:block;background:#C8965A;border-radius:12px;padding:14px 24px;text-decoration:none;text-align:center;color:#0E1014;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;">Sign in to Edge →</a>
          <p style="color:#3D434D;font-size:11px;margin:24px 0 0;text-align:center;">If you didn't request this, ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!resendRes.ok) {
    const err = await resendRes.json().catch(() => ({}));
    return NextResponse.json({ error: err.message ?? "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
