// Live recipe library — read from the Supabase `public.recipes` table using the
// client's authenticated session (RLS policy `recipes_read_all_authenticated`
// allows the `authenticated` role to SELECT rows where published = true).
//
// This replaces the old hard-coded lists (lib/recipes.ts / back2strong_recipes.json)
// as the source of truth for the Fuel tab's recipe library.

export type RecipeCategory = "breakfast" | "lunch" | "dinner" | "snack";

export interface LiveRecipe {
  id: string;
  title: string;
  slug: string;
  category: RecipeCategory;
  description: string | null;
  servings: number | null;
  prep_time_mins: number | null;
  cook_time_mins: number | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  ingredients: string[];
  method: string[];
  coach_note: string | null;
  tags: string[] | null;
  image_url: string | null;
}

// The columns we read — kept explicit so we never pull `published` etc. needlessly.
export const RECIPE_COLUMNS =
  "id,title,slug,category,description,servings,prep_time_mins,cook_time_mins,calories,protein_g,carbs_g,fat_g,ingredients,method,coach_note,tags,image_url";

export const CATEGORY_ORDER: RecipeCategory[] = ["breakfast", "lunch", "dinner", "snack"];

export const CATEGORY_LABEL: Record<RecipeCategory, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

// Order recipes by the fixed category sequence, then alphabetically by title.
export function sortRecipes(recipes: LiveRecipe[]): LiveRecipe[] {
  return [...recipes].sort((a, b) => {
    const ci = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
    if (ci !== 0) return ci;
    return a.title.localeCompare(b.title);
  });
}

export function totalTimeMins(r: LiveRecipe): number {
  return (r.prep_time_mins ?? 0) + (r.cook_time_mins ?? 0);
}
