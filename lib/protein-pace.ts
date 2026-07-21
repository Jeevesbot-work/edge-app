// Protein Pace message composition.
//
// This is where the Back2Strong tone rules live — "awareness before tracking",
// a coach noticing rather than an app grading. The rules here are deliberate
// brand constraints, not stylistic preferences:
//   - NEVER put a raw percentage or exact gram count in the title. Use a status
//     word only ("behind" / "on track" / "ahead").
//   - Never shame: no "failed", "missed", "behind schedule".
//   - Personalise from barrier_tags when relevant.
//   - The body offers 2-3 concrete recipe suggestions pulled from the DB.
//
// Kept free of any DB/Node imports so it can be unit-tested and reasoned about
// in isolation.

export type PaceStatus = "behind" | "on_track" | "ahead";

export interface RecipeSuggestion {
  title: string;
  protein_g: number | null;
  tags: string[] | null;
}

export interface NudgeInput {
  firstName: string;
  proteinToday: number;
  proteinTarget: number;
  barrierTags: string[];
  isEvening: boolean;
  recipes: RecipeSuggestion[]; // already filtered/ordered by the caller
}

export interface ComposedNudge {
  title: string;
  body: string;
  url: string;
}

// Status is computed from the numbers, but the number itself never leaves this
// function — only the word does.
export function paceStatus(proteinToday: number, proteinTarget: number): PaceStatus {
  if (proteinTarget <= 0) return "on_track";
  const ratio = proteinToday / proteinTarget;
  if (ratio < 0.7) return "behind";
  if (ratio > 1.05) return "ahead";
  return "on_track";
}

// "200g chicken" -> a short "Chicken — 40g" style chip for the notification body.
function recipeChip(r: RecipeSuggestion): string {
  return r.protein_g != null ? `${r.title} (${r.protein_g}g)` : r.title;
}

function hasTag(tags: string[] | null | undefined, tag: string): boolean {
  return !!tags && tags.some((t) => t.toLowerCase() === tag.toLowerCase());
}

/**
 * Compose the push title + body. Title uses a status WORD, never a number.
 * Body personalises from barrier_tags and lists 2-3 recipe suggestions.
 */
export function composeNudge(input: NudgeInput): ComposedNudge {
  const { firstName, barrierTags, isEvening, recipes } = input;
  const picks = recipes.slice(0, 3);
  const chips = picks.map(recipeChip);

  // --- Title: status word only, warm, coach-noticing. No numbers, no shame. ---
  // We only ever send when the client is genuinely short, so the title leans
  // "a coach noticing", not "you're behind".
  const name = firstName ? `${firstName}, ` : "";
  const title = isEvening
    ? `${name}quick protein idea?`.replace(/^./, (c) => c.toUpperCase())
    : `${name}protein's a bit light today`.replace(/^./, (c) => c.toUpperCase());

  // --- Body: personalise on barrier_tags where relevant. ---
  let opener: string;
  if (hasTag(barrierTags, "grabs_food_on_the_go") && isEvening) {
    opener = "Been a busy one? Here's a quick top-up that travels well:";
  } else if (hasTag(barrierTags, "skips_meals")) {
    opener = "Easy to let this slide on a full day. A couple that take no effort:";
  } else if (hasTag(barrierTags, "low_appetite")) {
    opener = "No need to force a big meal — small and protein-dense does it:";
  } else if (isEvening) {
    opener = "Bit short on protein today. A couple of easy wins before bed:";
  } else {
    opener = "Bit short on protein today. A couple of easy options:";
  }

  const suggestions =
    chips.length > 0
      ? ` ${chips.join(" · ")}.`
      : " A palm of chicken, a pot of skyr, or a couple of eggs will do it.";

  const body = `${opener}${suggestions}`;

  return {
    title,
    body,
    // Deep-link straight to the meal-log screen so acting on it is one tap.
    url: "/nutrition",
  };
}
