import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { buildSystemPrompt } from "@/lib/claude/prompts";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { message } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "No message" }, { status: 400 });

  const [
    { data: profile },
    { data: programme },
    { data: recentCheckIns },
    { data: recentSessions },
    { data: lessonProgress },
    { data: adminNotes },
    { data: messageHistory },
    { count: messageCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("programme_state").select("*").eq("user_id", user.id).single(),
    supabase.from("check_ins").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(7),
    supabase.from("training_sessions").select("*").eq("user_id", user.id).not("completed_at", "is", null).order("completed_at", { ascending: false }).limit(5),
    supabase.from("lesson_completions").select("*").eq("user_id", user.id),
    supabase.from("admin_notes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("messages").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    supabase.from("messages").select("*", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  const systemPrompt = buildSystemPrompt({
    profile: profile!,
    programme: programme ?? null,
    recentCheckIns: recentCheckIns ?? [],
    recentSessions: recentSessions ?? [],
    lessonProgress: lessonProgress ?? [],
    adminNotes: adminNotes ?? [],
    messageCount: messageCount ?? 0,
  });

  const history = (messageHistory ?? [])
    .reverse()
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  await supabase.from("messages").insert({ user_id: user.id, role: "user", content: message });

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    system: systemPrompt,
    messages: [...history, { role: "user", content: message }],
  });

  let full = "";
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          full += chunk.delta.text;
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
      await supabase.from("messages").insert({ user_id: user.id, role: "assistant", content: full });
    },
  });

  return new NextResponse(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" },
  });
}
