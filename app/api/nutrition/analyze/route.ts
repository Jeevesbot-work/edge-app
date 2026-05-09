import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("[nutrition] ANTHROPIC_API_KEY not set");
      return NextResponse.json({ error: "AI not configured" }, { status: 500 });
    }

    const { image, mimeType } = await req.json();
    if (!image) return NextResponse.json({ error: "No image" }, { status: 400 });

    const validType = (mimeType === "image/jpeg" || mimeType === "image/png" || mimeType === "image/webp")
      ? mimeType
      : "image/jpeg";

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 400,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: validType,
              data: image,
            },
          },
          {
            type: "text",
            text: `You are a nutrition analyst for a men's fitness coaching app. Analyse this food photo and respond ONLY with a JSON object — no other text, no markdown, no code fences.

The JSON must have exactly these fields:
{
  "meal_name": "short descriptive name of what you see",
  "calories": estimated total calories as integer,
  "protein_g": estimated protein in grams as number,
  "carbs_g": estimated carbs in grams as number,
  "fat_g": estimated fat in grams as number,
  "edge_comment": "a 1-2 sentence comment in the voice of Edge — a direct, warm British male coach. No emojis. No hype. Acknowledge the food choice honestly then connect it to the protein-first philosophy."
}

Be realistic with estimates. If you cannot identify food clearly, give your best guess and name it accordingly. Always return the JSON object.`,
          }
        ]
      }]
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";

    let analysis: {
      meal_name: string;
      calories: number;
      protein_g: number;
      carbs_g: number;
      fat_g: number;
      edge_comment: string;
    };

    try {
      analysis = JSON.parse(raw);
    } catch {
      console.error("[nutrition] Failed to parse Claude response:", raw);
      return NextResponse.json({ error: "Could not analyse the image" }, { status: 422 });
    }

    const { data: log, error } = await supabase
      .from("nutrition_logs")
      .insert({
        user_id: user.id,
        meal_name: analysis.meal_name,
        calories: Math.round(analysis.calories),
        protein_g: analysis.protein_g,
        carbs_g: analysis.carbs_g,
        fat_g: analysis.fat_g,
        edge_comment: analysis.edge_comment,
      })
      .select()
      .single();

    if (error) {
      console.error("[nutrition] DB insert error:", error);
      return NextResponse.json({ error: "Failed to save log" }, { status: 500 });
    }

    return NextResponse.json(log);
  } catch (err) {
    console.error("[nutrition] Unhandled error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
